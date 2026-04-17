import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';

// Initialize i18n with default settings
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    fallbackLng: 'es',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

// Function to apply system language settings
export const applySystemLanguageSettings = async () => {
  try {
    const response = await fetch('/api/system-settings/language_default_mode');
    if (response.ok) {
      const { data } = await response.json();
      const mode = data?.value || 'auto';
      
      if (mode !== 'auto') {
        // Force the specified language
        i18n.changeLanguage(mode);
      }
    }
  } catch (error) {
    console.log('Could not load language settings, using defaults');
  }
};

export default i18n;
