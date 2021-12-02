import axios from 'axios'
// import { ElMessage } from 'element-plus'
import { router } from '@/routes'
import message from 'ant-design-vue/lib/message'
import 'ant-design-vue/lib/message/style/index.css'

message.config({
  duration: 2,
})

//#region ## 根据配置创建 axios 请求实例 ==================================================
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API, // 基础请求url  url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000, // request timeout
})
//#endregion

/**
 * 请求失败后的错误统一处理
 * @param {Number} status 请求失败的状态码
 */
const handleData = ({ config, data, status, statusText }) => {
  console.log('-> config', config)
  console.log('-> status', status)
  console.log('-> data', data)
  console.log('-> statusText', statusText)

  const { Code, Message } = data
  if (status === 401) {
    message.info('请先登录')
    router.replace({
      name: 'login',
    })
    return Promise.reject({ config, data, status, statusText })
  }

  if (Code !== 10000) {
    message.error(Message)
    return Promise.reject({ config, data, status, statusText })
  }

  // const { customPayload = {} } = config
  const { successMessage } = config
  if (successMessage) {
    message.success(successMessage)
  }

  return data
}

// request interceptor
request.interceptors.request.use(
  (config) => {
    //#region ## 为请求统一添加某些数据 ==================================================
    if (config.data) {
      config.data.fAppInfoId = 2133
    }
    //#endregion

    return config
    // return Promise.reject(error)
  },
  (error) => {
    // do something with request error
    handleData(error)
    console.log(error)
    return Promise.reject(error)
  },
)

// response interceptor
request.interceptors.response.use(
  (response) => {
    // console.log('-> ok response', response)
    return handleData(response)
  },
  (error) => {
    console.log('========== START axios 响应错误处理 =======')
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data)
      console.log(error.response.status)
      console.log(error.response.headers)
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message)
    }
    console.log(error.config)

    console.log('========== END axios 响应错误处理 =======')
    handleData(error.response)
    return Promise.reject(error)
  },
)

export default request
