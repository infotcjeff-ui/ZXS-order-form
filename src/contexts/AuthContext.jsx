import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage SYNCHRONOUSLY on mount to prevent logout on reload
    // This must happen before any render to prevent blank pages
    try {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } else {
        setUser(null)
      }
    } catch (e) {
      console.error('Error loading user from localStorage:', e)
      setUser(null)
    } finally {
      setLoading(false)
    }
    
    // Also listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        try {
          const savedUser = localStorage.getItem('user')
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser)
            setUser(parsedUser)
          } else {
            setUser(null)
          }
        } catch (err) {
          console.error('Error loading user from localStorage:', err)
          setUser(null)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  // Sync user state with localStorage when user state changes or on focus
  useEffect(() => {
    const handleFocus = () => {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          if (JSON.stringify(parsedUser) !== JSON.stringify(user)) {
            setUser(parsedUser)
          }
        } catch (e) {
          console.error('Error syncing user from localStorage:', e)
        }
      } else if (user) {
        // localStorage was cleared, clear user state
        setUser(null)
      }
    }
    
    // Check on window focus (e.g., when user returns to tab)
    window.addEventListener('focus', handleFocus)
    
    // Also check if user is null but localStorage has user (e.g., after reload)
    if (!user) {
      handleFocus()
    }
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [user])

  const login = (email, password) => {
    // Load users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    // Default admin user
    const defaultUsers = [
      {
        id: '1',
        email: 'admin@jeff.zxs.hk',
        password: 'admin321',
        role: 'admin',
        name: '系統管理員'
      }
    ]
    
    const allUsers = [...defaultUsers, ...users]
    const foundUser = allUsers.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      const userData = { ...foundUser }
      delete userData.password
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, user: userData }
    }
    
    return { success: false, error: '帳號或密碼錯誤' }
  }

  const directAccess = () => {
    const staffUser = {
      id: 'staff',
      email: '',
      role: 'staff',
      name: '員工'
    }
    setUser(staffUser)
    localStorage.setItem('user', JSON.stringify(staffUser))
    return { success: true, user: staffUser }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const addUser = (userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      role: 'member'
    }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    return newUser
  }

  const deleteUser = (userId) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const filtered = users.filter(u => u.id !== userId)
    localStorage.setItem('users', JSON.stringify(filtered))
  }

  const getUsers = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    return users.map(u => {
      const { password, ...userWithoutPassword } = u
      return userWithoutPassword
    })
  }

  const value = {
    user,
    login,
    logout,
    addUser,
    deleteUser,
    getUsers,
    directAccess,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

