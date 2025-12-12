import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [localUser, setLocalUser] = useState(null)

  // Always check localStorage SYNCHRONOUSLY first to prevent logout on reload
  useEffect(() => {
    // Check immediately and synchronously
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
    
    // Also check on focus to catch any changes
    const handleFocus = () => {
      try {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          setLocalUser(parsedUser)
        } else {
          setLocalUser(null)
        }
      } catch (e) {
        console.error('Error checking auth on focus:', e)
      }
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Use localUser from localStorage if user from context is not available (e.g., on reload)
  const currentUser = user || localUser

  // Show loading only if we're still checking and don't have a user yet
  if ((loading || isChecking) && !currentUser) {
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

  // If we have a user (from context or localStorage), proceed even if still loading
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/order" replace />
  }

  return children
}

export default ProtectedRoute


