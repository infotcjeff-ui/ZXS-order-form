import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { checkVersionAndClearCache, handleError } from './utils/version'

// #region agent log
// Hypothesis A: base path or asset loading differs between GitHub Pages and Vercel causing blank screen.
// Hypothesis B: initial route or environment variables misaligned on Vercel.
if (typeof window !== 'undefined') {
  fetch('http://127.0.0.1:7243/ingest/0140afbe-99e5-41b8-a6ec-03a8d100c650', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A',
      location: 'main.jsx:line-base',
      message: 'App bootstrap location/base',
      data: {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        baseUrl: import.meta.env.BASE_URL
      },
      timestamp: Date.now()
    })
  }).catch(() => {})
}
// #endregion

// Check version and clear cache if needed
checkVersionAndClearCache()

// Global error handling
window.addEventListener('error', (event) => {
  handleError(event.error, { componentStack: event.error?.stack })
})

window.addEventListener('unhandledrejection', (event) => {
  handleError(event.reason, {})
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

