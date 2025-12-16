import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import OrderForm from './pages/OrderForm'
import ProtectedRoute from './components/ProtectedRoute'

const BASENAME_ENV = import.meta.env.VITE_APP_BASE || '/'

function RootRedirect() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Only redirect if we're actually on the root path
    // This prevents redirecting when user navigates to /login directly
    if (!loading && location.pathname === '/') {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          JSON.parse(savedUser) // Validate JSON
          navigate('/order', { replace: true })
        } catch (e) {
          navigate('/login', { replace: true })
        }
      } else {
        navigate('/login', { replace: true })
      }
    }
  }, [user, loading, navigate, location])

  return null
}

function AppRoutes() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // #region agent log
  // Hypothesis A/B: Router basename or location mismatch on Vercel leading to blank screen.
  useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/0140afbe-99e5-41b8-a6ec-03a8d100c650', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
        location: 'App.jsx:AppRoutes-location',
        message: 'Route change observed',
        data: {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
          browserHref: window.location.href
        },
        timestamp: Date.now()
      })
    }).catch(() => {})
  }, [location])
  // #endregion

  // Handle GitHub Pages 404 redirect - clean up URL if needed
  useEffect(() => {
    const search = window.location.search
    if (search.includes('?/')) {
      const pathname = search.split('?/')[1].split('&')[0].replace(/~and~/g, '&')
      const newPath = pathname
      
      // Clean up URL by removing the ?/ part
      if (pathname && location.pathname !== newPath) {
        navigate(newPath + window.location.hash, { replace: true })
      } else if (search.includes('?/')) {
        // Just clean up the query string
        window.history.replaceState({}, '', window.location.pathname + window.location.hash)
      }
      
      // Hide any loading overlay that might be showing
      setTimeout(() => {
        const loading = document.getElementById('redirect-loading')
        if (loading) {
          loading.classList.add('hidden')
          setTimeout(() => {
            if (loading && loading.parentNode) {
              loading.parentNode.removeChild(loading)
            }
          }, 300)
        }
      }, 300)
    }
  }, [navigate, location])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order"
        element={
          <ProtectedRoute>
            <OrderForm />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/" 
        element={
          <RootRedirect />
        } 
      />
    </Routes>
  )
}

function App() {
  // #region agent log
  // Hypothesis C: BrowserRouter basename may be incompatible with Vercel root hosting.
  useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/0140afbe-99e5-41b8-a6ec-03a8d100c650', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'C',
        location: 'App.jsx:App-basename',
        message: 'Router basename check',
        data: {
          basename: BASENAME_ENV,
          href: window.location.href
        },
        timestamp: Date.now()
      })
    }).catch(() => {})
  }, [])
  // #endregion

  return (
    <AuthProvider>
      <Router basename={BASENAME_ENV === '/' ? undefined : BASENAME_ENV}>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App

