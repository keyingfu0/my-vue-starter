<script setup>
// noinspection ES6UnusedImports
import { reactive, ref, h, watch } from 'vue'
import { saveAs } from 'file-saver'
// import { Button as AButton, Tabs as Atab, TabPane } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import ImportExcel from '@/components/ImportExcel.vue'

const tableData = reactive([
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
  tableData[0].name = '测试'
}

function selectAllChangeEvent() {}

function selectChangeEvent() {}

const activeKey = ref('1')

//#region ## 按钮 ==================================================

const visible = ref(false)

function showModal() {
  visible.value = true
}
//#endregion

//#region ## excel导入 ==================================================
const current = ref(0)
const nextButtonState = reactive({
  1: {
    disabled: true,
    loading: false,
  },
})

const next = () => {
  current.value++
}
const prev = () => {
  current.value--
}

// function setButtonDisabled(value) {
//
// }
watch(
  () => nextButtonState['1'].loading,
  (newVal) => {
    if (!newVal) {
      nextButtonState['1'].disabled = false
    }
  },
)

const steps = [
  {
    title: '下载模板',
    content: {
      template: `<div class="mt-4 text-lg flex justify-center" >
<!--       <span @click="handleDownload">点击下载excel模板</span>-->
       <a @click="handleDownload" href="http://47.98.59.211:6247/Content/template/ApsSalesOrderImport.xlsx" download="订单导入模板.xls">点击下载订单导入模板</a>
      </div>`,
      setup() {
        function handleDownload() {
          console.log('download')
          next()
          // saveAs('http://47.98.59.211:6247/Content/template/ProductionOrderTemplate.xls', '订单模板.xls')
        }
        return {
          handleDownload,
        }
        // return
      },
    },
  },
  {
    title: '导入excel数据',
    // content: '从excel文件中导入数据',
    content: {
      template: `<ImportExcel :next="next" v-model:is-loading="nextButtonState['1'].loading"></ImportExcel>`,
      components: { ImportExcel },
      setup() {
        return {
          next,
          nextButtonState,
        }
      },
    },
  },
  {
    title: '预览并确认',
    // content: '预览导入数据并确认导入',
  },
]

//#endregion
</script>

<template>
  <main class="px-6 py-4">
    <h2 class="font-bold text-lg">期计划系统</h2>
    <div class="">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="0" tab="未排产"></a-tab-pane>
        <a-tab-pane key="1" tab="本周"></a-tab-pane>
        <a-tab-pane key="2" tab="下周" force-render></a-tab-pane>
        <a-tab-pane key="3" tab="下下周"></a-tab-pane>
      </a-tabs>
    </div>
    <!--     上方按钮 -->
    <div class="space-x-4">
      <a-button type="primary" @click="showModal">excel导入</a-button>
      <a-button type="primary" @click="handleClick">仓库齐套性检测</a-button>
      <a-button type="primary" @click="handleClick">打印组装单 </a-button>
      <a-button type="primary" @click="handleClick">ATP齐套性检测 </a-button>
    </div>
    <vxe-table
      row-id="cProductNo"
      :data="tableData"
      stripe
      highlight-hover-row
      class="mt-4"
      :checkbox-config="{ checkField: 'checked', trigger: 'row' }"
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

      <vxe-column show-overflow="tooltip" field="cProductNo" title="物料编码"></vxe-column>
      <vxe-column
        show-overflow="tooltip"
        field="cProductName"
        title="成品名字
"
      ></vxe-column>
      <vxe-column show-overflow="tooltip" field="cCustomerName" title="客户名"></vxe-column>
      <vxe-column show-overflow="tooltip" field="fCount" title="数量"></vxe-column>
      <vxe-column show-overflow="tooltip" field="tProduceBeginDate" title="组装开始时间"></vxe-column>
      <vxe-column show-overflow="tooltip" field="cRelateNo" title="关联组装单"></vxe-column>
      <vxe-column show-overflow="tooltip" field="fStatus" title="是否结案"></vxe-column>
      <vxe-column show-overflow="tooltip" title="操作">操作</vxe-column>
    </vxe-table>

    <!--    毛需求计算 -->
    <a-divider />
    <h2 class="font-bold text-lg">物料需求清单</h2>
    <div class="mt-4">
      <div class="space-x-4">
        <a-button type="primary" @click="handleClick">毛需求计算</a-button>
        <a-button type="primary" @click="handleClick">获取期初结余</a-button>
        <a-button type="primary" @click="handleClick">本期在制量 </a-button>
        <a-button type="primary" @click="handleClick">工单下达 </a-button>
      </div>
      <vxe-table row-id="cProductNo" :data="tableData2" stripe highlight-hover-row class="mt-4" :checkbox-config="{ checkField: 'checked', trigger: 'row' }">
        <vxe-column type="checkbox" width="60"></vxe-column>
        <vxe-column type="seq" width="60"></vxe-column>
        <!--      <vxe-column show-overflow="tooltip" field="name" title="Name">-->
        <!--        <template #default="{ row }">-->
        <!--          <span>自定义插槽模板 {{ row.name }}</span>-->

        <!--        </template>-->
        <!--      </vxe-column>-->
        <vxe-column show-overflow="tooltip" field="cWeekNo" title="周次编码"></vxe-column>
        <vxe-column
          show-overflow="tooltip"
          field="cProductNo"
          title="零部件名字
"
        ></vxe-column>
        <vxe-column show-overflow="tooltip" field="cProductName" title="毛需求"></vxe-column>
        <vxe-column show-overflow="tooltip" field="fGrossCount" title="期初结余"></vxe-column>
        <vxe-column show-overflow="tooltip" field="fBalanceCount" title="本周在制量"></vxe-column>
        <vxe-column show-overflow="tooltip" field="fProduceCount" title="ATP"></vxe-column>
        <vxe-column show-overflow="tooltip" field="fATPCount" title="关联工单"></vxe-column>
        <vxe-column show-overflow="tooltip" field="cRelateNo" title="版本"></vxe-column>
      </vxe-table>
    </div>
  </main>

  <!--  对话框 -->
  <a-modal v-model:visible="visible" title="Excel导入" width="auto" class="flex justify-center">
    <div class="min-w-[800px]">
      <a-steps :current="current">
        <a-step v-for="item in steps" :key="item.title" :title="item.title" />
      </a-steps>
      <div class="steps-content" v-show="steps[current].content">
        <keep-alive>
          <component :is="steps[current].content"></component>
        </keep-alive>
        <!--        {{ steps[current].content }}-->
      </div>
    </div>
    <template #footer>
      <div class="steps-action">
        <a-button v-if="current > 0" style="margin-left: 8px" @click="prev">上一步</a-button>
        <a-button v-if="current < steps.length - 1" type="primary" @click="next" v-bind="nextButtonState[current]">下一步</a-button>
        <a-button v-if="current == steps.length - 1" type="primary" @click="$message.success('Processing complete!')"> 完成 </a-button>
      </div>
    </template>
  </a-modal>
</template>
