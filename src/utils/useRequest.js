/**
 * 二次封装 vue-request, 提供以下额外能力(选项):
 * 1. 注册 格式化处理函数, 并采用管道形式
 * 2. 注册 成功之后依次执行的回调函数的函数
 * 3. 提供一些默认的选项配置, 比如默认的格式化处理函数
 */

import { usePagination, useRequest as _useRequest } from 'vue-request'
import { forEach, isNil, isArray, isFunction, isObject } from 'lodash'
import { juxt, pipe } from 'ramda'
import { ElMessage } from 'element-plus'

//#region ## 实现类似 vue3 组合式api 的注册钩子的能力 ==================================================
let currentInstance = null

function setCurrentInstance(instance) {
  currentInstance = instance
}

export function injectHook(type, hook, target = currentInstance) {
  const hooks = target[type] ?? (target[type] = [])
  hooks.push(hook)
}

const createHook = (type) => (hook, target = currentInstance) => injectHook(type, hook, target)

//#endregion

//#region ## 定义钩子 ==================================================
// 注册 格式化的管道
export const onFormatResultPipe = createHook('formatResultHooks')
// 注册成功回调数组
export const onSuccess = createHook('onSuccessHooks')
//#endregion

//#region ## 二次封装 ==================================================
/**
 * 关于覆盖的基本规则类似vue3的组件:
 * - 通过对象选项声明的,后面的会覆盖前面的
 * - 通过函数注册的按先后顺序依次执行
 * - 同时存在选项和函数, 选项作为第一个注册的函数
 */
function useRequest(service, options = {}) {
  //#region ### 设置实例 ==================================================
  const instance = {}
  setCurrentInstance(instance)
  //#endregion

  //#region ### 提取选项 ==================================================
  const { setup, formatResult, onSuccess: onSuccessOption, isList, dryRun } = options
  let _formatResult
  let _onSuccess
  if (formatResult) {
    onFormatResultPipe(formatResult)
  }
  if (onSuccessOption) {
    onSuccess(onSuccessOption)
  }

  //#endregion

  //#region ### setup ==================================================
  if (setup) {
    setup(options)
  }

  const { formatResultHooks, onSuccessHooks } = instance
  if (formatResultHooks) {
    _formatResult = pipe(...formatResultHooks)
  }
  if (onSuccessHooks) {
    _onSuccess = juxt(onSuccessHooks)
  }

  //#endregion

  //#region ### 执行并返回 ==================================================

  const reqFn = isList ? usePagination : _useRequest

  if (!isNil(dryRun) && import.meta.env.DEV) {
    return reqFn(
      () => {
        return dryRun
          ? Promise.resolve({
              Content: 'dryRun',
            })
          : Promise.reject(new Error('dryRun'))
      },
      {
        ...options,
        formatResult: _formatResult,
        onSuccess: _onSuccess,
      },
    )
  }
  return reqFn(service, {
    ...options,
    formatResult: _formatResult,
    onSuccess: _onSuccess,
  })
  //#endregion
}

//#endregion

//#region ## 定义presets ==================================================

// 默认的格式化处理函数
function defaultFirstFormatResult(res) {
  return res.Content
}

/**
 * 根据值的类型(数组,函数,对象)进行不同处理, 见$preset函数,
 */
const presets = {
  // 原子定义
  'get-content': {
    formatResult: defaultFirstFormatResult,
  },
  'get-list': () => {
    onFormatResultPipe((data) => {
      console.log('-> onFormatResultPipe data', data)
      return data.List
    })
  },

  'message-on-success': (options) => {
    onSuccess(() => {
      const { successMessage } = options
      if (successMessage) {
        ElMessage.success({
          message: `${successMessage}`,
          type: 'success',
        })
      }
    })
  },

  'loading-delay': {
    loadingDelay: 500,
  },

  'initial-empty-list': {
    initialData: [],
  },

  'set-default-pageSize': {
    onBefore(params) {
      console.log('params', params[0])
      // 默认的10改为其他数值, 那如果自己要传10呢?..可以多传点其他的..
      if (params[0]?.pageSize === 10) {
        // params[0].pageSize = 6
      }
    },
  },

  // 请求完成之后自动退出登录
  // 'should-logout-on-success': ({ autoLogoutTime = 30 * 1000 }) => {
  //   onSuccess(() => {
  //     store.logout({ time: autoLogoutTime })
  //   })
  // },

  // 复合定义
  default: ['message-on-success', 'get-content'],
  'is-list': {
    isList: true,
    pagination: {
      currentKey: 'pageNumber',
      pageSizeKey: 'pageSize',
      totalKey: 'TotalCount',
      totalPageKey: 'PageCount',
    },
    // defaultParams: {}
  },
}
//#endregion

//#region ## 实现presets功能 ==================================================
useRequest.$preset = function setPreset(_presets = []) {
  let fn = this
  const presetSetup = []

  const presetOptions = _presets.reduce((acc, cur) => {
    const option = presets[cur]

    if (isArray(option)) {
      // 数组视为$preset
      fn = fn.$preset(option)
    } else if (isFunction(option)) {
      // 函数视为$setup
      presetSetup.push(option)
    } else if (isObject(option)) {
      // 对象每项单独处理
      forEach(option, (value, key) => {
        if (isNil(value)) {
          return
        }

        if (key === '$setup') {
          presetSetup.push(value)
          return
        }

        if (key === '$preset') {
          fn = fn.$preset(value)
          return
        }

        acc[key] = value
      })
    }

    return acc
  }, {})

  const wrappedFn = (data, options = {}) => {
    return fn(data, {
      ...presetOptions,
      ...options,
      setup(finalOptions) {
        juxt(presetSetup)(finalOptions)
        options.setup && options.setup(finalOptions)
      },
    })
  }
  wrappedFn.$preset = setPreset
  wrappedFn.$origin = useRequest

  return wrappedFn
}
// TODO 实现去掉preset的功能, 不一定要分成2个函数, 可以是不同参数
// useRequest.$unPreset = function unsetPreset(_presets) {}
// useRequest.$unPresetAll

// TODO 这里仿照了css中class的写法, 有没有更好的方式来实现类型提示?
// useRequest.default = useRequest.$preset(['default'])
// TODO 要实现类型定义可以参考下面
/**
 * @typedef {'Freshman'|'wow'} test
 * @typedef {test[]} test2
 */

/**
 * @param  {test2} _presets
 * @return {(function(*=, *): void)|*}
 */
//#endregion

export const useList = useRequest.$preset(['default', 'initial-empty-list', 'is-list', 'set-default-pageSize'])
export default useRequest.$preset(['default'])
