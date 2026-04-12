import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import ru from 'element-plus/es/locale/lang/ru'
import App from './app/App.vue'
import router from './app/router'
import 'element-plus/dist/index.css'
import './styles/index.css'
import './styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: ru })

app.mount('#app')
