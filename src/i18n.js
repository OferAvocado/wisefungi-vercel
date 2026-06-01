import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en.json';
import translationHE from './locales/he.json';
import translationRU from './locales/ru.json';
import translationES from './locales/es.json';
import termsData from './locales/terms.json';

const resources = {
  en: { translation: { ...translationEN, terms: termsData.en || {} } },
  he: { translation: { ...translationHE, terms: termsData.he || {} } },
  ru: { translation: { ...translationRU, terms: termsData.ru || {} } },
  es: { translation: { ...translationES, terms: termsData.es || {} } }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'he', 'ru', 'es'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
