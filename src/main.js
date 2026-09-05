import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')

window.addEventListener('daily-study:auth-expired', () => {
  if (router.currentRoute.value.path !== '/login') {
    router.replace({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
  }
})

window.addEventListener('daily-study:admin-forbidden', () => {
  if (router.currentRoute.value.meta.requiresAdmin) {
    router.replace('/home')
  }
})
