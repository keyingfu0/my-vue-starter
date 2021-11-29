<script setup>
// noinspection ES6UnusedImports
import { reactive, ref } from 'vue'
// import { Button as AButton, Tabs as Atab, TabPane } from 'ant-design-vue'

const tableData = reactive([
  { id: 10001, name: 'Test1', role: 'Develop', sex: 'Man', age: 28, address: 'test abc' },
  { id: 10002, name: 'Test2', role: 'Test', sex: 'Women', age: 22, address: 'Guangzhou' },
  { id: 10003, name: 'Test3', role: 'PM', sex: 'Man', age: 32, address: 'Shanghai' },
  {
    id: 10004,
    name: 'Test4',
    sex: 'Designer R Elva Claire Claire Designer R Elva Claire ClaireDesigner R Elva Claire ClaireDesigner R Elva Claire Claire',
    role: 'Women',
    age: 24,
    address: 'Shanghai',
  },
])

const tableData2 = reactive([
  { id: 110001, name: 'Test1', role: 'Develop', sex: 'Man', age: 28, address: 'test abc' },
  { id: 110002, name: 'Test2', role: 'Test', sex: 'Women', age: 22, address: 'Guangzhou' },
  { id: 110003, name: 'Test3', role: 'PM', sex: 'Man', age: 32, address: 'Shanghai' },
  {
    id: 110004,
    name: 'Test4',
    sex: 'Designer R Elva Claire Claire Designer R Elva Claire ClaireDesigner R Elva Claire ClaireDesigner R Elva Claire Claire',
    role: 'Women',
    age: 24,
    address: 'Shanghai',
  },
])

function handleClick() {
  tableData[0].name = '测试'
}

function selectAllChangeEvent() {}

function selectChangeEvent() {}

const activeKey = ref('1')
</script>

<template>
  <main class="px-6 py-4">
    <div class="">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="0" tab="未排产"></a-tab-pane>
        <a-tab-pane key="1" tab="本周"></a-tab-pane>
        <a-tab-pane key="2" tab="下周" force-render></a-tab-pane>
        <a-tab-pane key="3" tab="下下周"></a-tab-pane>
      </a-tabs>
    </div>
    <div class="space-x-4">
      <a-button type="primary" @click="handleClick">excel导入</a-button>
      <a-button type="primary" @click="handleClick">仓库齐套性检测</a-button>
      <a-button type="primary" @click="handleClick">打印组装单 </a-button>
      <a-button type="primary" @click="handleClick">ATP齐套性检测 </a-button>
    </div>
    <vxe-table
      row-id="id"
      :data="tableData"
      stripe
      highlight-hover-row
      class="mt-4"
      :checkbox-config="{ checkField: 'checked', trigger: 'row' }"
      @checkbox-all="selectAllChangeEvent"
      @checkbox-change="selectChangeEvent"
    >
      >
      <vxe-column type="checkbox" width="60"></vxe-column>
      <vxe-column type="seq" width="60"></vxe-column>
      <!--      <vxe-column show-overflow="tooltip" field="name" title="Name">-->
      <!--        <template #default="{ row }">-->
      <!--          <span>自定义插槽模板 {{ row.name }}</span>-->

      <!--        </template>-->
      <!--      </vxe-column>-->

      <vxe-column show-overflow="tooltip" field="sex" title="物料编码"></vxe-column>
      <vxe-column
        show-overflow="tooltip"
        field="sex"
        title="成品名字
"
      ></vxe-column>
      <vxe-column show-overflow="tooltip" field="sex" title="客户名"></vxe-column>
      <vxe-column show-overflow="tooltip" field="sex" title="数量"></vxe-column>
      <vxe-column show-overflow="tooltip" field="sex" title="组装开始时间"></vxe-column>
      <vxe-column show-overflow="tooltip" field="sex" title="关联组装单"></vxe-column>
      <vxe-column show-overflow="tooltip" field="sex" title="是否结案"></vxe-column>
      <vxe-column show-overflow="tooltip" field="sex" title="操作"></vxe-column>
    </vxe-table>

    <!--    毛需求计算 -->
    <a-divider />
    <div class="mt-4">
      <div class="space-x-4">
        <a-button type="primary" @click="handleClick">毛需求计算</a-button>
        <a-button type="primary" @click="handleClick">获取期初结余</a-button>
        <a-button type="primary" @click="handleClick">本期在制量 </a-button>
        <a-button type="primary" @click="handleClick">工单下达 </a-button>
      </div>
      <vxe-table row-id="id" :data="tableData2" stripe highlight-hover-row class="mt-4" :checkbox-config="{ checkField: 'checked', trigger: 'row' }">
        <vxe-column type="checkbox" width="60"></vxe-column>
        <vxe-column type="seq" width="60"></vxe-column>
        <!--      <vxe-column show-overflow="tooltip" field="name" title="Name">-->
        <!--        <template #default="{ row }">-->
        <!--          <span>自定义插槽模板 {{ row.name }}</span>-->

        <!--        </template>-->
        <!--      </vxe-column>-->
        <vxe-column show-overflow="tooltip" field="sex" title="周次编码"></vxe-column>
        <vxe-column
          show-overflow="tooltip"
          field="sex"
          title="零部件名字
"
        ></vxe-column>
        <vxe-column show-overflow="tooltip" field="sex" title="毛需求"></vxe-column>
        <vxe-column show-overflow="tooltip" field="sex" title="期初结余"></vxe-column>
        <vxe-column show-overflow="tooltip" field="sex" title="本周在制量"></vxe-column>
        <vxe-column show-overflow="tooltip" field="sex" title="ATP"></vxe-column>
        <vxe-column show-overflow="tooltip" field="sex" title="关联工单"></vxe-column>
        <vxe-column show-overflow="tooltip" field="sex" title="版本"></vxe-column>
      </vxe-table>
    </div>
  </main>
</template>
