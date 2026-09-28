import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from './translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('kptm_lang') || 'th'
  })

  useEffect(() => {
    localStorage.setItem('kptm_lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const toggleLanguage = () => {
    setLang(prev => (prev === 'th' ? 'en' : 'th'))
  }

  const t = translations[lang] || translations.th

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
