import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [localUser, setLocalUser] = useState(null)

  // Always check localStorage first to prevent logout on reload
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          setLocalUser(parsedUser)
        } else {
          setLocalUser(null)
        }
      } catch (e) {
        console.error('Error checking auth:', e)
        setLocalUser(null)
      } finally {
        setIsChecking(false)
      }
    }
    
    // Check immediately
    checkAuth()
    
    // Also check periodically to catch changes
    const interval = setInterval(checkAuth, 100)
    
    return () => clearInterval(interval)
  }, [])

  if (loading || isChecking) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        載入中...
      </div>
    )
  }

  // Use localUser from localStorage if user from context is not available (e.g., on reload)
  const currentUser = user || localUser

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/order" replace />
  }

  return children
}

export default ProtectedRoute


