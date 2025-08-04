// Application State
let currentStock = null
let currentPage = "dashboard"

// Declare variables
const api = {} // Placeholder for API object
const initializeCharts = () => {} // Placeholder for initializeCharts function
const handleError = (error, context) => console.error(`${context} error:`, error) // Placeholder for handleError function
const safeSetTextContent = (id, text) => {
  const element = document.getElementById(id)
  if (element) element.textContent = text
} // Placeholder for safeSetTextContent function
const formatCurrency = (value) => value.toFixed(2) // Placeholder for formatCurrency function
const formatPercentage = (value) => `${value.toFixed(2)}%` // Placeholder for formatPercentage function
const updatePortfolioChart = (data) => {} // Placeholder for updatePortfolioChart function
const updatePerformanceChart = (data) => {} // Placeholder for updatePerformanceChart function
const formatDateTime = (date) => date.toLocaleString() // Placeholder for formatDateTime function
const debounce = (func, wait) => {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
} // Placeholder for debounce function
const initializePriceChart = (data) => {} // Placeholder for initializePriceChart function
const openModal = (id) => {
  document.getElementById(id).classList.add("active")
} // Placeholder for openModal function
const showNotification = (message, type) => {
  console.log(`${type}: ${message}`)
} // Placeholder for showNotification function
const closeModal = (id) => {
  document.getElementById(id).classList.remove("active")
} // Placeholder for closeModal function
const validateNumber = (value, min) => !isNaN(value) && value >= min // Placeholder for validateNumber function

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

async function initializeApp() {
  try {
    // Initialize navigation
    initializeNavigation()

    // Initialize modals
    initializeModals()

    // Initialize charts
    initializeCharts()

    // Load initial data
    await loadDashboard()

    // Initialize search
    initializeSearch()

    // Initialize wallet actions
    initializeWalletActions()

    console.log("Application initialized successfully")
  } catch (error) {
    handleError(error, "Application initialization")
  }
}

// Navigation
function initializeNavigation() {
  const navLinks = document.querySelectorAll(".nav-link")
  const mobileToggle = document.querySelector(".mobile-menu-toggle")
  const navMenu = document.querySelector(".nav-menu")

  // Desktop navigation
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const page = link.dataset.page
      navigateToPage(page)
    })
  })

  // Mobile navigation
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      mobileToggle.classList.toggle("active")

      const isExpanded = mobileToggle.classList.contains("active")
      mobileToggle.setAttribute("aria-expanded", isExpanded)
    })
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar")) {
      navMenu.classList.remove("active")
      if (mobileToggle) {
        mobileToggle.classList.remove("active")
        mobileToggle.setAttribute("aria-expanded", "false")
      }
    }
  })
}

async function navigateToPage(page) {
  try {
    // Update active nav link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active")
    })
    const activeLink = document.querySelector(`[data-page="${page}"]`)
    if (activeLink) {
      activeLink.classList.add("active")
    }

    // Hide all pages
    document.querySelectorAll(".page").forEach((p) => {
      p.classList.remove("active")
    })

    // Show target page
    const targetPage = document.getElementById(page)
    if (targetPage) {
      targetPage.classList.add("active")
    }
    currentPage = page

    // Load page data
    switch (page) {
      case "dashboard":
        await loadDashboard()
        break
      case "stocks":
        await loadStocks()
        break
      case "portfolio":
        await loadPortfolio()
        break
      case "watchlist":
        await loadWatchlist()
        break
      case "wallet":
        await loadWallet()
        break
      case "transactions":
        await loadTransactions()
        break
    }
  } catch (error) {
    handleError(error, `Navigation to ${page}`)
  }
}

// Dashboard
async function loadDashboard() {
  try {
    const [summary, holdings, transactions, wallet] = await Promise.all([
      api.holdings.getSummary(),
      api.holdings.getAll(),
      api.transactions.getAll(),
      api.wallet.getBalance(),
    ])

    // Update stats
    safeSetTextContent("portfolio-value", formatCurrency(summary.total_value || 0))
    safeSetTextContent("total-invested", formatCurrency(summary.total_invested || 0))
    safeSetTextContent("profit-loss", formatCurrency(summary.total_profit_loss || 0))
    safeSetTextContent("wallet-balance", formatCurrency(wallet.balance || 0))

    // Update profit/loss percentage
    const profitLossPercent = document.getElementById("profit-loss-percent")
    if (profitLossPercent) {
      const percentage = summary.avg_profit_loss_percentage || 0
      profitLossPercent.textContent = formatPercentage(percentage)
      profitLossPercent.className = `stat-change ${percentage >= 0 ? "positive" : "negative"}`
    }

    // Update charts
    updatePortfolioChart(holdings)
    updatePerformanceChart(holdings)

    // Update recent transactions
    updateRecentTransactions(transactions.slice(0, 5))
  } catch (error) {
    handleError(error, "Loading dashboard")
  }
}

function updateRecentTransactions(transactions) {
  const tbody = document.getElementById("recent-transactions-body")
  if (!tbody) return

  tbody.innerHTML = transactions
    .map(
      (transaction) => `
        <tr>
            <td>${transaction.symbol}</td>
            <td>
                <span class="badge ${transaction.transaction_type ? "success" : "danger"}">
                    ${transaction.transaction_type ? "Buy" : "Sell"}
                </span>
            </td>
            <td>${transaction.quantity}</td>
            <td>${formatCurrency(transaction.price)}</td>
            <td>${formatCurrency(transaction.total_price)}</td>
            <td>${formatDateTime(transaction.date)}</td>
        </tr>
    `,
    )
    .join("")
}

// Stocks
async function loadStocks() {
  try {
    const stocks = await api.stocks.getAll()
    displayStocks(stocks)
  } catch (error) {
    handleError(error, "Loading stocks")
  }
}

function displayStocks(stocks) {
  const grid = document.getElementById("stocks-grid")
  if (!grid) return

  grid.innerHTML = stocks
    .map(
      (stock) => `
        <div class="stock-card" data-stock-id="${stock.id}" role="button" tabindex="0" aria-label="View details for ${stock.name}">
            <h3>${stock.name}</h3>
            <p class="symbol">${stock.symbol}</p>
            <p class="price">Current Price: Loading...</p>
            <p class="volume">Volume: ${stock.volume.toLocaleString()}</p>
        </div>
    `,
    )
    .join("")

  // Add click handlers
  grid.querySelectorAll(".stock-card").forEach((card) => {
    const stockId = card.dataset.stockId

    card.addEventListener("click", () => openStockModal(stockId))
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        openStockModal(stockId)
      }
    })
  })

  // Load current prices
  loadCurrentPrices(stocks)
}

async function loadCurrentPrices(stocks) {
  for (const stock of stocks) {
    try {
      const prices = await api.stocks.getPrices(stock.id)
      if (prices.length > 0) {
        const currentPrice = prices[0].close
        const priceElement = document.querySelector(`[data-stock-id="${stock.id}"] .price`)
        if (priceElement) {
          priceElement.textContent = `Current Price: ${formatCurrency(currentPrice)}`
        }
      }
    } catch (error) {
      console.error(`Failed to load price for ${stock.symbol}:`, error)
    }
  }
}

// Search
function initializeSearch() {
  const searchInput = document.getElementById("stock-search")
  const searchBtn = document.getElementById("search-btn")

  if (!searchInput || !searchBtn) return

  const debouncedSearch = debounce(performSearch, 300)

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim()
    if (query.length >= 2) {
      debouncedSearch(query)
    } else if (query.length === 0) {
      loadStocks()
    }
  })

  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim()
    if (query) {
      performSearch(query)
    }
  })

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const query = searchInput.value.trim()
      if (query) {
        performSearch(query)
      }
    }
  })
}

async function performSearch(query) {
  try {
    const results = await api.stocks.search(query)
    displayStocks(results)
  } catch (error) {
    handleError(error, "Stock search")
  }
}

// Stock Modal
async function openStockModal(stockId) {
  try {
    const [stock, prices] = await Promise.all([api.stocks.getById(stockId), api.stocks.getPrices(stockId)])

    currentStock = stock

    // Update modal content
    safeSetTextContent("modal-stock-name", stock.name)
    safeSetTextContent("modal-stock-symbol", stock.symbol)
    safeSetTextContent("modal-current-price", stock.currentPrice || "0.00")

    // Initialize price chart
    if (prices.length > 0) {
      initializePriceChart(prices)
    }

    // Reset trade form
    const quantityInput = document.getElementById("trade-quantity")
    if (quantityInput) {
      quantityInput.value = "1"
    }

    openModal("stock-modal")
  } catch (error) {
    handleError(error, "Opening stock modal")
  }
}

// Portfolio
async function loadPortfolio() {
  try {
    const [holdings, summary] = await Promise.all([api.holdings.getAll(), api.holdings.getSummary()])

    // Update summary
    safeSetTextContent("total-holdings-count", holdings.length)

    if (holdings.length > 0) {
      const bestPerformer = holdings.reduce((best, current) =>
        current.profit_loss_percentage > best.profit_loss_percentage ? current : best,
      )
      const worstPerformer = holdings.reduce((worst, current) =>
        current.profit_loss_percentage < worst.profit_loss_percentage ? current : worst,
      )

      safeSetTextContent(
        "best-performer",
        `${bestPerformer.symbol} (${formatPercentage(bestPerformer.profit_loss_percentage)})`,
      )
      safeSetTextContent(
        "worst-performer",
        `${worstPerformer.symbol} (${formatPercentage(worstPerformer.profit_loss_percentage)})`,
      )
    }

    // Update holdings table
    updateHoldingsTable(holdings)
  } catch (error) {
    handleError(error, "Loading portfolio")
  }
}

function updateHoldingsTable(holdings) {
  const tbody = document.getElementById("holdings-body")
  if (!tbody) return

  tbody.innerHTML = holdings
    .map((holding) => {
      const avgBuyPrice = holding.total_price_bought / holding.quantity
      const profitLossClass = holding.profit_loss >= 0 ? "positive" : "negative"

      return `
            <tr>
                <td>
                    <strong>${holding.symbol}</strong><br>
                    <small>${holding.name}</small>
                </td>
                <td>${holding.quantity}</td>
                <td>${formatCurrency(avgBuyPrice)}</td>
                <td>${formatCurrency(holding.total_current_value)}</td>
                <td class="${profitLossClass}">${formatCurrency(holding.profit_loss)}</td>
                <td class="${profitLossClass}">${formatPercentage(holding.profit_loss_percentage)}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="openStockModal(${holding.stock_id})">
                        Trade
                    </button>
                </td>
            </tr>
        `
    })
    .join("")
}

// Watchlist
async function loadWatchlist() {
  try {
    const watchlist = await api.watchlist.getAll()
    updateWatchlistTable(watchlist)
  } catch (error) {
    handleError(error, "Loading watchlist")
  }
}

function updateWatchlistTable(watchlist) {
  const tbody = document.getElementById("watchlist-body")
  if (!tbody) return

  tbody.innerHTML = watchlist
    .map(
      (item) => `
        <tr>
            <td>
                <strong>${item.name}</strong>
            </td>
            <td>${item.symbol}</td>
            <td>${formatCurrency(item.current_price || 0)}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="openStockModal(${item.stock_id})">
                    Trade
                </button>
                <button class="btn btn-danger btn-sm" onclick="removeFromWatchlist(${item.stock_id})">
                    Remove
                </button>
            </td>
        </tr>
    `,
    )
    .join("")
}

async function removeFromWatchlist(stockId) {
  try {
    await api.watchlist.remove(stockId)
    showNotification("Stock removed from watchlist", "success")
    await loadWatchlist()
  } catch (error) {
    handleError(error, "Removing from watchlist")
  }
}

// Wallet
async function loadWallet() {
  try {
    const wallet = await api.wallet.getBalance()
    safeSetTextContent("current-balance", formatCurrency(wallet.balance))
  } catch (error) {
    handleError(error, "Loading wallet")
  }
}

function initializeWalletActions() {
  const addMoneyBtn = document.getElementById("add-money-btn")
  const withdrawMoneyBtn = document.getElementById("withdraw-money-btn")

  if (addMoneyBtn) {
    addMoneyBtn.addEventListener("click", () => openMoneyModal("add"))
  }

  if (withdrawMoneyBtn) {
    withdrawMoneyBtn.addEventListener("click", () => openMoneyModal("withdraw"))
  }
}

function openMoneyModal(action) {
  const modal = document.getElementById("money-modal")
  const title = document.getElementById("money-modal-title")
  const addBtn = document.getElementById("confirm-add-money")
  const withdrawBtn = document.getElementById("confirm-withdraw-money")
  const amountInput = document.getElementById("money-amount")

  if (title) title.textContent = action === "add" ? "Add Money" : "Withdraw Money"
  if (amountInput) amountInput.value = ""

  if (action === "add") {
    if (addBtn) addBtn.style.display = "inline-flex"
    if (withdrawBtn) withdrawBtn.style.display = "none"
  } else {
    if (addBtn) addBtn.style.display = "none"
    if (withdrawBtn) withdrawBtn.style.display = "inline-flex"
  }

  openModal("money-modal")
}

// Transactions
async function loadTransactions() {
  try {
    const transactions = await api.transactions.getAll()
    updateTransactionsTable(transactions)
  } catch (error) {
    handleError(error, "Loading transactions")
  }
}

function updateTransactionsTable(transactions) {
  const tbody = document.getElementById("transactions-body")
  if (!tbody) return

  tbody.innerHTML = transactions
    .map(
      (transaction) => `
        <tr>
            <td>${formatDateTime(transaction.date)}</td>
            <td>
                <strong>${transaction.symbol}</strong><br>
                <small>${transaction.name}</small>
            </td>
            <td>
                <span class="badge ${transaction.transaction_type ? "success" : "danger"}">
                    ${transaction.transaction_type ? "Buy" : "Sell"}
                </span>
            </td>
            <td>${transaction.quantity}</td>
            <td>${formatCurrency(transaction.price)}</td>
            <td>${formatCurrency(transaction.total_price)}</td>
        </tr>
    `,
    )
    .join("")
}

// Modal Management
function initializeModals() {
  // Close modal handlers
  document.querySelectorAll(".modal-close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal")
      if (modal) {
        closeModal(modal.id)
      }
    })
  })

  // Close modal on backdrop click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal(modal.id)
      }
    })
  })

  // Escape key to close modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const activeModal = document.querySelector(".modal.active")
      if (activeModal) {
        closeModal(activeModal.id)
      }
    }
  })

  // Trade actions
  const buyBtn = document.getElementById("buy-btn")
  const sellBtn = document.getElementById("sell-btn")
  const addToWatchlistBtn = document.getElementById("add-to-watchlist-btn")

  if (buyBtn) {
    buyBtn.addEventListener("click", () => executeTrade("buy"))
  }

  if (sellBtn) {
    sellBtn.addEventListener("click", () => executeTrade("sell"))
  }

  if (addToWatchlistBtn) {
    addToWatchlistBtn.addEventListener("click", addToWatchlist)
  }

  // Money actions
  const confirmAddBtn = document.getElementById("confirm-add-money")
  const confirmWithdrawBtn = document.getElementById("confirm-withdraw-money")

  if (confirmAddBtn) {
    confirmAddBtn.addEventListener("click", () => executeMoneyAction("add"))
  }

  if (confirmWithdrawBtn) {
    confirmWithdrawBtn.addEventListener("click", () => executeMoneyAction("withdraw"))
  }
}

async function executeTrade(action) {
  try {
    if (!currentStock) {
      throw new Error("No stock selected")
    }

    const quantityInput = document.getElementById("trade-quantity")
    const quantity = Number.parseInt(quantityInput?.value || "0")
    const price = currentStock.currentPrice

    if (!validateNumber(quantity, 1)) {
      throw new Error("Please enter a valid quantity")
    }

    if (!validateNumber(price, 0.01)) {
      throw new Error("Invalid stock price")
    }

    if (action === "buy") {
      await api.transactions.buy(currentStock.id, quantity, price)
      showNotification(`Successfully bought ${quantity} shares of ${currentStock.symbol}`, "success")
    } else {
      await api.transactions.sell(currentStock.id, quantity, price)
      showNotification(`Successfully sold ${quantity} shares of ${currentStock.symbol}`, "success")
    }

    closeModal("stock-modal")

    // Refresh current page data
    if (currentPage === "dashboard") {
      await loadDashboard()
    } else if (currentPage === "portfolio") {
      await loadPortfolio()
    }
  } catch (error) {
    handleError(error, `${action} transaction`)
  }
}

async function addToWatchlist() {
  try {
    if (!currentStock) {
      throw new Error("No stock selected")
    }

    await api.watchlist.add(currentStock.id, currentStock.name)
    showNotification(`${currentStock.symbol} added to watchlist`, "success")

    if (currentPage === "watchlist") {
      await loadWatchlist()
    }
  } catch (error) {
    handleError(error, "Adding to watchlist")
  }
}

async function executeMoneyAction(action) {
  try {
    const amountInput = document.getElementById("money-amount")
    const amount = Number.parseFloat(amountInput?.value || "0")

    if (!validateNumber(amount, 0.01)) {
      throw new Error("Please enter a valid amount")
    }

    if (action === "add") {
      await api.wallet.addMoney(amount)
      showNotification(`Successfully added ${formatCurrency(amount)} to wallet`, "success")
    } else {
      await api.wallet.withdrawMoney(amount)
      showNotification(`Successfully withdrew ${formatCurrency(amount)} from wallet`, "success")
    }

    closeModal("money-modal")

    // Refresh wallet data
    await loadWallet()

    // Refresh dashboard if active
    if (currentPage === "dashboard") {
      await loadDashboard()
    }
  } catch (error) {
    handleError(error, `${action} money`)
  }
}

// Make functions globally available
window.openStockModal = openStockModal
window.removeFromWatchlist = removeFromWatchlist

// Add CSS classes for badges and status indicators
const additionalStyles = `
.badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.badge.success {
    background-color: #dcfce7;
    color: #166534;
}

.badge.danger {
    background-color: #fecaca;
    color: #991b1b;
}

.positive {
    color: var(--success-color) !important;
}

.negative {
    color: var(--danger-color) !important;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    min-height: 2rem;
}
`

// Inject additional styles
const styleSheet = document.createElement("style")
styleSheet.textContent = additionalStyles
document.head.appendChild(styleSheet)
