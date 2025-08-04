const express = require("express")
const router = express.Router()
const db = require("../config/database")

// Get all holdings
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(`
            SELECT h.*, s.symbol, s.name 
            FROM holdings h 
            JOIN stocks s ON h.stock_id = s.id 
            ORDER BY h.total_current_value DESC
        `)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get portfolio summary
router.get("/summary", async (req, res) => {
  try {
    const [rows] = await db.execute(`
            SELECT 
                SUM(total_current_value) as total_value,
                SUM(total_price_bought) as total_invested,
                SUM(profit_loss) as total_profit_loss,
                AVG(profit_loss_percentage) as avg_profit_loss_percentage
            FROM holdings
        `)
    res.json(rows[0] || { total_value: 0, total_invested: 0, total_profit_loss: 0, avg_profit_loss_percentage: 0 })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
