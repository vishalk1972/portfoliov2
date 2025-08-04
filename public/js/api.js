// API Configuration
const API_BASE_URL = "/api"

// API Helper Functions
const api = {
  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body)
    }

    try {
      showLoading(true)
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Request failed")
      }

      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    } finally {
      showLoading(false)
    }
  },

  // Stocks API
  stocks: {
    getAll: () => api.request("/stocks"),
    search: (query) => api.request(`/stocks/search/${encodeURIComponent(query)}`),
    getById: (id) => api.request(`/stocks/${id}`),
    getPrices: (id) => api.request(`/stocks/${id}/prices`),
  },

  // Wallet API
  wallet: {
    getBalance: () => api.request("/wallet"),
    addMoney: (amount) =>
      api.request("/wallet/add", {
        method: "POST",
        body: { amount },
      }),
    withdrawMoney: (amount) =>
      api.request("/wallet/withdraw", {
        method: "POST",
        body: { amount },
      }),
  },

  // Transactions API
  transactions: {
    getAll: () => api.request("/transactions"),
    buy: (stock_id, quantity, price) =>
      api.request("/transactions/buy", {
        method: "POST",
        body: { stock_id, quantity, price },
      }),
    sell: (stock_id, quantity, price) =>
      api.request("/transactions/sell", {
        method: "POST",
        body: { stock_id, quantity, price },
      }),
  },

  // Holdings API
  holdings: {
    getAll: () => api.request("/holdings"),
    getSummary: () => api.request("/holdings/summary"),
  },

  // Watchlist API
  watchlist: {
    getAll: () => api.request("/watchlist"),
    add: (stock_id, stock_name) =>
      api.request("/watchlist/add", {
        method: "POST",
        body: { stock_id, stock_name },
      }),
    remove: (stock_id) =>
      api.request(`/watchlist/${stock_id}`, {
        method: "DELETE",
      }),
  },
}

const showLoading = (isLoading) => {
  if (isLoading) {
    console.log("Loading...")
  } else {
    console.log("Done.")
  }
}
