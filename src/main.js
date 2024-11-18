import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './plugins/router';
import { loadFonts } from './plugins/webfontloader'
import '@mdi/font/css/materialdesignicons.css'; // Assure-toi que cette ligne est bien présente


loadFonts()

createApp(App)
  .use(vuetify)
  .use(router)
  .mount('#app')
