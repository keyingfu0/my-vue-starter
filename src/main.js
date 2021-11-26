import { createApp } from 'vue/dist/vue.esm-bundler'
import './tailwind.css'
import App from './App.vue'
import { router } from './routes.js'
import { ElAlert, ElButton, ElDivider, ElForm, ElFormItem, ElImage, ElInput, ElLoading, ElPagination, ElTable, ElTableColumn, ElTag } from 'element-plus'
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
app.use(ElDivider)

app.use(router)
app.use(createPinia())

// app.directive('test', (...params) => {
//   console.log('params', params)
//   params[2].children.push
// })

app.mount('#app')
