import { createApp } from 'vue'
import './tailwind.css'
import App from './App.vue'
import { router } from './routes.js'
import {
  ElAlert,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElButton,
  ElImage,
  ElInput,
  ElForm,
  ElFormItem,
  ElTag,
  ElLoading,
  ElLoadingDirective,
} from 'element-plus'
import { createPinia } from 'pinia'

const app = createApp(App)



app.use(ElTable)
app.use(ElTableColumn)
app.use(ElButton)
app.use(ElImage)
app.use(ElInput)
app.use(ElForm)
app.use(ElFormItem)
app.use(ElTag)
app.use(ElPagination)
app.use(ElAlert)
app.use(ElLoading)
app.use(ElLoadingDirective)

app.use(router)
app.use(createPinia())
app.mount('#app')
