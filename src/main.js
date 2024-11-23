import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './plugins/router';
import { loadFonts } from './plugins/webfontloader'
import '@mdi/font/css/materialdesignicons.css'; // Assure-toi que cette ligne est bien présente
import store from './store';


loadFonts()

createApp(App)
  .use(vuetify)
  .use(router)
  .use(store)
  .mount('#app')
