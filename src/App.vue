<script setup>
// noinspection ES6UnusedImports
import { computed, h, nextTick, reactive, ref, resolveComponent, shallowRef, watch } from 'vue'
// import { Button as AButton, Tabs as Atab, TabPane } from 'ant-design-vue'
import { EditOutlined, ExclamationCircleOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'

import BaseTable from '@/components/BaseTable.vue'
import ModalImport from '@/components/ModalImport.vue'
import message from 'ant-design-vue/es/message'
import 'ant-design-vue/es/message/style/index.css'
import ATag from 'ant-design-vue/es/tag'
import 'ant-design-vue/es/tag/style/index.css'

import Modal from 'ant-design-vue/es/modal'
import 'ant-design-vue/es/modal/style/index.css'

import zhCN from 'ant-design-vue/es/locale/zh_CN'
import request from '@/utils/request'
import useRequest, { onFormatResultPipe } from '@/utils/useRequest'
import { formatTime } from '@/utils/time'
import { flatten, forEach, map, throttle } from 'lodash'

import { time } from '@/utils/time.js'

import SelectWorkOrder from '@/components/SelectWorkOrder.vue'
import useTableEdit from '@/composables/useTableEdit'
import { saveAs } from 'file-saver'
import BaseModal from '@/components/BaseModal.vue'

// const tableData = ref()

// const tableData2 = reactive()

function handleClick() {
  // tableData.value[0].name = '测试'
}

// 编辑后改变单元格样式
const cellStyle = ({ row, column }) => {
  if (column.property === 'tProduceBeginDate' || column.property === 'OrderList') {
    if (row._hasEdit) {
      return {
        backgroundColor: 'lightblue',
      }
    }
  }
}

//#region ## define ==================================================
const salesOrderTableRef = ref()
const materialTableRef = ref()
//#endregion

//#region ## 请求的时间参数 ==================================================
const activeKey = ref('0')

const now = shallowRef(time())

function _getNow() {
  now.value = time()
}

const getNow = throttle(_getNow, 1000)

const weeks = computed(() => {
  // const start = now.value.startOf('week').add(-1, 'day')
  const start = now.value.startOf('week')
  // const end = now.value.endOf('week').add(1, 'day')
  const end = now.value.endOf('week')
  const currentWeek = {
    start: start.format('YYYY-MM-DD HH:mm:ss'),
    // startObj: start,
    end: end.format('YYYY-MM-DD HH:mm:ss'),
    // endObj: end,
  }

  const nextWeeks = [1, 2].map((num) => {
    return {
      start: start.add(num, 'week').format('YYYY-MM-DD HH:mm:ss'),
      end: end.add(num, 'week').format('YYYY-MM-DD HH:mm:ss'),
    }
  })
  //  [{start:,end:},{start: ,end:},{}]
  return [currentWeek, ...nextWeeks]
})

/**
 * get dates between start and end
 * @param {dayjs.Dayjs} start
 * @param{dayjs.Dayjs} end
 * @return {dayjs.Dayjs[]}
 */
function getDatesBetween(start, end) {
  const dates = []
  let current = start
  while (current.isBefore(end)) {
    dates.push(current)
    current = current.add(1, 'day')
  }
  return [...dates]
}

const validDates = computed(() => {
  const { start } = weeks.value[0]
  const { end } = weeks.value[2]
  const dates = getDatesBetween(time(start), time(end))
  return dates.map((date) => date.toString().slice(0, 16))

  // return []
})

const validDate = computed(() => {
  const { start } = weeks.value[0]
  const { end } = weeks.value[2]
  return {
    min: time(start).toDate(),
    max: time(end).toDate(),
  }

  // return []
})

console.log('-> validDate', validDate)
/**
 * 用于查询的周时间参数
 * @type {ComputedRef<[{fType: number}, ...{tStartDateBegin: any, tStartDateEnd: any, fType}[]]>}
 * @example
 * [
 {
        "fType": 0
    },
 {
        "tStartDateBegin": "2021-11-28 00:00:00",
        "tStartDateEnd": "2021-12-06 23:59:59",
        "fType": 1
    },
 {
        "tStartDateBegin": "2021-12-05 00:00:00",
        "tStartDateEnd": "2021-12-13 23:59:59",
        "fType": 2
    },
 {
        "tStartDateBegin": "2021-12-12 00:00:00",
        "tStartDateEnd": "2021-12-20 23:59:59",
        "fType": 3
    }
 ]
 */
const weeksForQuery = computed(() => {
  const ret = weeks.value.map((week, index) => {
    const { start, end } = week
    return {
      tStartDateBegin: start,
      tStartDateEnd: end,
      fType: index + 1,
      fWeekType: index,
    }
  })

  return [{ fType: 0 }, ...ret]
})
const activeWeek = computed(() => {
  return weeksForQuery.value[activeKey.value]
})

// refresh table data on activeKey change
watch(activeKey, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    salesOrderTableRef.value.refresh()
    materialTableRef.value.refresh()
  }
})

console.log('-> weeks', weeks)
console.log('-> weeksForQuery', weeksForQuery)

/**
 * using dayjs get current week and next week
 */
// const getCurrentWeek = function() {
//   const now = time()
//   const start = now.startOf('week').add(-1, 'day')
//   const end = now.endOf('week').add(1, 'day')
//   return {
//     start: start.format('YYYY-MM-DD HH:mm:ss'),
//     end: end.format('YYYY-MM-DD HH:mm:ss'),
//     week: week,
//     year: year
//   }
// }

//#endregion

//#region ## 导入数据 ==================================================

const visible = ref(false)
const modalKey = ref(0)

function showModal() {
  visible.value = true
}

async function finishImport() {
  visible.value = false
  // NOTE 通过改变key的方式强制重启组件,使用组件的初始状态
  modalKey.value++
  salesOrderTableRef.value.refresh()
  console.log('-> salesOrderTableRef.value.refresh', salesOrderTableRef.value.refresh)
}

function getIds(tableRef) {
  const selectedRows = tableRef.value.getSelectedRows()
  return selectedRows?.map((item) => {
    return item.id
  })
}

//#endregion

//#region ## 订单表 ==================================================
const salesOrderTable = {
  requestConfig: [
    async (params) => {
      getNow()

      return request('/ApsSalesOrderInfo/GetApsSalesOrderInfoPageList', {
        method: 'post',
        data: {
          ...params,
          ...activeWeek.value,
        },
      })
    },
  ],
  deleteConfig: {
    handler: _handleDelete,
  },
  cellStyle,
}

//#endregion

//#region ## 物料需求表 ==================================================
const selectWorkOrderVisible = ref(false)

// TODO 可以优化
const workOrderComponent = ({ row }) => {
  let vnode
  if (row.OrderList.length) {
    const text = row.OrderList.map((item, index) => {
      console.log('-> item', item)
      const { label, fPlanningCount, fIsReleaseOrder } = item
      const statusText = fIsReleaseOrder ? '已下达' : '未下达'
      const statusColor = fIsReleaseOrder ? 'success' : 'default'
      const tag = h(ATag, { color: statusColor }, () => statusText)
      const className = fIsReleaseOrder ? 'text-green-400' : 'text-gray-400'
      const lineBreak = index === 0 ? '' : '\n'
      return h('span', { class: [className, 'leading-loose'] }, [lineBreak, tag, `${label}（${fPlanningCount}件）`])
    })
    vnode = h('span', null, text)
  } else {
    vnode = h('span', { class: 'text-gray-300' }, '请选择关联工单')
  }

  return h(
    'div',
    null,
    // row.OrderListVal,
    [
      vnode,
      // row.cRelateNo,
      h(EditOutlined, {
        class: '-translate-y-0.5 text-green-400 ml-2',
      }),
    ],
  )
}

const materialTable = {
  columnSchema: [
    {
      field: 'cWeekNo',
      title: '周次编码',
      width: 266,
      formatter: ({ cellValue }) => {
        // TODO 可以优化
        const day = time(cellValue)
        const day2 = day.add('6', 'day')
        const week = day.week()
        return `${day.year()}年第${week}周（${day.format('MM月DD日')}~${day2.format('MM月DD日')}）`
      },
    },
    {
      field: 'cProductName',
      title: '零部件名字',
    },
    {
      field: 'cProductNo',
      title: '零部件编号',
    },
    {
      field: 'fGrossCount',
      title: '毛需求',
    },
    {
      field: 'fbalanceCount',
      title: '期初结余',
    },
    {
      field: 'fProduceCount',
      title: '本周在制量',
    },
    {
      field: 'fATPCount',
      title: 'ATP',
      titleHelp: { message: '可承诺量(available to promise，ATP)是库存量和主生产计划量中尚未承诺给客户订单的部分，用于支持客户订单承诺。' },
      // return 'text-red-300' class when cellValue < 0
      className: ({ row }) => {
        return row.fATPCount < 0 ? 'text-red-500' : ''
      },
    },
    {
      field: 'OrderList',
      title: '关联工单',
      width: 270,
      showOverflow: false,
      editRender: {
        // TODO 无效 因为有default slot
        placeholder: '请选择关联工单',
        // name: 'ASelect',
        // options: [
        //   {
        //     label: '1',
        //     value: '1',
        //   },
        //   {
        //     label: '2',
        //     value: '2',
        //   },
        // ],
      },
      slots: {
        // TODO 这样每次都会重新渲染不好, 改为手动模式
        edit: (props) => {
          return h(
            SelectWorkOrder,
            {
              row: props.row,
              activeWeek: activeWeek.value,
              visible: selectWorkOrderVisible.value,
              'onUpdate:visible': async (value) => {
                selectWorkOrderVisible.value = value
                if (!value) {
                  await nextTick()
                  materialTableRef.value.clearActived()
                }
              },
              'onUpdate:row': (value) => {
                console.log('-> props.row', props.row)
                props.row.OrderList = value
              },
              key: props.row.id,
              onChange: materialTableEdit.handleCellChange,
            },
            {
              default: workOrderComponent,
            },
          )
        },
        default: workOrderComponent,
      },
    },
    {
      field: 'fVersion',
      title: '版本',
      width: 70,
    },
  ],
  requestConfig: [
    async (params) => {
      getNow()

      return request('/ApsMaterialRequestInfo/GetApsMaterialRequestInfoPageList', {
        method: 'post',
        data: {
          ...params,
          ...activeWeek.value,
        },
      })
    },
  ],
  cellStyle,
}

//#endregion

//#region ## 关联工单 ==================================================
async function associatedWorkOrder(rows) {
  const List = map(rows, (row) => {
    const { id, OrderList } = row
    const fProductionOrderInfoIds = map(OrderList, (item) => {
      return item.fProductionOrderInfoId
    })
    return {
      fApsMaterialRequestInfoId: id,
      fProductionOrderInfoIds,
    }
  })
  console.log('-> List', List)

  return request('/ApsMaterialRequestInfo/MatchOrderInfo', {
    method: 'POST',
    data: {
      List,
    },
  })
}

const materialTableEdit = useTableEdit(associatedWorkOrder, {
  tableRef: materialTableRef,
})

//#region ### 删除组装单 ========================================
function deleteAssemblyOrders(cApsAssembleOrderNos) {
  useRequest(
    async () => {
      return request('/ApsAssembleOrderInfo/DeleteApsAssembleOrderInfoByNos', {
        method: 'POST',
        data: {
          cApsAssembleOrderNos,
        },
      })
    },
    {
      onSuccess: () => {
        message.success('删除成功')
        salesOrderTableRef.value.refresh()
      },
    },
  )
}

function deleteAssemblyOrdersInBulk(rows) {
  const cApsAssembleOrderNos = map(rows, (row) => row.cRelateNo)
  deleteAssemblyOrders(cApsAssembleOrderNos)
}

//#endregion

//#endregion

//#region ## 编辑组装时间 ==================================================
async function editAssemblyTime(rows, newDate) {
  const List = map(rows, (row) => {
    const { id, tProduceBeginDate } = row
    return {
      id,
      tProduceBeginDate: newDate ?? tProduceBeginDate,
    }
  })
  return request('/ApsSalesOrderInfo/EditApsSalesOrderProductBeginTime', {
    method: 'POST',
    data: {
      List,
    },
  })
}

const { hasEdit, handleCellChange, saveTable, resetTable, refreshed } = useTableEdit(editAssemblyTime, {
  tableRef: salesOrderTableRef,
})

//#endregion

//#region ## 表格工具栏 ==================================================

//#endregion

//#region ## 仓库齐套性检测 ==================================================
const visibleCheckModal = ref(false)
const storeUniformityCheck = ref()

async function handleStoreUniformityCheck() {
  // 是否选中行
  const selectedRows = salesOrderTableRef.value.getSelectedRows()
  if (!selectedRows) {
    return
  }

  visibleCheckModal.value = true
  await nextTick()
  storeUniformityCheck.value.fetchData()
}

const rowClassName = ({ row }) => {
  if (row.fbalanceCount - row.fGrossCount < 0) {
    return 'bg-red-200'
  }
}

// TODO 加一个tab, 筛选功能
const StoreUniformityCheck = {
  rowClassName,
  columnSchema: [
    {
      field: 'cProductName',
      title: '零部件名字',
    },
    {
      field: 'cProductNo',
      title: '零部件编号',
    },
    {
      field: 'fGrossCount',
      title: '毛需求',
    },
    {
      field: 'fbalanceCount',
      title: '当前库存',
    },
    {
      field: '当前库存-毛需求',
      title: '当前库存-毛需求',
      sortable: true,
      sortType: 'number',
      formatter: ({ row }) => {
        return row.fbalanceCount - row.fGrossCount
      },
    },
  ],
  requestConfig: [
    async (args = {}) => {
      // TODO 放到表格组件内部
      const ids = getIds(salesOrderTableRef)
      return request('/ApsSalesOrderInfo/HomogeneityCheck_Warehouse', {
        method: 'POST',
        data: {
          ids,
          ...activeWeek.value,
          ...args,
        },
      })
    },
    {
      manual: true,
    },
  ],
}

//#endregion

//#region ## ATP齐套性检测 ==================================================
const visibleCheckAtpModal = ref(false)
const storeAtpCheck = ref()
const bomNos = ref([])
const storeAtpCheckReloading = ref(false)

async function handleStoreAtpCheck() {
  visibleCheckAtpModal.value = true
}

const rowClassNameAtp = ({ row }) => {
  if (row.fATPCount < 0) {
    return 'bg-red-200'
  }
}

// TODO 加一个tab, 筛选功能
const storeAtpCheckTable = {
  rowClassName: rowClassNameAtp,
  columnSchema: [
    {
      field: 'cProductName',
      title: '零部件名字',
    },
    {
      field: 'cProductNo',
      title: '零部件编号',
    },
    {
      field: 'fGrossCount',
      title: '毛需求',
    },
    {
      field: 'fbalanceCount',
      title: '期初结余',
    },
    {
      field: 'fProduceCount',
      title: '本周在制量',
    },
    {
      field: 'fATPCount',
      title: 'ATP',
      sortable: true,
      sortType: 'number',
    },
    // {
    //   field: '毛需求-期初结余',
    //   title: '毛需求-期初结余',
    //   sortable: true,
    //   sortType: 'number',
    //   formatter: ({ row }) => {
    //     return row.fGrossCount - row.fbalanceCount
    //   },
    // },
  ],
  requestConfig: [
    async (args = {}) => {
      const cBomNos = bomNos.value.join(',')
      // TODO 放到表格组件内部
      return request('/ApsSalesOrderInfo/HomogeneityCheck_ATP', {
        method: 'POST',
        data: {
          cBomNos,
          ...activeWeek.value,
          ...args,
        },
      })
    },
    {
      manual: true,
    },
  ],
}

function handleStoreAtpCheckSearch() {
  storeAtpCheck.value.fetchData()
}

//#endregion

//#region ## 结案 ==================================================
// TODO 重构提取
const isCaseCloseConfirmVisible = ref(false)

function handleVisibleCaseCloseChange(bool) {
  if (!bool) {
    isCaseCloseConfirmVisible.value = false
    return
  } // Determining condition before show the popconfirm.

  // 是否选中行
  const selectedRows = salesOrderTableRef.value.getSelectedRows()
  if (!selectedRows) {
    isCaseCloseConfirmVisible.value = false
    return
  }
  isCaseCloseConfirmVisible.value = true
}

async function caseClosed() {
  // 是否选中行
  const selectedRows = salesOrderTableRef.value.getSelectedRows()
  if (!selectedRows) {
    return
  }
  // TODO  改为更合理的方式, 可以接受外部的loading ref !
  const { run } = useRequest(
    async () => {
      return request('/ApsSalesOrderInfo/FinishApsSalesOrderInfoIDS', {
        method: 'POST',
        data: {
          ids: selectedRows.map(({ id }) => id),
        },
      })
    },
    {
      // successMessage: '结案成功',
      // manual: true,
      onSuccess() {
        message.success('结案成功')

        salesOrderTableRef.value.refresh()
      },
    },
  )
  // TODO 这样无法判断业务代码错误???
  // try {
  //   await run()
  //   message.success('结案成功')
  //
  //   salesOrderTableRef.value.refresh()
  // } catch {
  //
  // }
}

//#endregion

//#region ## 工单下达 ==================================================
const isWorkOrderReleaseConfirmVisible = ref(false)

function handleVisibleChange(bool) {
  if (!bool) {
    isWorkOrderReleaseConfirmVisible.value = false
    return
  } // Determining condition before show the popconfirm.

  // 是否选中行
  const selectedRows = materialTableRef.value.getSelectedRows()
  if (!selectedRows) {
    isWorkOrderReleaseConfirmVisible.value = false
    return
  }
  isWorkOrderReleaseConfirmVisible.value = true
}

async function workOrderRelease() {
  const rows = materialTableRef.value.getSelectedRows()
  const ids = flatten(
    rows.map((row) => {
      const { OrderList } = row
      return OrderList.map((item) => {
        return item.fProductionOrderInfoId
      })
    }),
  )
  // TODO loading
  const { run } = useRequest(
    async () => {
      return request('/ApsMaterialRequestInfo/ReleaseOrder', {
        method: 'POST',
        data: {
          ids,
        },
      })
    },
    {
      // TODO 需要替换request中的message组件才可以用
      // successMessage: '工单下达成功!',
      onSuccess() {
        message.success('工单下达成功')
        materialTableRef.value.refresh()
      },
    },
  )
}

//#endregion

//#region ## 生成组装单 ==================================================
const visibleAssemblyOrderModal = ref(false)
const assemblyOrder = ref()
const assemblyOrder2 = ref()
let currentRow

// 简易缓存
// TODO NOTE  这里做了一个2秒钟的建议缓存, 原因是因为2个列表请求的是同一接口并同时返回了2个列表的数据, 但table设计时是table内部直接请求的, 为了防止2个table内部重复请求, 在请求时检查一下之前请求缓存, 以后看看有没有更好的方式(直接在外部改data,loading的数据?)
const cacheResult = new Map()

function generateAssemblyOrder() {
  const selectedRows = salesOrderTableRef.value.getSelectedRows()
  if (!selectedRows) {
    return
  }
  useRequest(
    async () => {
      const ids = getIds(salesOrderTableRef)
      return request('/ApsAssembleOrderInfo/AddApsAssembleOrderInfoModelWithSalesOrderNo', {
        method: 'POST',
        data: {
          cApsSalesOrderIds: ids,
        },
      })
    },
    {
      onSuccess() {
        message.success('生成组装单成功!点击单元格查看详情')
        salesOrderTableRef.value.refresh()
      },
    },
  )
}

async function showAssociatedAssemblyOrder(row) {
  currentRow = row
  visibleAssemblyOrderModal.value = true
  await nextTick()

  // 等待可能的缓存
  await assemblyOrder2.value.fetchData(row)
  // setTimeout(() => {
  assemblyOrder.value.fetchData(row)
  // }, 50)
}

// TODO 加一个tab, 筛选功能

async function assemblyOrderReq(row) {
  console.log('-> Fanny row', row)

  console.log('-> cacheResult', cacheResult)
  // 检查缓存
  if (cacheResult.has(row.cRelateNo)) {
    return cacheResult.get(row.cRelateNo)
  }
  // TODO 放到表格组件内部
  // cacheResult.set(row.cRelateNo, '_placeholder')
  const res = await request('/ApsAssembleOrderInfo/GetApsAssembleOrderInfoDetailModel', {
    method: 'POST',
    data: {
      cApsAssembleOrderNo: row.cRelateNo,
      ...activeWeek.value,
    },
  })

  // 设置并定时清除缓存
  cacheResult.set(row.cRelateNo, res)
  setTimeout(() => {
    cacheResult.delete(row.cRelateNo)
  }, 2 * 1000)

  return res
}

const assemblyOrderTable = {
  hasToolbar: false,
  showOverflow: null,
  columnSchema: [
    {
      field: 'cProductName',
      title: '零部件名字',
    },
    {
      field: 'cProductNo',
      title: '零部件编号',
    },
    {
      field: 'fGrossCount',
      title: '毛需求',
    },
    {
      field: 'fbalanceCount',
      title: '期初结余',
    },
    {
      field: 'fProduceCount',
      title: '本周在制量',
    },
    {
      field: 'fATPCount',
      title: 'ATP',
    },
  ],
  customPreset: ['initial-empty-list'],
  requestConfig: [
    assemblyOrderReq,
    {
      manual: true,
      // cacheKey: 'assembly',
      // get cacheKey() {
      //   console.log('-> currentRow?.cRelateNo', currentRow?.cRelateNo)
      //   return currentRow?.cRelateNo ?? '_undefined'
      // },
      setup() {
        onFormatResultPipe((data) => {
          console.log('-> data', data)
          return {
            List: data.MaterialRequestList,
          }
        })
      },
    },
  ],
}

const assemblyOrderTable2 = {
  hasToolbar: false,
  columnSchema: [
    {
      field: 'cSalesOrderNo',
      title: '订单编号',
      width: 180,
    },
    {
      field: 'cBomNo',
      title: '订单BOM编号',
      width: 180,
    },
    {
      field: 'cProductNo',
      title: '物料编号',
      width: 180,
    },
    {
      field: 'cProductName',
      title: '物料名称',
      width: 180,
    },
    {
      field: 'cCustomerName',
      title: '客户名',
      width: 103,
    },
    {
      field: 'fCount',
      title: '数量',
      width: 86,
    },
    {
      field: 'tProduceBeginDate',
      title: '组装日期',
      formatter: 'formatDate',
      width: 100,
    },
  ],
  customPreset: ['initial-empty-list'],
  requestConfig: [
    assemblyOrderReq,
    {
      manual: true,
      // cacheKey: 'assembly',
      // cacheTime: 10 * 1000,
      setup() {
        onFormatResultPipe((data) => {
          return {
            List: data.SalesOrderList,
          }
        })
      },
    },
  ],
}
const assemblyOrderLists = shallowRef()

function print() {
  console.log('-> assemblyOrderLists', assemblyOrderLists)
  const content = assemblyOrderLists.value.innerHTML
  salesOrderTableRef.value.print({
    sheetName: `${currentRow.cRelateNo} 组装单`,
    content,
    style: `
      .vxe-table--empty-block {
      display: none;
      }
      .vxe-table--empty-placeholder {
       display: none;
      }
      .text-center {
       text-align: center;
      }
    `,
    // style: printStyle,
  })
}

//#endregion

//#region ## 订单表删除 ==================================================
async function _handleDelete(ids) {
  await request('/ApsSalesOrderInfo/DeleteApsSalesOrderInfoIDS', {
    method: 'POST',
    data: ids,
  })
}

async function handleDelete(row) {
  salesOrderTableRef.value.handleDelete(row)
}

//#endregion

//#region ## 物料需求计算 ==================================================

function getService(url) {
  return async function (args = {}) {
    return request(url, {
      method: 'post',
      data: {
        cWeekNo: activeWeek.value.tStartDateBegin,
        ...activeWeek.value,
        ...args,
      },
    })
  }
}

const materialCalculating = ref(false)

async function _materialCalcHandler({ service, text }) {
  const { loading: reqLoading, error } = useRequest(service)
  const stop = watch(reqLoading, (newVal, oldVal) => {
    // NOTE 因为请求返回之后立即请求并不一定是最新数据, 所以在取消loading状态之前手动加一个延时防止操作过快时数据可能错误

    if (newVal) {
      materialCalculating.value = newVal
    } else {
      setTimeout(() => {
        materialCalculating.value = newVal
        if (oldVal && !error.value) {
          message.success(`${text}成功!`)
          materialTableRef.value.refresh()
          // NOTE 另一种方式是在一定延时之后再次请求来获取正确数据, 但是感觉不太好
          // setTimeout(() => {
          //   materialTableRef.value.refresh()
          // }, 1500)
          stop()
        }
      }, 1500)
    }
  })
}

// grossDemandCalculation,getTheBeginningBalance,getTheCurrentProductionVolume
const materialCalcButtons = {
  grossDemandCalculation: {
    service: getService('/ApsSalesOrderInfo/GrossCalculation'),
    text: '毛需求计算',
    confirmConfig: {
      _checkShouldConfirm() {
        return materialTableRef.value.getTableDataLength !== 0
      },
      title: '确认重新计算毛需求吗?',
      icon: h(ExclamationCircleOutlined),
      content: h('div', { style: 'color:red;' }, '重新计算毛需求将会清除当前数据并生成新版本。已有的期初结余、本期在制量等数据需要重新计算。'),
      okText: '确认',
      cancelText: '取消',
    },
    // beforeClick:
  },
  getTheBeginningBalance: {
    service: getService('/ApsMaterialRequestInfo/BalanceCountCalculation'),
    text: '获取期初结余',
  },
  getTheCurrentProductionVolume: {
    service: async () => {
      await getService('/ApsMaterialRequestInfo/ProduceCountCalculation')()
      return getService('/ApsMaterialRequestInfo/ATPCountCalculation')()
    },
    text: '获取本期在制量和ATP',
  },
}

forEach(materialCalcButtons, (button) => {
  button.handler = () => {
    // button.beforeClick &&
    const { confirmConfig } = button
    if (confirmConfig && confirmConfig._checkShouldConfirm()) {
      Modal.confirm({ ...confirmConfig, onOk: () => _materialCalcHandler(button) })
      return
    }
    return _materialCalcHandler(button)
  }
})

//#endregion

//#region ## 表格重新加载中 ==================================================
const materialTableReloading = ref(false)
//#endregion

//#region ## 工单计划导出 ==================================================
const isExportConfirmVisible = ref(false)

function handleVisibileExportChange(bool) {
  if (!bool) {
    isExportConfirmVisible.value = false
    return
  } // Determining condition before show the popconfirm.

  // 是否选中行
  const selectedRows = materialTableRef.value.getSelectedRows()
  if (!selectedRows) {
    isExportConfirmVisible.value = false
    return
  }
  isExportConfirmVisible.value = true
}

function getAbsoluteUrl(url) {
  if (!url) return ''
  return `${import.meta.env.VITE_APP_BASE_URL}/${url}`
}

function exportExcel() {
  const rows = materialTableRef.value.getSelectedRows()
  const cProductionOrderNo = flatten(
    rows.map((row) => {
      const { OrderList } = row
      return OrderList.map((item) => {
        return item.cProductionOrderNo
      })
    }),
  ).join(',')

  if (!cProductionOrderNo) {
    message.warning('请选择有关联工单的行')
    return
  }

  // TODO loading
  const { run } = useRequest.$origin(
    async () => {
      return request('/ApsMaterialRequestInfo/ExportExcel', {
        method: 'POST',
        data: {
          cProductionOrderNo,
        },
      })
    },
    {
      onSuccess(res) {
        // TODO 更换下载地址
        res.href && saveAs(getAbsoluteUrl(res.href))
        message.success('工单计划导出成功!')
      },
    },
  )
}

//#endregion

//#region ## 批量修改组装日期 ==================================================
const produceBeginDateBatch = shallowRef()
const editAssemblyTimeBatchVisible = ref(false)

async function editAssemblyTimeBatch(selectedRows) {
  await editAssemblyTime(selectedRows, produceBeginDateBatch.value)
  message.success('修改组装单时间成功')
  salesOrderTableRef.value.refresh()
  editAssemblyTimeBatchVisible.value = false
}

//#endregion

//#region ## 禁用非法日期选择 ==================================================
function disabledDateMethod(params) {
  const { date } = params
  const day = time(date)
  const dateStr = day.toString().slice(0, 16)
  return !validDates.value.includes(dateStr)
}

//#endregion
</script>

<template>
  <a-config-provider :locale="zhCN">
    <main class="px-6 py-4">
      <div class="">
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="0" tab="未排产"></a-tab-pane>
          <a-tab-pane key="1" tab="本周"></a-tab-pane>
          <a-tab-pane key="2" force-render tab="下周"></a-tab-pane>
          <a-tab-pane key="3" tab="下下周"></a-tab-pane>
        </a-tabs>
      </div>
      <h2 class="font-bold text-lg">期计划系统</h2>

      <!--       订单需求表 -->
      <BaseTable
        id="salesOrderTableRef"
        ref="salesOrderTableRef"
        :edit-config="{ trigger: 'click', mode: 'cell' }"
        has-pager
        v-bind="salesOrderTable"
        @refreshed="refreshed"
      >
        <template #buttons-left="{ selectedRows }">
          <a-button @click="showModal">excel导入</a-button>
          <a-divider v-show="activeKey !== '0'" class="separator" type="vertical" />
          <a-tooltip placement="topLeft" title="仅在本周时可用">
            <a-button v-show="activeKey !== '0'" :disabled="activeKey !== '1'" @click="handleStoreUniformityCheck">
              <question-circle-outlined v-show="activeKey !== '1'" class="-translate-y-0.5" />
              仓库齐套性检测
            </a-button>
          </a-tooltip>
          <a-button v-show="activeKey !== '0'" @click="handleStoreAtpCheck">ATP齐套性检测</a-button>
          <a-tooltip placement="topLeft" title="仅在本周时可用">
            <a-button v-show="activeKey !== '0'" :disabled="activeKey !== '1'" @click="generateAssemblyOrder">
              <question-circle-outlined v-show="activeKey !== '1'" class="-translate-y-0.5" />
              生成组装单
            </a-button>
          </a-tooltip>
          <a-divider v-show="activeKey !== '0'" class="separator" type="vertical" />
          <a-popconfirm
            :visible="isCaseCloseConfirmVisible"
            cancel-text="取消"
            ok-text="确认"
            title="确认结案"
            @confirm="caseClosed"
            @visibleChange="handleVisibleCaseCloseChange"
          >
            <a-button v-show="activeKey !== '0'">结案</a-button>
          </a-popconfirm>
          <a-divider v-show="selectedRows.length > 0" class="separator" type="vertical" />
          <a-popover v-model:visible="editAssemblyTimeBatchVisible" placement="bottom" trigger="click">
            <template #content>
              <vxe-input
                v-model="produceBeginDateBatch"
                :disabled-method="disabledDateMethod"
                :max-date="validDate.max"
                :min-date="validDate.min"
                parse-format="yyyy-MM-dd"
                placeholder="请选择组装日期"
                type="date"
              ></vxe-input>
              <a-button class="ml-2" size="small" type="primary" @click="editAssemblyTimeBatch(selectedRows)">确认 </a-button>
            </template>
            <a-button v-show="activeKey !== '0' && selectedRows.length > 0"> 批量修改组装时间</a-button>
          </a-popover>
          <a-popconfirm cancel-text="取消" ok-text="确认" title="确认删除?" @confirm="deleteAssemblyOrdersInBulk(selectedRows)">
            <a-button v-show="selectedRows.length > 0" danger type="primary">批量删除组装单</a-button>
          </a-popconfirm>
        </template>
        <template #buttons-right>
          <a-button v-show="hasEdit" type="primary" @click="saveTable">保存编辑</a-button>
          <a-button v-show="hasEdit" @click="resetTable">取消编辑</a-button>
        </template>
        <template #default>
          <vxe-column field="cSalesOrderNo" show-overflow="tooltip" title="订单编号"></vxe-column>
          <vxe-column field="cBomNo" show-overflow="tooltip" title="订单BOM编号"></vxe-column>
          <vxe-column field="cProductNo" show-overflow="tooltip" title="物料编号"></vxe-column>
          <vxe-column
            field="cProductName"
            show-overflow="tooltip"
            title="物料名称
"
          ></vxe-column>
          <vxe-column field="cCustomerName" show-overflow="tooltip" title="客户名"></vxe-column>
          <vxe-column field="fCount" show-overflow="tooltip" title="数量"></vxe-column>
          <!--        :edit-render="{ name: 'ADatePicker' }"-->
          <!--           TODO 无效因为有default slot-->
          <vxe-column :edit-render="{ placeholder: '请选择组装日期' }" field="tProduceBeginDate" show-overflow="tooltip" title="组装开始时间">
            <template #default="{ row }">
              <template v-if="row.tProduceBeginDate">
                <span>
                  {{ formatTime(row.tProduceBeginDate) }}
                </span>
              </template>
              <template v-else>
                <span class="text-gray-300">请选择组装日期</span>
              </template>

              <EditOutlined class="-translate-y-0.5 text-green-400 ml-2" />
            </template>
            <template #edit="{ row, column }">
              <!--  ? ant-design-vue的update和change事件均无效, 不知道原因... -->
              <!--                      <a-date-picker :value="dayjs(row.tProduceBeginDate)" @update:value="log" />-->
              <vxe-input
                v-model="row.tProduceBeginDate"
                :disabled-method="disabledDateMethod"
                :max-date="validDate.max"
                :min-date="validDate.min"
                placeholder="请选择组装日期"
                transfer
                type="date"
                @change="handleCellChange(row, column)"
              ></vxe-input>
            </template>
          </vxe-column>
          <vxe-column v-slot="{ row }" field="cRelateNo" show-overflow="tooltip" title="关联组装单">
            <div class="group">
              <a-button type="link" @click="showAssociatedAssemblyOrder(row)">{{ row.cRelateNo }}</a-button>

              <a-popconfirm
                class="group-hover:inline-block hidden"
                cancel-text="取消"
                ok-text="确认"
                title="确认删除?"
                @confirm="deleteAssemblyOrders(row.cRelateNo)"
              >
                <delete-outlined v-if="row.cRelateNo" class="-ml-2 -translate-y-1 text-red-400" />
              </a-popconfirm>
            </div>
          </vxe-column>
          <!--          <vxe-column field="fStatus" show-overflow="tooltip" title="是否结案"></vxe-column>-->
          <vxe-column v-slot="{ row }" show-overflow="tooltip" title="操作">
            <a-popconfirm cancel-text="取消" ok-text="确认" title="确认删除?" @confirm="handleDelete(row)">
              <a-button danger type="text"> 删除</a-button>
            </a-popconfirm>
          </vxe-column>
        </template>
      </BaseTable>

      <!--    毛需求计算 -->
      <div v-show="activeKey !== '0'">
        <a-divider />
        <h2 class="font-bold text-lg">物料需求清单</h2>
        <div class="mt-4">
          <BaseTable
            id="materialTable"
            ref="materialTableRef"
            v-model:reloading="materialTableReloading"
            :edit-config="{ trigger: 'click', mode: 'cell' }"
            has-pager
            row-id="id"
            v-bind="materialTable"
            @refreshed="materialTableEdit.refreshed"
          >
            <template #buttons-left>
              <a-button
                v-for="button in materialCalcButtons"
                :key="button.text"
                :loading="materialCalculating || materialTableReloading"
                @click="button.handler"
                >{{ button.text }}
              </a-button>
              <a-divider class="separator" type="vertical" />
              <a-popconfirm
                :visible="isWorkOrderReleaseConfirmVisible"
                cancel-text="取消"
                ok-text="确认"
                title="确认下达选中行的工单?"
                @confirm="workOrderRelease"
                @visibleChange="handleVisibleChange"
              >
                <a-button>工单下达</a-button>
              </a-popconfirm>
              <!--             TODO 需要提示-->
              <!--              <a-button>工单计划导出</a-button>-->
              <a-popconfirm
                :visible="isExportConfirmVisible"
                cancel-text="取消"
                ok-text="确认"
                title="确认导出选中行的工单?"
                @confirm="exportExcel"
                @visibleChange="handleVisibileExportChange"
              >
                <a-button>工单计划导出</a-button>
              </a-popconfirm>
            </template>
            <template #buttons-right>
              <a-button v-show="materialTableEdit.hasEdit.value" type="primary" @click="materialTableEdit.saveTable"> 保存编辑 </a-button>
              <a-button v-show="materialTableEdit.hasEdit.value" @click="materialTableEdit.resetTable">取消编辑</a-button>
            </template>
          </BaseTable>
        </div>
      </div>
    </main>

    <!--  导入对话框 -->
    <ModalImport :key="modalKey" v-model:visible="visible" @finish="finishImport"></ModalImport>
    <!--    齐套性检测对话框 -->
    <BaseModal v-model:visible="visibleCheckModal" title="仓库齐套性检测">
      <BaseTable
        id="storeUniformityCheck"
        ref="storeUniformityCheck"
        :has-checkbox="false"
        :max-height-config="{}"
        row-id="cProductNo"
        v-bind="StoreUniformityCheck"
      />
      <!--          :sync-resize="visibleCheckModal"-->
    </BaseModal>

    <!--    ATP齐套性检测 -->
    <BaseModal v-model:visible="visibleCheckAtpModal" title="ATP齐套性检测">
      <div class="w-full">
        <a-alert class="mb-4" banner message="请输入一个或多个BOM编码进行查询（按回车添加）" show-icon type="info" />
        <div class="flex">
          <a-select v-model:value="bomNos" :options="[]" mode="tags" placeholder="请输入BOM编码" style="width: 70%"></a-select>
          <div class="ml-4">
            <!--             loading状态处理?-->
            <a-button :disabled="bomNos.length < 1" :loading="storeAtpCheckReloading" type="primary" @click="handleStoreAtpCheckSearch">查询 </a-button>
          </div>
        </div>
        <BaseTable
          id="storeAtpCheck"
          ref="storeAtpCheck"
          v-model:reloading="storeAtpCheckReloading"
          :has-checkbox="false"
          :max-height-config="{ offset: 180 }"
          row-id="cProductNo"
          v-bind="storeAtpCheckTable"
        />
      </div>
    </BaseModal>
    <!--    关联组装单 -->
    <BaseModal v-model:visible="visibleAssemblyOrderModal" min-height="700" title="关联组装单">
      <div class="w-full">
        <a-button type="primary" @click="print">打印组装单</a-button>
        <div ref="assemblyOrderLists">
          <h2 class="font-bold text-2xl mt-4 text-center">订单列表</h2>
          <BaseTable
            id="assemblyOrder2"
            ref="assemblyOrder2"
            :has-checkbox="false"
            max-height="300"
            row-id="cProductNo"
            v-bind="assemblyOrderTable2"
          ></BaseTable>
          <h2 class="font-bold text-2xl mt-4 text-center">物料需求列表</h2>
          <BaseTable
            id="assemblyOrder"
            ref="assemblyOrder"
            :has-checkbox="false"
            :max-height-config="{ offset: 380 }"
            max-height="400"
            row-id="cProductNo"
            v-bind="assemblyOrderTable"
          ></BaseTable>
          <!--        <BaseTable id="assemblyOrder2" ref="assemblyOrder2" :has-checkbox="false" row-id="cProductNo" v-bind="assemblyOrderTable2" />-->
        </div>
      </div>
    </BaseModal>
  </a-config-provider>
</template>
