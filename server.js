const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// Routes
app.use("/api/stocks", require("./routes/stocks"))
app.use("/api/wallet", require("./routes/wallet"))
app.use("/api/transactions", require("./routes/transactions"))
app.use("/api/holdings", require("./routes/holdings"))
app.use("/api/watchlist", require("./routes/watchlist"))

// Serve frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
