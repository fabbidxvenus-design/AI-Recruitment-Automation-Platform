'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { i18n } from './client';
import {
  DEFAULT_LOCALE,
  LANGUAGE_STORAGE_KEY,
  Locale,
  SUPPORTED_LOCALES,
} from './resources';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isSupportedLocale(value: string | null): value is Locale {
  return typeof value === 'string' && SUPPORTED_LOCALES.some((locale) => locale === value);
}

interface I18nProviderProps {
  children: React.ReactNode;
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  try {
    const storedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupportedLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;
  } catch (error: unknown) {
    console.error('[I18nProvider] Failed to read locale from localStorage', error);
    return DEFAULT_LOCALE;
  }
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    i18n.changeLanguage(locale);
    document.documentElement.lang = locale;

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    } catch (error: unknown) {
      console.error('[I18nProvider] Failed to save locale to localStorage', error);
    }
  }, [locale]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
    </I18nextProvider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within I18nProvider');
  }

  return context;
}
