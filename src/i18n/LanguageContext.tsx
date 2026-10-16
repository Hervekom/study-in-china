import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { en, Dictionary } from './en';
import { fr } from './fr';

export type Lang = 'en' | 'fr';

const KEY = 'sic_lang';
const dictionaries: Record<Lang, Dictionary> = { en, fr };

const detect = (): Lang => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'fr') return saved;
  } catch {
    /* ignore */
  }
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('fr')) return 'fr';
  return 'en';
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(detect);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  };

  return <LanguageContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
};

/** Format a USD amount the way each language writes it: $3,089 / 3 089 $ */
export const formatUSD = (amount: number, lang: Lang) =>
  lang === 'fr' ? `${amount.toLocaleString('fr-FR').replace(/ | /g, ' ')} $` : `$${amount.toLocaleString('en-US')}`;
