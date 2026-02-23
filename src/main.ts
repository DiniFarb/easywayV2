import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'

const pinia = createPinia()

createApp(App)
  .use(pinia)
  .use(vuetify)
  .use(router)
  .use(VueApexCharts)
  .mount('#app')
