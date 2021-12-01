<script setup>
// noinspection ES6UnusedImports
import { h, nextTick, reactive, ref, shallowRef, watch } from 'vue'
// import { Button as AButton, Tabs as Atab, TabPane } from 'ant-design-vue'
import ImportExcel from '@/components/ImportExcel.vue'

import BaseTable from '@/components/BaseTable.vue'
import ModalImport from '@/components/ModalImport.vue'

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
    cRelateNo: '0012',
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
    cRelateNo: '0012',
    fVersion: '2',
  },
  {
    cWeekNo: '2021第21周(11.22~11.28)',
    cProductNo: '003',
    cProductName: '300',
    fGrossCount: '200',
    fBalanceCount: '100',
    fProduceCount: '100',
    fATPCount: '10',
    cRelateNo: '0012',
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
      field: 'cProductNo',
      title: '零部件名字',
    },
    {
      field: 'cProductName',
      title: '毛需求',
    },
    {
      field: 'fGrossCount',
      title: '期初结余',
    },
    {
      field: 'fBalanceCount',
      title: '本周在制量',
    },
    {
      field: 'fProduceCount',
      title: 'ATP',
    },
    {
      field: 'fATPCount',
      title: '关联工单',
    },
    {
      field: 'cRelateNo',
      title: '版本',
    },
  ],
}

//#endregion

//#region ## 编辑保存 ==================================================
const hasEdit = ref(false)

function handleCellChange(row, column) {
  hasEdit.value = true
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
    if (row.sex >= '1') {
      return {
        backgroundColor: '#187',
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
              <a-button @click="handleClick">仓库齐套性检测</a-button>
              <a-button @click="handleClick">打印组装单</a-button>
              <a-button @click="handleClick">ATP齐套性检测</a-button>
            </div>
            <div class="space-x-4">
              <a-button v-show="hasEdit" type="primary" @click="saveTable">保存编辑</a-button>
              <a-button v-show="hasEdit" @click="resetTable">取消编辑</a-button>
            </div>
          </div>
        </template>
      </vxe-toolbar>
      <vxe-table
        ref="salesOrderTable"
        class="mt-4"
        :cell-style="cellStyle"
        :data="tableData"
        :edit-config="{ trigger: 'click', mode: 'cell' }"
        :print-config="{}"
        highlight-hover-row
        row-id="cProductNo"
        stripe
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
        <vxe-column :edit-render="{}" :formatter="['formatDate', 'yyyy/MM/dd']" field="tProduceBeginDate" show-overflow="tooltip" title="组装开始时间">
          <template #edit="{ row, column }">
            <!--  ? ant-design-vue的update和change事件均无效, 不知道原因... -->
            <!--            <a-date-picker :value="dayjs(row.tProduceBeginDate)" @update:value="log" />-->
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
        <div class="space-x-4">
          <a-button type="primary" @click="handleClick">毛需求计算</a-button>
          <a-button type="primary" @click="handleClick">获取期初结余</a-button>
          <a-button type="primary" @click="handleClick">本期在制量</a-button>
          <a-button type="primary" @click="handleClick">工单下达</a-button>
        </div>
        <BaseTable :data="tableData2" row-id="cProductNo" v-bind="materialTable" />
      </div>
    </main>

    <!--  对话框 -->
    <ModalImport :key="modalKey" v-model:visible="visible" @finish="finishImport"></ModalImport>
  </a-config-provider>
</template>
