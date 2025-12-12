'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, languages } from '@/lib/i18n/translations';

const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('nl');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'nl';
    setLanguage(savedLang);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('language', language);
      document.documentElement.setAttribute('lang', language);
    }
  }, [language, mounted]);

  const t = useCallback((key) => {
    return translations[language]?.[key] || translations['nl'][key] || key;
  }, [language]);

  const changeLanguage = (lang) => {
    if (languages.find(l => l.code === lang)) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, mounted, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

