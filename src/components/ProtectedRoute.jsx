import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import '../styles/ProtectedRoute.css'

// Get user from localStorage synchronously
function getLocalUser() {
  try {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      return JSON.parse(savedUser)
    }
  } catch (e) {
    console.error('Error loading user from localStorage:', e)
  }
  return null
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  // Initialize with localStorage user immediately
  const [localUser] = useState(() => getLocalUser())

  // Use localUser from localStorage if user from context is not available (e.g., on reload)
  const currentUser = user || localUser

  // Show loading only if we're loading and don't have a user yet
  if (loading && !currentUser) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <div style={{
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>載入中...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>
      </div>
    )
  }

  // If we have a user (from context or localStorage), proceed even if still loading
  if (!currentUser) {
    // Only redirect if we're sure there's no user (not just loading)
    if (!loading) {
      // Show page with sticky login button instead of redirecting
      return (
        <>
          {children}
          <StickyLoginButton location={location} />
        </>
      )
    }
    // If still loading, show loading screen instead of redirecting
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <div style={{
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>載入中...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>
      </div>
    )
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/order" replace />
  }

  return children
}

// Sticky Login Button Component
function StickyLoginButton({ location }) {
  const navigate = useNavigate()

  const handleLoginClick = () => {
    navigate('/login', { state: { from: location } })
  }

  return (
    <button
      className="sticky-login-button"
      onClick={handleLoginClick}
      title="點擊返回登入頁面"
    >
      <span className="sticky-login-icon">🔐</span>
      <span className="sticky-login-text">登入</span>
    </button>
  )
}

export default ProtectedRoute


