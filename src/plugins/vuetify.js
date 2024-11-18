// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

// Import icons
import { aliases, mdi } from 'vuetify/iconsets/mdi' // Ajoute cette ligne

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi, },
  },
  theme: {
      defaultTheme: 'light',
  },
})
