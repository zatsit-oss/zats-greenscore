import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'

import { iconsSet as icons } from '@/assets/icons'
import CIcon from '@coreui/icons-vue'
import CoreuiVue from '@coreui/vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(CoreuiVue)
app.provide('icons', icons)
app.component('CIcon', CIcon)
app.mount('#app')
app.provide('global', 'hello injections')
