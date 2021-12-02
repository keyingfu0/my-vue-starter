import { createApp } from 'vue/dist/vue.esm-bundler'
import './tailwind.css'
import App from './App.vue'
import { router } from './routes.js'
import { createPinia } from 'pinia'

import XEUtils from 'xe-utils'
import VXETablePluginAntd from 'vxe-table-plugin-antd'
import 'vxe-table-plugin-antd/dist/style.css'
import ADatePicker from 'ant-design-vue/lib/date-picker'
import 'ant-design-vue/lib/date-picker/style/index.css'
import ASelect, { SelectOption } from 'ant-design-vue/lib/select'
import 'ant-design-vue/lib/select/style/index.css'

import {
  // 核心
  VXETable,

  // 表格功能
  Header,
  // Footer,
  Icon,
  // Filter,
  Edit,
  Menu,
  Export,
  // Keyboard,
  Validator,

  // 可选组件
  Column,
  // Colgroup,
  // Grid,
  Tooltip,
  Toolbar,
  Pager,
  // Form,
  // FormItem,
  // FormGather,
  Checkbox,
  CheckboxGroup,
  // Radio,
  // RadioGroup,
  // RadioButton,
  // Switch,
  Input,
  Select,
  Optgroup,
  Option,
  // Textarea,
  Button,
  Modal,
  // List,
  Pulldown,

  // 表格
  Table,
} from 'vxe-table'
import zhCN from 'vxe-table/es/locale/lang/zh-CN'

// 按需加载的方式默认是不带国际化的，自定义国际化需要自行解析占位符 '{0}'，例如：
VXETable.setup({
  i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(zhCN, key), args),
})

VXETable.formats.mixin({
  // 格式化性别
  formatSex({ cellValue }) {
    return cellValue ? (cellValue === '1' ? '男' : '女') : ''
  },
  // 格式化下拉选项
  formatSelect({ cellValue }, list) {
    const item = list.find((item) => item.value === cellValue)
    return item ? item.label : ''
  },
  // 格式化时间，默认 yyyy-MM-dd HH:mm:ss
  formatTime({ cellValue }, format) {
    return XEUtils.toDateString(cellValue, format || 'yyyy-MM-dd HH:mm:ss')
  },
  // 格式化日期，默认 yyyy-MM-dd
  formatDate({ cellValue }, format) {
    return XEUtils.toDateString(cellValue, format || 'yyyy-MM-dd')
  },
  // 四舍五入金额，每隔3位逗号分隔，默认2位数
  formatAmount({ cellValue }, digits = 2) {
    return XEUtils.commafy(Number(cellValue), { digits })
  },
  // 格式化银行卡，默认每4位空格隔开
  formatBankcard({ cellValue }) {
    return XEUtils.commafy(XEUtils.toValueString(cellValue), { spaceNumber: 4, separator: ' ' })
  },
  // 四舍五入,默认两位数
  formatFixedNumber({ cellValue }, digits = 2) {
    return XEUtils.toFixed(XEUtils.round(cellValue, digits), digits)
  },
  // 向下舍入,默认两位数
  formatCutNumber({ cellValue }, digits = 2) {
    return XEUtils.toFixed(XEUtils.floor(cellValue, digits), digits)
  },
  // 转换 moment 类型为字符串
  toMomentString({ cellValue }, format) {
    return cellValue ? cellValue.format(format) : ''
  },
})
VXETable.use(VXETablePluginAntd)

function useTable(app) {
  // 表格功能
  app
    .use(Header)
    // .use(Footer)
    .use(Icon)
    // .use(Filter)
    .use(Edit)
    .use(Menu)
    .use(Export)
    // .use(Keyboard)
    .use(Validator)

    // 可选组件
    .use(Column)
    // .use(Colgroup)
    // .use(Grid)
    .use(Tooltip)
    .use(Toolbar)
    .use(Pager)
    // .use(Form)
    // .use(FormItem)
    // .use(FormGather)
    .use(Checkbox)
    .use(CheckboxGroup)
    // .use(Radio)
    // .use(RadioGroup)
    // .use(RadioButton)
    // .use(Switch)
    .use(Input)
    .use(Select)
    .use(Optgroup)
    .use(Option)
    // .use(Textarea)
    .use(Button)
    .use(Modal)
    // .use(List)
    .use(Pulldown)

    // 安装表格
    .use(Table)

  // 给 vue 实例挂载内部对象，例如：
  // app.config.globalProperties.$XModal = VXETable.modal
  app.config.globalProperties.$XPrint = VXETable.print
  // app.config.globalProperties.$XSaveFile = VXETable.saveFile
  // app.config.globalProperties.$XReadFile = VXETable.readFile
}

const app = createApp(App)
app.use(useTable)

app.use(router)
app.use(createPinia())

// 为了能在vxe中使用, 全局注册antdv的组件
app.use(ASelect)
app.use(SelectOption)

// app.directive('test', (...params) => {
//   console.log('params', params)
//   params[2].children.push
// })

app.mount('#app')
