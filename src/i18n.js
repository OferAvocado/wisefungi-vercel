import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en.json';
import translationHE from './locales/he.json';
import translationRU from './locales/ru.json';
import translationES from './locales/es.json';

const resources = {
  en: { translation: translationEN },
  he: { translation: translationHE },
  ru: { translation: translationRU },
  es: { translation: translationES }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'he', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
