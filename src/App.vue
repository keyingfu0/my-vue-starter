<script setup>
// noinspection ES6UnusedImports
import { reactive } from 'vue'
import { Button as AButton } from 'ant-design-vue'

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

function handleClick() {
  tableData[0].name = '测试'
}
</script>

<template>
  <main class="px-6 py-4">
    <div class="">
      <a-button type="primary" @click="handleClick">测试</a-button>
    </div>
    <vxe-table :data="tableData" stripe highlight-hover-row>
      <vxe-column type="seq" width="60"></vxe-column>
      <vxe-column show-overflow="tooltip" field="name" title="Name">
        <template #default="{ row }">
          <span>自定义插槽模板 {{ row.name }}</span>
        </template>
      </vxe-column>
      <vxe-column show-overflow="tooltip" field="sex" title="Sex"></vxe-column>
      <vxe-column show-overflow="tooltip" field="age" title="Age"></vxe-column>
    </vxe-table>
  </main>
</template>
