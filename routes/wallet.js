const express = require("express")
const router = express.Router()
const db = require("../config/database")

// Get wallet balance
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM wallet LIMIT 1")
    if (rows.length === 0) {
      await db.execute("INSERT INTO wallet (balance) VALUES (0)")
      return res.json({ balance: 0 })
    }
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add money to wallet
router.post("/add", async (req, res) => {
  try {
    const { amount } = req.body
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" })
    }

    await db.execute("UPDATE wallet SET balance = balance + ? WHERE id = 1", [amount])
    const [rows] = await db.execute("SELECT * FROM wallet WHERE id = 1")
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Withdraw money from wallet
router.post("/withdraw", async (req, res) => {
  try {
    const { amount } = req.body
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" })
    }

    const [walletRows] = await db.execute("SELECT balance FROM wallet WHERE id = 1")
    if (walletRows[0].balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" })
    }

    await db.execute("UPDATE wallet SET balance = balance - ? WHERE id = 1", [amount])
    const [rows] = await db.execute("SELECT * FROM wallet WHERE id = 1")
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
