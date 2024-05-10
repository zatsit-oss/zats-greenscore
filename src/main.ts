import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import CoreuiVue from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { iconsSet as icons } from '@/assets/icons'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import validateDigits from './directives/validateDigits'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(CoreuiVue)
app.provide('icons', icons)
app.component('CIcon', CIcon)
app.directive('validate-digits', validateDigits)
app.mount('#app')
app.provide('global', 'hello injections')
