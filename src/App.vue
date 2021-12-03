<script setup>
// noinspection ES6UnusedImports
import { computed, h, nextTick, reactive, ref, resolveComponent, shallowRef, watch } from 'vue'
// import { Button as AButton, Tabs as Atab, TabPane } from 'ant-design-vue'
import ImportExcel from '@/components/ImportExcel.vue'
import { EditOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'

import BaseTable from '@/components/BaseTable.vue'
import ModalImport from '@/components/ModalImport.vue'
import message from 'ant-design-vue/lib/message'
import 'ant-design-vue/lib/message/style/index.css'

import zhCN from 'ant-design-vue/es/locale/zh_CN'
import request from '@/utils/request'
import useRequest, { useList } from '@/utils/useRequest'
import { formatTime } from '@/utils/time'
import { isArray, isObject, map, throttle } from 'lodash'

import { time } from '@/utils/time.js'

// const tableData = ref()

// const tableData2 = reactive()

function handleClick() {
  // tableData.value[0].name = '测试'
}

function selectAllChangeEvent() {}

function selectChangeEvent() {}

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
    end: end.format('YYYY-MM-DD HH:mm:ss'),
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
}

//#endregion

//#region ## 物料需求表 ==================================================
const materialTable = {
  columnSchema: [
    {
      field: 'cWeekNo',
      title: '周次编码',
    },
    {
      field: 'cProductName',
      title: '零部件名字',
    },
    {
      field: 'fGrossCount',
      title: '毛需求',
    },
    {
      field: 'fBalanceCount',
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
    {
      field: 'OrderList',
      title: '关联工单',
      editRender: {
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
      //            <template #default="{ row, rowIndex }">
      // <template v-if="rowIndex === 1">
      //   <vxe-select v-model="row.flag1" transfer>
      //     <vxe-option value="Y" label="是"></vxe-option>
      //     <vxe-option value="N" label="否"></vxe-option>
      //   </vxe-select>
      // </template>
      slots: {
        edit: (props) =>
          h(
            {
              template: `
                <a-select
                  v-model:value="row.OrderList"
                  label-in-value
                  mode="multiple"
                  style="width: 100%"
                  placeholder="请选择工单"
                  option-label-prop="label"
                >
                <a-select-option v-for="option in options" :key="option.cProductionOrderNo"
                                 :value="option.cProductionOrderNo" :label="option.cProductionOrderNo">
                  {{ option.cProductionOrderNo }}
                </a-select-option>

                </a-select>`,
              components: {},
              props: ['row'],
              setup() {
                return {
                  options: [
                    {
                      cProductionOrderNo: 'cs1201',
                    },
                    {
                      cProductionOrderNo: '20211101',
                    },
                  ],
                }
              },
            },
            {
              row: props.row,
            },
          ),
        default: ({ row }) => {
          return h(
            'div',
            null,
            // row.OrderListVal,
            [
              row.OrderList.map((item) => {
                return item.label
              }).join(','),
              // row.cRelateNo,
              h(EditOutlined, {
                class: '-translate-y-0.5 text-green-400 ml-2',
              }),
            ],
          )
        },
      },
    },
    {
      field: 'fVersion',
      title: '版本',
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
}

//#endregion

//#region ## 编辑保存 ==================================================
const hasEdit = ref(false)
const editedRows = shallowRef({})

function handleCellChange(row, column) {
  hasEdit.value = true
  row._hasEdit = true
  editedRows.value = {
    ...editedRows.value,
    [row.id]: row,
  }
}

async function saveTable() {
  hasEdit.value = false
  const List = map(editedRows.value, (row) => {
    const { id, tProduceBeginDate } = row
    return {
      id,
      tProduceBeginDate,
    }
  })
  await request('/ApsSalesOrderInfo/EditApsSalesOrderProductBeginTime', {
    method: 'POST',
    data: {
      List,
    },
  })
  editedRows.value = {}
  message.success('保存成功!')
  salesOrderTableRef.value.refresh()
}

function resetTable() {
  hasEdit.value = false
  salesOrderTableRef.value.refresh()
}

// 编辑后改变单元格样式
const cellStyle = ({ row, column }) => {
  if (column.property === 'tProduceBeginDate') {
    if (row._hasEdit) {
      return {
        backgroundColor: 'lightblue',
      }
    }
  }
}

// 任意刷新之后取消编辑状态
function refreshed() {
  hasEdit.value = false
}

//#endregion

//#region ## 表格工具栏 ==================================================
const salesOrderTableRef = ref()

//#endregion

//#region ## 订单表格单选 ==================================================
// const selectRow = shallowRef()

function getSelectedRows(tableRef) {
  const selectedRows = tableRef.value.getCheckboxRecords()
  console.log('-> selectedRows', selectedRows)
  if (!selectedRows.length) {
    message.warning('未选中数据!')
    return null
  }

  return selectedRows
}

//#endregion

//#region ## 仓库齐套性检测 ==================================================
const visibleCheckModal = ref(false)

function handleStoreUniformityCheck() {
  // 是否选中行
  const selectedRows = salesOrderTableRef.value.getSelectedRows()
  if (!selectedRows) {
    return
  }

  visibleCheckModal.value = true
}

//#endregion

//#region ## 工单下达 ==================================================
const isWorkOrderReleaseConfirmVisible = ref(false)
const materialTableRef = ref()

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
const materialButtonStates = reactive({
  grossDemandCalculation: {
    loading: false,
  },
})

async function grossDemandCalculation() {
  const { loading } = useRequest(async () => {
    return request('/ApsSalesOrderInfo/GrossCalculation', {
      method: 'post',
      data: {
        cWeekNo: activeWeek.value.tStartDateBegin,
        ...activeWeek.value,
      },
    })
  })
  const stop = watch(loading, (newVal, oldVal) => {
    materialButtonStates.grossDemandCalculation.loading = newVal
    if (oldVal && !newVal) {
      message.success('毛需求计算成功！版本已更新')
      materialTableRef.value.refresh()
      stop()
    }
  })
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
        :cell-style="cellStyle"
        :edit-config="{ trigger: 'click', mode: 'cell' }"
        has-pager
        v-bind="salesOrderTable"
        @refreshed="refreshed"
      >
        <template #buttons-left>
          <a-button @click="showModal">excel导入</a-button>
          <a-button @click="handleStoreUniformityCheck">仓库齐套性检测</a-button>
          <a-button @click="handleClick">打印组装单</a-button>
          <a-button @click="handleStoreUniformityCheck">ATP齐套性检测</a-button>
          <a-button @click="handleStoreUniformityCheck">结案</a-button>
        </template>
        <template #buttons-right>
          <a-button v-show="hasEdit" type="primary" @click="saveTable">保存编辑</a-button>
          <a-button v-show="hasEdit" @click="resetTable">取消编辑</a-button>
        </template>
        <template #default>
          <vxe-column field="cProductNo" show-overflow="tooltip" title="物料编码"></vxe-column>
          <vxe-column
            field="cProductName"
            show-overflow="tooltip"
            title="成品名字
"
          ></vxe-column>
          <vxe-column field="cCustomerName" show-overflow="tooltip" title="客户名"></vxe-column>
          <vxe-column field="fCount" show-overflow="tooltip" title="数量"></vxe-column>
          <!--        :edit-render="{ name: 'ADatePicker' }"-->
          <vxe-column :edit-render="{}" field="tProduceBeginDate" show-overflow="tooltip" title="组装开始时间">
            <template #default="{ row }">
              <span>
                {{ formatTime(row.tProduceBeginDate) }}
              </span>
              <EditOutlined class="-translate-y-0.5 text-green-400 ml-2" />
            </template>
            <template #edit="{ row, column }">
              <!--  ? ant-design-vue的update和change事件均无效, 不知道原因... -->
              <!--                      <a-date-picker :value="dayjs(row.tProduceBeginDate)" @update:value="log" />-->
              <vxe-input v-model="row.tProduceBeginDate" placeholder="请选择日期" transfer type="date" @change="handleCellChange(row, column)"></vxe-input>
            </template>
          </vxe-column>
          <vxe-column field="cRelateNo" show-overflow="tooltip" title="关联组装单"></vxe-column>
          <!--          <vxe-column field="fStatus" show-overflow="tooltip" title="是否结案"></vxe-column>-->
          <vxe-column v-slot="{ row }" show-overflow="tooltip" title="操作">
            <a-popconfirm cancel-text="取消" ok-text="确认" title="确认删除?" @confirm="handleDelete(row)">
              <a-button danger type="text"> 删除</a-button>
            </a-popconfirm>
          </vxe-column>
        </template>
      </BaseTable>

      <!--    毛需求计算 -->
      <a-divider />
      <h2 class="font-bold text-lg">物料需求清单</h2>
      <div class="mt-4">
        <BaseTable
          id="materialTable"
          ref="materialTableRef"
          :edit-config="{ trigger: 'click', mode: 'cell' }"
          has-pager
          row-id="cProductNo"
          v-bind="materialTable"
        >
          <template #buttons-left>
            <a-tooltip placement="top">
              <template v-if="activeKey === '0'" #title>
                <span>请先排产订单,然后选择相应周次计算</span>
              </template>
              <a-button :disabled="activeKey === '0'" :loading="materialButtonStates.grossDemandCalculation.loading" @click="grossDemandCalculation"
                >毛需求计算
                <QuestionCircleOutlined v-show="activeKey === '0'" class="-translate-y-1 text-gray-500" />
              </a-button>
            </a-tooltip>
            <a-tooltip placement="top">
              <template v-if="activeKey === '0'" #title>
                <span>请先排产订单,然后选择相应周次计算</span>
              </template>
              <a-button :disabled="activeKey === '0'" @click="grossDemandCalculation"
                >获取期初结余
                <QuestionCircleOutlined v-show="activeKey === '0'" class="-translate-y-1 text-gray-500" />
              </a-button>
            </a-tooltip>
            <a-tooltip placement="top">
              <template v-if="activeKey === '0'" #title>
                <span>请先排产订单,然后选择相应周次计算</span>
              </template>
              <a-button :disabled="activeKey === '0'" @click="grossDemandCalculation"
                >本期在制量
                <QuestionCircleOutlined v-show="activeKey === '0'" class="-translate-y-1 text-gray-500" />
              </a-button>
            </a-tooltip>
            <a-popconfirm
              :visible="isWorkOrderReleaseConfirmVisible"
              cancel-text="取消"
              ok-text="确认"
              title="确认下达工单?"
              @visibleChange="handleVisibleChange"
            >
              <a-button>工单下达</a-button>
            </a-popconfirm>
            <!--             TODO 需要提示-->
            <a-button>工单导出</a-button>
          </template>
        </BaseTable>
      </div>
    </main>

    <!--  导入对话框 -->
    <ModalImport :key="modalKey" v-model:visible="visible" @finish="finishImport"></ModalImport>
    <!--    齐套性检测对话框 -->
    <a-modal v-model:visible="visibleCheckModal" class="flex justify-center" :footer="null" title="仓库齐套性检测" width="auto">
      <div class="min-w-[1200px]">
        <BaseTable id="storeUniformityCheck" :has-checkbox="false" row-id="cProductNo" v-bind="materialTable" />
      </div>
    </a-modal>
  </a-config-provider>
</template>
