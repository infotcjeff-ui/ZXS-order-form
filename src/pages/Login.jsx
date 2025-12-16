import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Login.css'
import zxsLogo from '../img/ZXS logo.png'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, directAccess, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // COMPLETELY DISABLE auto-redirect from login page
  // Users should be able to stay on login page even if logged in
  // Only redirect after successful login (handled in handleSubmit)
  // This allows users to manually navigate to /login to re-login or switch accounts
  // 
  // REMOVED: All automatic redirect logic
  // Users can now always access /login page regardless of login status

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    const result = login(email, password)
    
    if (result.success) {
      navigate('/order', { state: { directAccess: result.user?.role === 'staff' } })
    } else {
      setError(result.error)
    }
  }

  const handleDirectAccess = () => {
    directAccess()
    navigate('/order', { state: { directAccess: true } })
  }

  return (
    <div className="login-container">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="logo-container"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <img src={zxsLogo} alt="ZXS Logo" className="zxs-logo" />
        </motion.div>

        <motion.h1
          className="login-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          訂單表單系統
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className="login-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="form-group">
            <label htmlFor="email">電子郵件</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@zxs.hk"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="login-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            登入
          </motion.button>
        </motion.form>

        <motion.div
          className="direct-access-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="divider">
            <span>或</span>
          </div>
          <motion.button
            type="button"
            onClick={handleDirectAccess}
            className="direct-access-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            員工直接進入
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login

