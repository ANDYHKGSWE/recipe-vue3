import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Global felhanterare
app.config.errorHandler = (err, instance, info) => {
  // err: felet som kastades
  // instance: Vue komponentinstans där felet inträffade
  // info: Vue-specifik felinformation, t.ex. vilken livscykelkrok felet kom ifrån

  console.error('GlobalErrorHandler fångade ett fel:', err)
  if (instance) {
    console.error(
      'Fel i komponent:',
      instance.$options.name || instance.$options._componentTag || 'Okänd komponent',
    )
  }
  console.error('Vue info:', info)

  // Här kan du också skicka felrapporter till en extern tjänst som Sentry
  // Eller visa ett globalt felmeddelande för användaren
  // Viktigt: Undvik att skapa oändliga loopar om felhanteraren själv kastar ett fel.
}

// Exempel på provide
app.provide('appTheme', {
  primaryColor: 'blue',
  secondaryColor: 'green',
  defaultFontSize: '16px',
})

app.use(router)

app.mount('#app')
