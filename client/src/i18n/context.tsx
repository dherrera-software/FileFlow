/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Dictionary, Lang } from './types';
import { es } from './es';
import { en } from './en';

interface I18nContextValue {
  dictionary: Dictionary;
  lang: Lang;
  t: (path: string, vars?: Record<string, string | number>) => string;
  setLanguage: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getInitialLang(defaultLang: Lang): Lang {
  if (typeof window === 'undefined') return defaultLang;
  const storedLang = localStorage.getItem('fileflow_lang') as Lang | null;
  if (storedLang && (storedLang === 'es' || storedLang === 'en')) {
    return storedLang;
  }
  const navLang = navigator.language?.split('-')[0] as Lang | null;
  if (navLang && (navLang === 'es' || navLang === 'en')) {
    return navLang;
  }
  return defaultLang;
}

export const I18nProvider = ({
  children,
  defaultLang = 'es',
}: {
  children: ReactNode;
  defaultLang?: Lang;
}) => {
  const [lang, setLang] = useState<Lang>(() => getInitialLang(defaultLang));

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const newLang = (e.target as HTMLSelectElement).value as Lang | null;
      if (newLang && (newLang === 'es' || newLang === 'en')) {
        setLang(newLang);
        localStorage.setItem('fileflow_lang', newLang);
      }
    };

    const langSelect = document.querySelector('select[lang-select]');
    if (langSelect) {
      langSelect.addEventListener('change', handleLangChange);
    }

    return () => {
      langSelect?.removeEventListener('change', handleLangChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const dictionary = lang === 'es' ? es : en;

  const t = (path: string, vars?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let value: unknown = dictionary;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = undefined;
        break;
      }
    }
    if (typeof value !== 'string') return '';
    if (!vars) return value;
    return Object.entries(vars).reduce(
      (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
      value
    );
  };

  return (
    <I18nContext.Provider value={{ dictionary, lang, t, setLanguage: setLang }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      dictionary: es,
      lang: 'es',
      t: (path: string) => path,
      setLanguage: () => { },
    };
  }
  return context;
};
