import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  if (loading) {
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

  // Check localStorage directly to prevent logout on navigation
  const savedUser = localStorage.getItem('user')
  if (!savedUser && !user) {
    return <Navigate to="/login" replace />
  }

  // Parse user if not in state but exists in localStorage
  let currentUser = user
  if (!currentUser && savedUser) {
    try {
      currentUser = JSON.parse(savedUser)
    } catch (e) {
      return <Navigate to="/login" replace />
    }
  }

  if (requiredRole && currentUser && currentUser.role !== requiredRole) {
    return <Navigate to="/order" replace />
  }

  return children
}

export default ProtectedRoute


