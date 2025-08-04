const express = require("express")
const router = express.Router()
const db = require("../config/database")

// Get watchlist
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(`
            SELECT w.*, s.symbol, s.name,
                   (SELECT close FROM stock_prices sp WHERE sp.stock_id = w.stock_id ORDER BY date DESC LIMIT 1) as current_price
            FROM watchlist w 
            JOIN stocks s ON w.stock_id = s.id 
            ORDER BY w.added_at DESC
        `)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add to watchlist
router.post("/add", async (req, res) => {
  try {
    const { stock_id, stock_name } = req.body

    // Check if already in watchlist
    const [existing] = await db.execute("SELECT * FROM watchlist WHERE stock_id = ?", [stock_id])
    if (existing.length > 0) {
      return res.status(400).json({ error: "Stock already in watchlist" })
    }

    await db.execute("INSERT INTO watchlist (stock_id, stock_name) VALUES (?, ?)", [stock_id, stock_name])
    res.json({ message: "Stock added to watchlist" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Remove from watchlist
router.delete("/:stock_id", async (req, res) => {
  try {
    await db.execute("DELETE FROM watchlist WHERE stock_id = ?", [req.params.stock_id])
    res.json({ message: "Stock removed from watchlist" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
