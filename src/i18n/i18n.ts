import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { filter } from 'lodash'
import en from './locales/en.json'
import vi from './locales/vi.json'
const resource = {
  en: {
    translation: en
  },
  vi: {
    translation: vi
  }
}

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: resource,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n
