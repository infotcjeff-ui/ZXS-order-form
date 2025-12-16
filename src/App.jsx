import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import OrderForm from './pages/OrderForm'
import ProtectedRoute from './components/ProtectedRoute'

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
  return (
    <AuthProvider>
      <Router basename="/ZXS-order-form">
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App

