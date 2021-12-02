<script setup>
import { h, nextTick, reactive, ref, resolveComponent } from 'vue'
import message from 'ant-design-vue/lib/message'
import 'ant-design-vue/lib/message/style/index.css'
import { useList } from '@/utils/useRequest'
import request from '@/utils/request'

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  columnSchema: {
    type: Array,
    default: () => [],
  },
  hasCheckbox: {
    type: Boolean,
    default: true,
  },
  hasToolbar: {
    type: Boolean,
    default: true,
  },
  hasPager: {
    type: Boolean,
    default: false,
  },
  requestConfig: {
    type: Array,
    default: null,
  },
})

//#region ## 表格工具栏 ==================================================
const table = ref()
const toolbar = ref()

if (props.hasToolbar) {
  nextTick(() => {
    // 将表格和工具栏进行关联
    const $table = table.value
    const $toolbar = toolbar.value
    $table.connect($toolbar)
  })
}

//#endregion

//
const columns = () => {
  return props.columnSchema.map((col) => {
    return h(
      resolveComponent('vxe-column'),
      {
        showOverflow: 'tooltip',
        ...col,
        key: col.field,
      },
      col.slots ?? {},
    )
  })
}

//#region ## 数据请求 ==================================================

const { data: resData, current, total, pageSize } = props.requestConfig ? useList.$preset(['get-list'])(...props.requestConfig) : {}
console.log('-> tableData', resData)
// console.log('rrrr', rrrr)

//#endregion

//#region ## 分页 ==================================================
const tablePage = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 10,
})
const handlePageChange = ({ currentPage, pageSize }) => {
  tablePage.currentPage = currentPage
  tablePage.pageSize = pageSize
  // findList()
}

//#endregion

//#region ## 获取选中行 ==================================================
function getSelectedRows() {
  const selectedRows = table.value.getCheckboxRecords()
  console.log('-> selectedRows', selectedRows)
  if (!selectedRows.length) {
    message.warning('未选中数据!')
    return null
  }

  return selectedRows
}

defineExpose({
  getSelectedRows,
})
//#endregion
</script>

<template>
  <!--     上方按钮 -->
  <vxe-toolbar v-if="hasToolbar" ref="toolbar" custom print>
    <template #buttons>
      <div class="flex justify-between mr-4">
        <div class="space-x-4">
          <slot name="buttons-left"></slot>
        </div>
        <div class="space-x-4">
          <slot name="buttons-right"></slot>
        </div>
      </div>
    </template>
  </vxe-toolbar>
  <!--   NOTE 需要解决点击编辑冲突的问题-->
  <!--    :checkbox-config="{ checkField: 'checked', trigger: 'row' }"-->
  <vxe-table
    ref="table"
    class="mt-4"
    :column-config="{ resizable: true }"
    :custom-config="{ storage: true }"
    :data="data"
    :print-config="{}"
    highlight-hover-row
    v-bind="$attrs"
  >
    <vxe-column v-if="hasCheckbox" type="checkbox" width="60"></vxe-column>
    <vxe-column type="seq" width="60"></vxe-column>
    <component :is="columns"></component>
    <slot name="default"></slot>
    <!--    <vxe-column v-for="col in columnSchema" :key="col.field" show-overflow="tooltip" v-bind="col">-->
    <!--      &lt;!&ndash;      <template v-if="col.slots">&ndash;&gt;-->
    <!--      &lt;!&ndash;        <template v-for="(slot,slotKey) in col.slots" :key="slotKey">&ndash;&gt;-->
    <!--      &lt;!&ndash;          <tamplte v-slot:[slotKey]>&ndash;&gt;-->
    <!--      &lt;!&ndash;            &ndash;&gt;-->
    <!--      &lt;!&ndash;          </tamplte>&ndash;&gt;-->
    <!--      &lt;!&ndash;        </template>&ndash;&gt;-->
    <!--      &lt;!&ndash;      </template>&ndash;&gt;-->
    <!--    </vxe-column>-->
  </vxe-table>

  <vxe-pager
    v-if="hasPager"
    v-model:current-page="tablePage.currentPage"
    v-model:page-size="tablePage.pageSize"
    :layouts="['Sizes', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'FullJump', 'Total']"
    :total="tablePage.total"
    @page-change="handlePageChange"
  >
  </vxe-pager>
</template>
