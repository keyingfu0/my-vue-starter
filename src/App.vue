<script setup>
// noinspection ES6UnusedImports
import { h, nextTick, reactive, ref, resolveComponent, shallowRef, watch } from 'vue'
// import { Button as AButton, Tabs as Atab, TabPane } from 'ant-design-vue'
import ImportExcel from '@/components/ImportExcel.vue'
import { EditOutlined } from '@ant-design/icons-vue'

import BaseTable from '@/components/BaseTable.vue'
import ModalImport from '@/components/ModalImport.vue'
import message from 'ant-design-vue/lib/message'
import 'ant-design-vue/lib/message/style/index.css'

import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const tableData = ref([
  {
    cProductNo: '001',
    cProductName: 'shifou ',
    cCustomerName: '小王',
    fCount: '1000',
    tProduceBeginDate: '2021/11/16',
    cRelateNo: '',
    fStatus: 0,
  },
  {
    cProductNo: '002',
    cProductName: 'shifou ',
    cCustomerName: '小王',
    fCount: '1000',
    tProduceBeginDate: '2021/11/16',
    cRelateNo: '',
    fStatus: 0,
  },
])

const tableData2 = reactive([
  {
    cWeekNo: '2021第21周(11.22~11.28)',
    cProductNo: '001',
    cProductName: '300',
    fGrossCount: '200',
    fBalanceCount: '100',
    fProduceCount: '100',
    fATPCount: '10',
    OrderList: [
      {
        cProductionOrderNo: 'cs1201',
        fIsReleaseOrder: 0,
        label: 'cs1201',
        value: 'cs1201',
      },
    ],
    OrderListVal: ['cs1201', '20211101'],
    cRelateNo: 'cs1201,20211101',
    fVersion: '2',
  },
  {
    cWeekNo: '2021第21周(11.22~11.28)',
    cProductNo: '002',
    cProductName: '300',
    fGrossCount: '200',
    fBalanceCount: '100',
    fProduceCount: '100',
    fATPCount: '10',
    OrderList: [
      {
        cProductionOrderNo: 'cs1201',
        fIsReleaseOrder: 0,
        label: 'cs1201',
        value: 'cs1201',
      },
      {
        cProductionOrderNo: '20211101',
        fIsReleaseOrder: 1,
        label: '20211101',
        value: '20211101',
      },
    ],
    OrderListVal: ['cs1201', '20211101'],
    cRelateNo: 'cs1201,20211101',
    fVersion: '2',
  },
])

function handleClick() {
  tableData.value[0].name = '测试'
}

function selectAllChangeEvent() {}

function selectChangeEvent() {}

const activeKey = ref('0')

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
}

//#endregion

//#region ## 编辑保存 ==================================================
const hasEdit = ref(false)

function handleCellChange(row, column) {
  hasEdit.value = true
  row._hasEdit = true
}

function saveTable() {
  hasEdit.value = false
}

function resetTable() {
  hasEdit.value = false
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

//#endregion

function log(v) {
  console.log('vvvvvvvvv', v)
}

//#region ## 表格工具栏 ==================================================
const salesOrderTable = ref()
const salesOrderTableToolbar = ref()

nextTick(() => {
  // 将表格和工具栏进行关联
  const $table = salesOrderTable.value
  const $toolbar = salesOrderTableToolbar.value
  $table.connect($toolbar)
})

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
  const selectedRows = getSelectedRows(salesOrderTable)
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

      <!--     上方按钮 -->
      <vxe-toolbar ref="salesOrderTableToolbar" custom print>
        <template #buttons>
          <div class="flex justify-between mr-4">
            <div class="space-x-4">
              <a-button @click="showModal">excel导入</a-button>
              <a-button @click="handleStoreUniformityCheck">仓库齐套性检测</a-button>
              <a-button @click="handleClick">打印组装单</a-button>
              <a-button @click="handleStoreUniformityCheck">ATP齐套性检测</a-button>
            </div>
            <div class="space-x-4">
              <a-button v-show="hasEdit" type="primary" @click="saveTable">保存编辑</a-button>
              <a-button v-show="hasEdit" @click="resetTable">取消编辑</a-button>
            </div>
          </div>
        </template>
      </vxe-toolbar>
      <vxe-table
        id="salesOrderTable"
        ref="salesOrderTable"
        class="mt-4"
        :cell-style="cellStyle"
        :column-config="{ resizable: true }"
        :custom-config="{ storage: true }"
        :data="tableData"
        :edit-config="{ trigger: 'click', mode: 'cell' }"
        :print-config="{}"
        :radio-config="{ highlight: true }"
        highlight-hover-row
        row-id="cProductNo"
        @checkbox-all="selectAllChangeEvent"
        @checkbox-change="selectChangeEvent"
      >
        <vxe-column type="checkbox" width="60"></vxe-column>
        <vxe-column type="seq" width="60"></vxe-column>
        <!--      <vxe-column show-overflow="tooltip" field="name" title="Name">-->
        <!--        <template #default="{ row }">-->
        <!--          <span>自定义插槽模板 {{ row.name }}</span>-->

        <!--        </template>-->
        <!--      </vxe-column>-->

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
              {{ row.tProduceBeginDate }}
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
        <vxe-column field="fStatus" show-overflow="tooltip" title="是否结案"></vxe-column>
        <vxe-column show-overflow="tooltip" title="操作">操作</vxe-column>
      </vxe-table>

      <!--    毛需求计算 -->
      <a-divider />
      <h2 class="font-bold text-lg">物料需求清单</h2>
      <div class="mt-4">
        <BaseTable
          id="materialTable"
          ref="materialTableRef"
          :data="tableData2"
          :edit-config="{ trigger: 'click', mode: 'cell' }"
          has-pager
          row-id="cProductNo"
          v-bind="materialTable"
        >
          <template #buttons-left>
            <a-button @click="handleClick">毛需求计算</a-button>
            <a-button @click="handleClick">获取期初结余</a-button>
            <a-button @click="handleClick">本期在制量</a-button>
            <a-popconfirm
              :visible="isWorkOrderReleaseConfirmVisible"
              cancel-text="取消"
              ok-text="确认"
              placement="bottom"
              title="确认下达工单?"
              @visibleChange="handleVisibleChange"
            >
              <a-button>工单下达</a-button>
            </a-popconfirm>
          </template>
        </BaseTable>
      </div>
    </main>

    <!--  导入对话框 -->
    <ModalImport :key="modalKey" v-model:visible="visible" @finish="finishImport"></ModalImport>
    <!--    齐套性检测对话框 -->
    <a-modal v-model:visible="visibleCheckModal" class="flex justify-center" :footer="null" title="仓库齐套性检测" width="auto">
      <div class="min-w-[1200px]">
        <BaseTable id="storeUniformityCheck" :data="tableData2" :has-checkbox="false" row-id="cProductNo" v-bind="materialTable" />
      </div>
    </a-modal>
  </a-config-provider>
</template>
