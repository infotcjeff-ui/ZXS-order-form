import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import OrderForm from './pages/OrderForm'
import ProtectedRoute from './components/ProtectedRoute'

function AppRoutes() {
  const { user } = useAuth()

  // Handle GitHub Pages 404 redirect
  useEffect(() => {
    const search = window.location.search
    if (search.includes('?/')) {
      const pathname = search.split('?/')[1].split('&')[0].replace(/~and~/g, '&')
      const newPath = '/ZXS-order-form/' + pathname
      window.history.replaceState({}, '', newPath + window.location.hash)
      // Use navigate instead of reload to preserve auth state
      if (pathname) {
        window.location.href = newPath + window.location.hash
      }
    }
  }, [])

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
      <Route path="/" element={<Navigate to={user ? "/order" : "/login"} replace />} />
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

