import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Temporary dummy translations
const resources = {
  en: {
    translation: {
      'app.title': 'AfayaConekt',
      'app.login': 'Login',
      'home.welcome': 'Welcome to AfayaConekt',
      'home.description': 'Connecting African patients with world-class healthcare globally'
    }
  },
  fr: {
    translation: {
      'app.title': 'AfayaConekt',
      'app.login': 'Connexion',
      'home.welcome': 'Bienvenue sur AfayaConekt',
      'home.description': 'Connecter les patients africains aux soins de santé de classe mondiale à l\'échelle mondiale'
    }
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  interpolation: {
    escapeValue: false
  }
})

export default i18n