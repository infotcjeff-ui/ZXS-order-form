// Version Control System
// Version 1.1 - Added electronic signature with switch button

const APP_VERSION = '1.1'

export function getAppVersion() {
  return APP_VERSION
}

export function checkVersionAndClearCache() {
  const storedVersion = localStorage.getItem('app_version')
  
  if (storedVersion !== APP_VERSION) {
    // Version changed, clear cache and reload
    console.log(`Version changed from ${storedVersion} to ${APP_VERSION}. Clearing cache...`)
    localStorage.setItem('app_version', APP_VERSION)
    // Clear all localStorage except user data
    const user = localStorage.getItem('user')
    const users = localStorage.getItem('users')
    const orderTypes = localStorage.getItem('orderTypes')
    const companies = localStorage.getItem('companies')
    
    localStorage.clear()
    
    // Restore important data
    if (user) localStorage.setItem('user', user)
    if (users) localStorage.setItem('users', users)
    if (orderTypes) localStorage.setItem('orderTypes', orderTypes)
    if (companies) localStorage.setItem('companies', companies)
    localStorage.setItem('app_version', APP_VERSION)
    
    // Reload page to get fresh assets
    window.location.reload()
  }
}

export function handleError(error, errorInfo) {
  console.error('Application Error:', error, errorInfo)
  // Log error to localStorage for debugging
  const errorLog = JSON.parse(localStorage.getItem('error_log') || '[]')
  errorLog.push({
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    error: error.toString(),
    errorInfo: errorInfo?.componentStack || ''
  })
  // Keep only last 10 errors
  if (errorLog.length > 10) {
    errorLog.shift()
  }
  localStorage.setItem('error_log', JSON.stringify(errorLog))
}

// Clear cache function - clears browser cache and localStorage
export function clearCache() {
  try {
    // Save important data before clearing
    const user = localStorage.getItem('user')
    const users = localStorage.getItem('users')
    const orderTypes = localStorage.getItem('orderTypes')
    const companies = localStorage.getItem('companies')
    
    // Clear all localStorage
    localStorage.clear()
    
    // Restore important data
    if (user) localStorage.setItem('user', user)
    if (users) localStorage.setItem('users', users)
    if (orderTypes) localStorage.setItem('orderTypes', orderTypes)
    if (companies) localStorage.setItem('companies', companies)
    localStorage.setItem('app_version', APP_VERSION)
    
    // Clear browser cache by reloading with cache-busting
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name)
        })
      })
    }
    
    // Force reload with cache-busting
    window.location.reload(true)
  } catch (error) {
    console.error('Error clearing cache:', error)
    // Fallback: just reload
    window.location.reload(true)
  }
}

