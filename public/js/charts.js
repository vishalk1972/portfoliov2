import { Chart } from "@/components/ui/chart"
// Chart Management
let portfolioChart = null
let performanceChart = null
let priceChart = null

// Utility functions
function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

function generateColor(index) {
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"]
  return colors[index % colors.length]
}

// Initialize charts
function initializeCharts() {
  initializePortfolioChart()
  initializePerformanceChart()
}

// Portfolio distribution pie chart
function initializePortfolioChart() {
  const ctx = document.getElementById("portfolioChart")
  if (!ctx) return

  portfolioChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || ""
              const value = formatCurrency(context.raw)
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0
              return `${label}: ${value} (${percentage}%)`
            },
          },
        },
      },
    },
  })
}

// Performance bar chart
function initializePerformanceChart() {
  const ctx = document.getElementById("performanceChart")
  if (!ctx) return

  performanceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Profit/Loss",
          data: [],
          backgroundColor: [],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatCurrency(value),
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `P&L: ${formatCurrency(context.raw)}`,
          },
        },
      },
    },
  })
}

// Stock price line chart
function initializePriceChart(priceData) {
  const ctx = document.getElementById("priceChart")
  if (!ctx) return

  // Destroy existing chart
  if (priceChart) {
    priceChart.destroy()
  }

  const labels = priceData.map((item) => formatDate(item.date)).reverse()
  const prices = priceData.map((item) => item.close).reverse()

  priceChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Price",
          data: prices,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value) => formatCurrency(value),
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `Price: ${formatCurrency(context.raw)}`,
          },
        },
      },
    },
  })
}

// Update portfolio chart
function updatePortfolioChart(holdings) {
  if (!portfolioChart || !holdings.length) return

  const labels = holdings.map((holding) => holding.symbol)
  const data = holdings.map((holding) => holding.total_current_value)
  const colors = holdings.map((_, index) => generateColor(index))

  portfolioChart.data.labels = labels
  portfolioChart.data.datasets[0].data = data
  portfolioChart.data.datasets[0].backgroundColor = colors
  portfolioChart.update()
}

// Update performance chart
function updatePerformanceChart(holdings) {
  if (!performanceChart || !holdings.length) return

  const labels = holdings.map((holding) => holding.symbol)
  const data = holdings.map((holding) => holding.profit_loss)
  const colors = data.map((value) => (value >= 0 ? "#10b981" : "#ef4444"))

  performanceChart.data.labels = labels
  performanceChart.data.datasets[0].data = data
  performanceChart.data.datasets[0].backgroundColor = colors
  performanceChart.update()
}
