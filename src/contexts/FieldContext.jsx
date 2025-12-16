import { createContext, useContext, useState, useEffect } from 'react'

const FieldContext = createContext()

export function FieldProvider({ children }) {
  const [orderTypes, setOrderTypes] = useState([])
  const [companies, setCompanies] = useState([])

  const sortByLengthThenAlpha = (arr) =>
    [...arr].sort((a, b) => {
      if ((a?.length || 0) !== (b?.length || 0)) {
        return (a?.length || 0) - (b?.length || 0)
      }
      return (a || '').localeCompare(b || '', 'zh-Hant')
    })

  useEffect(() => {
    // Load from localStorage
    const loadFields = () => {
      try {
        const savedOrderTypes = localStorage.getItem('orderTypes')
        const savedCompanies = localStorage.getItem('companies')
        
        if (savedOrderTypes) {
          const parsed = JSON.parse(savedOrderTypes)
          const sorted = Array.isArray(parsed) ? sortByLengthThenAlpha(parsed) : []
          setOrderTypes(sorted)
        } else {
          // Default values
          const defaults = ['標準訂單', '急件訂單', '批量訂單', '客製化訂單']
          const sortedDefaults = sortByLengthThenAlpha(defaults)
          setOrderTypes(sortedDefaults)
          localStorage.setItem('orderTypes', JSON.stringify(sortedDefaults))
        }
        
        if (savedCompanies) {
          const parsed = JSON.parse(savedCompanies)
          const sorted = Array.isArray(parsed) ? sortByLengthThenAlpha(parsed) : []
          setCompanies(sorted)
        } else {
          // Default values
          const defaults = ['中信方案有限公司', '合作夥伴A', '合作夥伴B']
          const sortedDefaults = sortByLengthThenAlpha(defaults)
          setCompanies(sortedDefaults)
          localStorage.setItem('companies', JSON.stringify(sortedDefaults))
        }
      } catch (e) {
        console.error('Error loading fields from localStorage:', e)
        // Set defaults on error
        const orderDefaults = ['標準訂單', '急件訂單', '批量訂單', '客製化訂單']
        const companyDefaults = ['中信方案有限公司', '合作夥伴A', '合作夥伴B']
        const sortedOrderDefaults = sortByLengthThenAlpha(orderDefaults)
        const sortedCompanyDefaults = sortByLengthThenAlpha(companyDefaults)
        setOrderTypes(sortedOrderDefaults)
        setCompanies(sortedCompanyDefaults)
        localStorage.setItem('orderTypes', JSON.stringify(sortedOrderDefaults))
        localStorage.setItem('companies', JSON.stringify(sortedCompanyDefaults))
      }
    }
    
    loadFields()
    
    // Reload on focus to catch any external changes
    const handleFocus = () => {
      loadFields()
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const addOrderType = (value) => {
    const updated = sortByLengthThenAlpha([...orderTypes, value])
    setOrderTypes(updated)
    localStorage.setItem('orderTypes', JSON.stringify(updated))
  }

  const deleteOrderType = (index) => {
    const updated = sortByLengthThenAlpha(orderTypes.filter((_, i) => i !== index))
    setOrderTypes(updated)
    localStorage.setItem('orderTypes', JSON.stringify(updated))
  }

  const updateOrderType = (index, value) => {
    const updated = sortByLengthThenAlpha(
      orderTypes.map((item, i) => (i === index ? value : item))
    )
    setOrderTypes(updated)
    localStorage.setItem('orderTypes', JSON.stringify(updated))
  }

  const addCompany = (value) => {
    const updated = sortByLengthThenAlpha([...companies, value])
    setCompanies(updated)
    localStorage.setItem('companies', JSON.stringify(updated))
  }

  const deleteCompany = (index) => {
    const updated = sortByLengthThenAlpha(companies.filter((_, i) => i !== index))
    setCompanies(updated)
    localStorage.setItem('companies', JSON.stringify(updated))
  }

  const updateCompany = (index, value) => {
    const updated = sortByLengthThenAlpha(
      companies.map((item, i) => (i === index ? value : item))
    )
    updated[index] = value
    setCompanies(updated)
    localStorage.setItem('companies', JSON.stringify(updated))
  }

  const value = {
    orderTypes,
    companies,
    addOrderType,
    deleteOrderType,
    updateOrderType,
    addCompany,
    deleteCompany,
    updateCompany
  }

  return <FieldContext.Provider value={value}>{children}</FieldContext.Provider>
}

export function useFields() {
  const context = useContext(FieldContext)
  if (!context) {
    throw new Error('useFields must be used within FieldProvider')
  }
  return context
}

