import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { FieldProvider, useFields } from '../contexts/FieldContext'
import '../styles/AdminDashboard.css'

function AdminContent() {
  const { user, logout, addUser, deleteUser, getUsers } = useAuth()
  const { orderTypes, companies, addOrderType, deleteOrderType, updateOrderType, addCompany, deleteCompany, updateCompany } = useFields()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('users')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newOrderType, setNewOrderType] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [editingOrderType, setEditingOrderType] = useState(null)
  const [editingCompany, setEditingCompany] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAddUser = () => {
    if (newUserEmail && newUserPassword && newUserName) {
      addUser({
        email: newUserEmail,
        password: newUserPassword,
        name: newUserName
      })
      setNewUserEmail('')
      setNewUserPassword('')
      setNewUserName('')
      alert('用戶新增成功！')
      setRefreshKey(prev => prev + 1)
    }
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm('確定要刪除此用戶嗎？')) {
      deleteUser(userId)
      setRefreshKey(prev => prev + 1)
    }
  }

  const handleAddOrderType = () => {
    if (newOrderType) {
      addOrderType(newOrderType)
      setNewOrderType('')
      setRefreshKey(prev => prev + 1)
    }
  }

  const handleAddCompany = () => {
    if (newCompany) {
      addCompany(newCompany)
      setNewCompany('')
      setRefreshKey(prev => prev + 1)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="admin-container">
      <motion.div
        className="admin-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>管理員後台</h1>
        <div className="admin-actions">
          <button onClick={() => navigate('/order')} className="nav-button">
            前往訂單表單
          </button>
          <button onClick={handleLogout} className="logout-button">
            登出
          </button>
        </div>
      </motion.div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          用戶管理
        </button>
        <button
          className={activeTab === 'fields' ? 'active' : ''}
          onClick={() => setActiveTab('fields')}
        >
          選項管理
        </button>
      </div>

      <motion.div
        className="admin-content"
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'users' && (
          <div className="users-section">
            <h2>新增用戶</h2>
            <div className="add-user-form">
              <input
                type="text"
                placeholder="姓名"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
              <input
                type="email"
                placeholder="電子郵件"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="密碼"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
              <button onClick={handleAddUser} className="add-button">
                新增用戶
              </button>
            </div>

            <h2>用戶列表</h2>
            <div className="users-list" key={refreshKey}>
              {getUsers().map((u) => (
                <motion.div
                  key={u.id}
                  className="user-item"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div>
                    <strong>{u.name}</strong>
                    <span className="user-email">{u.email}</span>
                    <span className="user-role">{u.role === 'admin' ? '管理員' : '會員'}</span>
                  </div>
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="delete-button"
                    >
                      刪除
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'fields' && (
          <div className="fields-section">
            <div className="field-group">
              <h2>訂單類型</h2>
              <div className="add-field-form">
                <input
                  type="text"
                  placeholder="新增訂單類型"
                  value={newOrderType}
                  onChange={(e) => setNewOrderType(e.target.value)}
                />
                <button onClick={handleAddOrderType} className="add-button">
                  新增
                </button>
              </div>
              <div className="field-list" key={`orderTypes-${refreshKey}`}>
                {orderTypes.map((type, index) => (
                  <motion.div
                    key={index}
                    className="field-item"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {editingOrderType === index ? (
                      <input
                        type="text"
                        value={type}
                        onChange={(e) => updateOrderType(index, e.target.value)}
                        onBlur={() => {
                          setEditingOrderType(null)
                          setRefreshKey(prev => prev + 1)
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            setEditingOrderType(null)
                            setRefreshKey(prev => prev + 1)
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <>
                        <span onClick={() => setEditingOrderType(index)}>{type}</span>
                        <button
                          onClick={() => {
                            deleteOrderType(index)
                            setRefreshKey(prev => prev + 1)
                          }}
                          className="delete-button"
                        >
                          刪除
                        </button>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="field-group">
              <h2>所屬公司</h2>
              <div className="add-field-form">
                <input
                  type="text"
                  placeholder="新增公司"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                />
                <button onClick={handleAddCompany} className="add-button">
                  新增
                </button>
              </div>
              <div className="field-list" key={`companies-${refreshKey}`}>
                {companies.map((company, index) => (
                  <motion.div
                    key={index}
                    className="field-item"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {editingCompany === index ? (
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => updateCompany(index, e.target.value)}
                        onBlur={() => {
                          setEditingCompany(null)
                          setRefreshKey(prev => prev + 1)
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            setEditingCompany(null)
                            setRefreshKey(prev => prev + 1)
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <>
                        <span onClick={() => setEditingCompany(index)}>{company}</span>
                        <button
                          onClick={() => {
                            deleteCompany(index)
                            setRefreshKey(prev => prev + 1)
                          }}
                          className="delete-button"
                        >
                          刪除
                        </button>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function AdminDashboard() {
  return (
    <FieldProvider>
      <AdminContent />
    </FieldProvider>
  )
}

export default AdminDashboard

