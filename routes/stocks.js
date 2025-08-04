const express = require("express")
const router = express.Router()
const db = require("../config/database")

// Get all stocks
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM stocks ORDER BY symbol")
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Search stocks
router.get("/search/:query", async (req, res) => {
  try {
    const query = `%${req.params.query}%`
    const [rows] = await db.execute("SELECT * FROM stocks WHERE symbol LIKE ? OR name LIKE ? ORDER BY symbol", [
      query,
      query,
    ])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get stock by ID with current price
router.get("/:id", async (req, res) => {
  try {
    const [stockRows] = await db.execute("SELECT * FROM stocks WHERE id = ?", [req.params.id])
    if (stockRows.length === 0) {
      return res.status(404).json({ error: "Stock not found" })
    }

    const [priceRows] = await db.execute("SELECT * FROM stock_prices WHERE stock_id = ? ORDER BY date DESC LIMIT 1", [
      req.params.id,
    ])

    const stock = stockRows[0]
    stock.currentPrice = priceRows.length > 0 ? priceRows[0].close : 0

    res.json(stock)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get stock price history
router.get("/:id/prices", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM stock_prices WHERE stock_id = ? ORDER BY date DESC LIMIT 30", [
      req.params.id,
    ])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
