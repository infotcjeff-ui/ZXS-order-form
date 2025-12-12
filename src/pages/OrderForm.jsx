import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { FieldProvider, useFields } from '../contexts/FieldContext'
import '../styles/OrderForm.css'
import zxsLogo from '../img/ZXS logo.png'
import zxsWebsiteLogo from '../img/ZXS website logo.png'

function OrderFormContent() {
  const { user, logout } = useAuth()
  const { orderTypes, companies, addOrderType, addCompany } = useFields()
  const navigate = useNavigate()
  const location = useLocation()
  const directAccess = location.state?.directAccess || user?.role === 'staff'
  
  const [formData, setFormData] = useState({
    orderType: '',
    orderTypeOther: '',
    company: '',
    companyOther: '',
    customerName: '',
    phone: '',
    email: '',
    notes: ''
  })

  const [orderId] = useState(() => {
    return `ORD-${Date.now()}`
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSelectChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
      [`${name}Other`]: '' // Clear other input when selecting different option
    })
  }

  const handlePrint = () => {
    let finalOrderType = formData.orderType
    let finalCompany = formData.company

    // Handle "其它" option - add to field list if custom value entered
    if (formData.orderType === '其它') {
      if (!formData.orderTypeOther) {
        alert('請輸入訂單類型')
        return
      }
      addOrderType(formData.orderTypeOther)
      finalOrderType = formData.orderTypeOther
    }
    
    if (formData.company === '其它') {
      if (!formData.companyOther) {
        alert('請輸入公司名稱')
        return
      }
      addCompany(formData.companyOther)
      finalCompany = formData.companyOther
    }

    if (!finalOrderType || !finalCompany || !formData.customerName) {
      alert('請填寫必填欄位（訂單類型、所屬公司、客戶姓名）')
      return
    }

    // Update the print form with final values
    const printContent = document.getElementById('order-form-print')
    const orderTypeField = printContent.querySelector('.print-field:first-of-type')
    const companyField = orderTypeField?.nextElementSibling
    
    if (orderTypeField) {
      orderTypeField.innerHTML = `<strong>訂單類型:</strong> ${finalOrderType}`
    }
    if (companyField) {
      companyField.innerHTML = `<strong>所屬公司:</strong> ${finalCompany}`
    }

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>訂單表單</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: Arial, sans-serif; }
            .print-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #333; }
            .print-logo img { max-width: 100px; height: auto; }
            .print-company-info { text-align: right; font-size: 11px; line-height: 1.5; }
            h1 { text-align: center; font-size: 24px; margin: 10px 0; }
            .print-subtitle { text-align: center; font-size: 12px; color: #666; margin-bottom: 15px; }
            .print-content { margin-top: 15px; }
            .print-section { margin-bottom: 15px; }
            .print-section h2 { font-size: 16px; margin-bottom: 10px; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
            .print-field { margin-bottom: 8px; font-size: 13px; line-height: 1.6; }
            .print-terms { font-size: 10px; line-height: 1.6; color: #555; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0; }
            .print-terms-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .print-terms-column-left, .print-terms-column-right { display: flex; flex-direction: column; }
            .print-terms-item { margin-bottom: 20px; }
            .print-terms-item:last-child { margin-bottom: 0; }
            .print-terms-line { margin-bottom: 4px; line-height: 1.6; }
            .print-terms-line:last-child { margin-bottom: 0; }
            .print-signature-row { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
            .print-signature-col { display: flex; flex-direction: column; }
            .print-signature-label { font-size: 12px; margin-bottom: 10px; color: #666; }
            .print-signature-row div[style*="border"] { border-bottom: 1px solid #333 !important; border-top: 0px !important; min-height: 40px; padding-bottom: 10px; margin-top: 10px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <div className="order-form-container">
      {!directAccess && (
        <motion.div
          className="order-form-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-logo">
            <img src={zxsLogo} alt="ZXS Logo" className="zxs-logo" />
          </div>
          <div className="header-actions">
            {user?.role === 'admin' && (
              <button onClick={() => navigate('/admin')} className="admin-button">
                管理後台
              </button>
            )}
            <button onClick={() => { logout(); navigate('/login') }} className="logout-button">
              登出
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        className="order-form-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="form-title">訂單表單</h1>
        <p className="form-subtitle">請填寫以下資料以完成訂單</p>

        <form className="order-form" id="order-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="orderType">訂單類型 <span className="required">*</span></label>
              <select
                id="orderType"
                name="orderType"
                value={formData.orderType}
                onChange={handleSelectChange}
                required
              >
                <option value="">請選擇</option>
                {orderTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
                <option value="其它">其它</option>
              </select>
              {formData.orderType === '其它' && (
                <input
                  type="text"
                  name="orderTypeOther"
                  value={formData.orderTypeOther}
                  onChange={handleChange}
                  placeholder="請輸入訂單類型"
                  className="other-input"
                  required
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="company">所屬公司 <span className="required">*</span></label>
              <select
                id="company"
                name="company"
                value={formData.company}
                onChange={handleSelectChange}
                required
              >
                <option value="">請選擇</option>
                {companies.map((company, index) => (
                  <option key={index} value={company}>{company}</option>
                ))}
                <option value="其它">其它</option>
              </select>
              {formData.company === '其它' && (
                <input
                  type="text"
                  name="companyOther"
                  value={formData.companyOther}
                  onChange={handleChange}
                  placeholder="請輸入公司名稱"
                  className="other-input"
                  required
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="customerName">客戶姓名 <span className="required">*</span></label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              placeholder="請輸入客戶姓名"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">聯絡電話</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="請輸入聯絡電話"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">電子郵件</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">備註</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="其他需要說明的資訊"
            />
          </div>

          <div className="form-group">
            <label htmlFor="terms">
              條款/注意事項 <span className="required">*</span>
              <small className="terms-note">（請仔細閱讀）</small>
            </label>
            <div className="terms-content">
              <div className="terms-columns">
                <div className="terms-column-left">
                  {getTermsAndConditions()
                    .split(/\n(?=\d+\.)/)
                    .slice(0, 2)
                    .map((term, i) => (
                      <div key={i} className="terms-item">
                        {term.split('\n').map((line, j) => (
                          <div key={j} className="terms-line">{line}</div>
                        ))}
                      </div>
                    ))}
                </div>
                <div className="terms-column-right">
                  {getTermsAndConditions()
                    .split(/\n(?=\d+\.)/)
                    .slice(2)
                    .map((term, i) => (
                      <div key={i + 2} className="terms-item">
                        {term.split('\n').map((line, j) => (
                          <div key={j} className="terms-line">{line}</div>
                        ))}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signature">簽署位置</label>
            <div className="signature-box">
              <div className="signature-column">
                <div className="signature-label">簽名：</div>
                <div className="signature-line"></div>
              </div>
              <div className="signature-column">
                <div className="signature-label">日期：</div>
                <div className="signature-line"></div>
              </div>
            </div>
          </div>

          <div className="print-button-container">
            <motion.button
              type="button"
              onClick={handlePrint}
              className="print-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🖨️ 列印訂單表單
            </motion.button>
          </div>
        </form>

        {/* Hidden form for printing */}
        <div id="order-form-print" className="print-form" style={{ display: 'none' }}>
          <div className="print-header">
            <div className="print-logo">
              <img src={zxsWebsiteLogo} alt="ZXS Website Logo" style={{ maxWidth: '100px', height: 'auto' }} />
            </div>
            <div className="print-company-info">
              <div><strong>中信方案有限公司</strong></div>
              <div>元朗八鄉粉錦公路8號 (八鄉警署旁)</div>
              <div>info@zxs.hk</div>
              <div>https://zxs.hk/</div>
              <div>9328 9880</div>
            </div>
          </div>
          <h1>訂單表單</h1>
          <p className="print-subtitle">訂單編號: {orderId}</p>
          <div className="print-content">
            <div className="print-section">
              <h2>訂單詳情</h2>
              <div className="print-field">
                <strong>訂單類型:</strong> {formData.orderType === '其它' ? (formData.orderTypeOther || '無') : (formData.orderType || '無')}
              </div>
              <div className="print-field">
                <strong>所屬公司:</strong> {formData.company === '其它' ? (formData.companyOther || '無') : (formData.company || '無')}
              </div>
              <div className="print-field">
                <strong>客戶姓名:</strong> {formData.customerName || '無'}
              </div>
              <div className="print-field">
                <strong>聯絡電話:</strong> {formData.phone || '無'}
              </div>
              <div className="print-field">
                <strong>電子郵件:</strong> {formData.email || '無'}
              </div>
            </div>
            <div className="print-section">
              <h2>備註</h2>
              <div className="print-field">
                {formData.notes || '無'}
              </div>
            </div>
            <div className="print-section">
              <h2>條款/注意事項 <span style={{ fontSize: '10px', color: '#e74c3c' }}>*</span></h2>
              <div className="print-terms">
                <div className="print-terms-columns">
                  <div className="print-terms-column-left">
                    {getTermsAndConditions()
                      .split(/\n(?=\d+\.)/)
                      .slice(0, 2)
                      .map((term, i) => (
                        <div key={i} className="print-terms-item">
                          {term.split('\n').map((line, j) => (
                            <div key={j} className="print-terms-line">{line}</div>
                          ))}
                        </div>
                      ))}
                  </div>
                  <div className="print-terms-column-right">
                    {getTermsAndConditions()
                      .split(/\n(?=\d+\.)/)
                      .slice(2)
                      .map((term, i) => (
                        <div key={i + 2} className="print-terms-item">
                          {term.split('\n').map((line, j) => (
                            <div key={j} className="print-terms-line">{line}</div>
                          ))}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="print-signature-row">
              <div className="print-signature-col">
                <div className="print-signature-label">簽名：</div>
                <div style={{ borderTop: '0px', borderBottom: '1px solid #333', paddingBottom: '10px', minHeight: '40px', marginTop: '10px' }}></div>
              </div>
              <div className="print-signature-col">
                <div className="print-signature-label">日期：</div>
                <div style={{ borderTop: '0px', borderBottom: '1px solid #333', paddingBottom: '10px', minHeight: '40px', marginTop: '10px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const getTermsAndConditions = () => {
  return `1. 訂單確認
   客戶提交訂單後，本公司將於3個工作天內確認訂單。訂單一經確認，客戶不得隨意取消或修改，除非獲得本公司書面同意。

2. 付款條款
   客戶須於訂單確認後7個工作天內完成付款。如未能在指定期限內付款，本公司保留取消訂單的權利。

3. 資料保密
   本公司承諾對客戶提供的所有資料嚴格保密，僅用於處理訂單相關事宜。

4. 其他條款
   本公司保留隨時修改本條款細則的權利，修改後的條款將於網站上公布。客戶繼續使用本服務即視為接受修改後的條款。`
}

function OrderForm() {
  return (
    <FieldProvider>
      <OrderFormContent />
    </FieldProvider>
  )
}

export default OrderForm

