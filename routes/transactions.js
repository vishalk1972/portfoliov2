const express = require("express")
const router = express.Router()
const db = require("../config/database")

// Get all transactions
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(`
            SELECT t.*, s.symbol, s.name 
            FROM transactions t 
            JOIN stocks s ON t.stock_id = s.id 
            ORDER BY t.date DESC
        `)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Buy stock
router.post("/buy", async (req, res) => {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    const { stock_id, quantity, price } = req.body
    const total_price = quantity * price

    // Check wallet balance
    const [walletRows] = await connection.execute("SELECT balance FROM wallet WHERE id = 1")
    if (walletRows[0].balance < total_price) {
      throw new Error("Insufficient balance")
    }

    // Deduct from wallet
    await connection.execute("UPDATE wallet SET balance = balance - ? WHERE id = 1", [total_price])

    // Add transaction
    await connection.execute(
      "INSERT INTO transactions (stock_id, price, quantity, total_price, transaction_type) VALUES (?, ?, ?, ?, 1)",
      [stock_id, price, quantity, total_price],
    )

    // Update holdings
    const [holdingRows] = await connection.execute("SELECT * FROM holdings WHERE stock_id = ?", [stock_id])

    if (holdingRows.length === 0) {
      // New holding
      await connection.execute(
        "INSERT INTO holdings (stock_id, quantity, total_price_bought, total_current_value, profit_loss, profit_loss_percentage) VALUES (?, ?, ?, ?, 0, 0)",
        [stock_id, quantity, total_price, quantity * price],
      )
    } else {
      // Update existing holding
      const holding = holdingRows[0]
      const newQuantity = holding.quantity + quantity
      const newTotalPriceBought = holding.total_price_bought + total_price
      const newCurrentValue = newQuantity * price
      const profitLoss = newCurrentValue - newTotalPriceBought
      const profitLossPercentage = (profitLoss / newTotalPriceBought) * 100

      await connection.execute(
        "UPDATE holdings SET quantity = ?, total_price_bought = ?, total_current_value = ?, profit_loss = ?, profit_loss_percentage = ? WHERE stock_id = ?",
        [newQuantity, newTotalPriceBought, newCurrentValue, profitLoss, profitLossPercentage, stock_id],
      )
    }

    await connection.commit()
    res.json({ message: "Stock purchased successfully" })
  } catch (error) {
    await connection.rollback()
    res.status(500).json({ error: error.message })
  } finally {
    connection.release()
  }
})

// Sell stock
router.post("/sell", async (req, res) => {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    const { stock_id, quantity, price } = req.body
    const total_price = quantity * price

    // Check if user has enough holdings
    const [holdingRows] = await connection.execute("SELECT * FROM holdings WHERE stock_id = ?", [stock_id])
    if (holdingRows.length === 0 || holdingRows[0].quantity < quantity) {
      throw new Error("Insufficient holdings")
    }

    // Add to wallet
    await connection.execute("UPDATE wallet SET balance = balance + ? WHERE id = 1", [total_price])

    // Add transaction
    await connection.execute(
      "INSERT INTO transactions (stock_id, price, quantity, total_price, transaction_type) VALUES (?, ?, ?, ?, 0)",
      [stock_id, price, quantity, total_price],
    )

    // Update holdings
    const holding = holdingRows[0]
    const newQuantity = holding.quantity - quantity

    if (newQuantity === 0) {
      // Delete holding if quantity becomes 0
      await connection.execute("DELETE FROM holdings WHERE stock_id = ?", [stock_id])
    } else {
      // Update holding
      const avgBuyPrice = holding.total_price_bought / holding.quantity
      const newTotalPriceBought = newQuantity * avgBuyPrice
      const newCurrentValue = newQuantity * price
      const profitLoss = newCurrentValue - newTotalPriceBought
      const profitLossPercentage = (profitLoss / newTotalPriceBought) * 100

      await connection.execute(
        "UPDATE holdings SET quantity = ?, total_price_bought = ?, total_current_value = ?, profit_loss = ?, profit_loss_percentage = ? WHERE stock_id = ?",
        [newQuantity, newTotalPriceBought, newCurrentValue, profitLoss, profitLossPercentage, stock_id],
      )
    }

    await connection.commit()
    res.json({ message: "Stock sold successfully" })
  } catch (error) {
    await connection.rollback()
    res.status(500).json({ error: error.message })
  } finally {
    connection.release()
  }
})

module.exports = router
