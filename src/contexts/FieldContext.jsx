import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

const FieldContext = createContext()

export function FieldProvider({ children }) {
  const [orderTypes, setOrderTypes] = useState([])
  const [companies, setCompanies] = useState([])

  const FIELD_TABLE = 'field_sets'

  const sortByLengthThenAlpha = (arr) =>
    [...arr].sort((a, b) => {
      if ((a?.length || 0) !== (b?.length || 0)) {
        return (a?.length || 0) - (b?.length || 0)
      }
      return (a || '').localeCompare(b || '', 'zh-Hant')
    })

  const persistFieldSet = async (name, items) => {
    if (!supabase) return
    const { error } = await supabase
      .from(FIELD_TABLE)
      .upsert({ name, items }, { onConflict: 'name' })
    if (error) {
      console.error(`Failed to persist ${name} to Supabase`, error)
    }
  }

  const fetchFieldSet = async (name) => {
    if (!supabase) return null
    const { data, error } = await supabase
      .from(FIELD_TABLE)
      .select('items')
      .eq('name', name)
      .maybeSingle()
    if (error) {
      console.error(`Failed to fetch ${name} from Supabase`, error)
      return null
    }
    return data?.items || null
  }

  useEffect(() => {
    // Load from localStorage
    const loadFields = async () => {
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

      // Try to hydrate from Supabase if configured
      if (supabase) {
        try {
          const [remoteOrderTypes, remoteCompanies] = await Promise.all([
            fetchFieldSet('orderTypes'),
            fetchFieldSet('companies')
          ])

          if (remoteOrderTypes && Array.isArray(remoteOrderTypes)) {
            const sorted = sortByLengthThenAlpha(remoteOrderTypes)
            setOrderTypes(sorted)
            localStorage.setItem('orderTypes', JSON.stringify(sorted))
          } else if (!savedOrderTypes) {
            // seed Supabase with defaults if nothing existed
            const defaults = JSON.parse(localStorage.getItem('orderTypes') || '[]')
            await persistFieldSet('orderTypes', defaults)
          }

          if (remoteCompanies && Array.isArray(remoteCompanies)) {
            const sorted = sortByLengthThenAlpha(remoteCompanies)
            setCompanies(sorted)
            localStorage.setItem('companies', JSON.stringify(sorted))
          } else if (!savedCompanies) {
            const defaults = JSON.parse(localStorage.getItem('companies') || '[]')
            await persistFieldSet('companies', defaults)
          }
        } catch (err) {
          console.error('Error syncing fields with Supabase:', err)
        }
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
    persistFieldSet('orderTypes', updated)
  }

  const deleteOrderType = (index) => {
    const updated = sortByLengthThenAlpha(orderTypes.filter((_, i) => i !== index))
    setOrderTypes(updated)
    localStorage.setItem('orderTypes', JSON.stringify(updated))
    persistFieldSet('orderTypes', updated)
  }

  const updateOrderType = (index, value) => {
    const updated = sortByLengthThenAlpha(
      orderTypes.map((item, i) => (i === index ? value : item))
    )
    setOrderTypes(updated)
    localStorage.setItem('orderTypes', JSON.stringify(updated))
    persistFieldSet('orderTypes', updated)
  }

  const addCompany = (value) => {
    const updated = sortByLengthThenAlpha([...companies, value])
    setCompanies(updated)
    localStorage.setItem('companies', JSON.stringify(updated))
    persistFieldSet('companies', updated)
  }

  const deleteCompany = (index) => {
    const updated = sortByLengthThenAlpha(companies.filter((_, i) => i !== index))
    setCompanies(updated)
    localStorage.setItem('companies', JSON.stringify(updated))
    persistFieldSet('companies', updated)
  }

  const updateCompany = (index, value) => {
    const updated = sortByLengthThenAlpha(
      companies.map((item, i) => (i === index ? value : item))
    )
    setCompanies(updated)
    localStorage.setItem('companies', JSON.stringify(updated))
    persistFieldSet('companies', updated)
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

