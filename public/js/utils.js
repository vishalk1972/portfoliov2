// Utility Functions

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Format percentage
function formatPercentage(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

// Format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Format datetime
function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Show loading spinner
function showLoading(show) {
  const spinner = document.getElementById("loading-spinner")
  if (show) {
    spinner.classList.add("active")
    spinner.setAttribute("aria-hidden", "false")
  } else {
    spinner.classList.remove("active")
    spinner.setAttribute("aria-hidden", "true")
  }
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.getElementById("notification")
  notification.textContent = message
  notification.className = `notification ${type}`
  notification.classList.add("show")

  setTimeout(() => {
    notification.classList.remove("show")
  }, 5000)
}

// Debounce function
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Modal utilities
function openModal(modalId) {
  const modal = document.getElementById(modalId)
  modal.classList.add("active")
  modal.setAttribute("aria-hidden", "false")

  // Focus management
  const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
  if (firstFocusable) {
    firstFocusable.focus()
  }

  // Trap focus
  modal.addEventListener("keydown", trapFocus)
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  modal.classList.remove("active")
  modal.setAttribute("aria-hidden", "true")
  modal.removeEventListener("keydown", trapFocus)
}

function trapFocus(e) {
  if (e.key !== "Tab") return

  const modal = e.currentTarget
  const focusableElements = modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (e.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement.focus()
      e.preventDefault()
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement.focus()
      e.preventDefault()
    }
  }
}

// Validate input
function validateNumber(value, min = 0, max = Number.POSITIVE_INFINITY) {
  const num = Number.parseFloat(value)
  return !isNaN(num) && num >= min && num <= max
}

// Generate random color for charts
function generateColor(index) {
  const colors = [
    "#2563eb",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#6366f1",
  ]
  return colors[index % colors.length]
}

// Safe DOM manipulation
function safeSetTextContent(elementId, content) {
  const element = document.getElementById(elementId)
  if (element) {
    element.textContent = content
  }
}

function safeSetInnerHTML(elementId, html) {
  const element = document.getElementById(elementId)
  if (element) {
    element.innerHTML = html
  }
}

// Error handling
function handleError(error, context = "") {
  console.error(`Error in ${context}:`, error)
  const message = error.message || "An unexpected error occurred"
  showNotification(message, "error")
}

// Local storage utilities
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

function getFromLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error("Failed to get from localStorage:", error)
    return defaultValue
  }
}
