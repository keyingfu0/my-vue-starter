<script setup>
import { h, nextTick, reactive, ref, resolveComponent, shallowRef, watch } from 'vue'
import message from 'ant-design-vue/lib/message'
import 'ant-design-vue/lib/message/style/index.css'
import useRequest, { useList } from '@/utils/useRequest'
import request from '@/utils/request'
import { ReloadOutlined } from '@ant-design/icons-vue'

const props = defineProps({
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
  // /**
  //  * 表格数据是否新鲜
  //  */
  // isFresh: {
  //   type: Boolean,
  //   default: false,
  // },

  /**
   * 删除配置
   */
  deleteConfig: {
    type: Object,
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

const { data = [], loading, current, total, pageSize, refresh } = props.requestConfig ? useList.$preset(['get-list'])(...props.requestConfig) : {}
// const {data, refresh} = useRequest(...props.requestConfig)
// useRequest(()=>{
//   return
// })
console.log('-> tableData', data)

// 当表格数据不新鲜时刷新表格数据
// watch(()=>props.isFresh,async (newVal)=>{
//   if(!newVal){
//     await refresh()
//     update
//   }
// })
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

//#endregion

//#region ## 删除 ==================================================
const selectedRows = shallowRef([])

function handleCheckboxChange({ records }) {
  selectedRows.value = records
}

async function handleDelete(row) {
  const rows = row ? [row] : selectedRows.value
  console.log('-> rows', rows)
  const { handler } = props.deleteConfig
  await handler(rows.map((item) => item.id))
  message.success('删除成功!')
  refreshTableData()
}

async function refreshTableData() {
  await refresh()
  //  ? 有bug, 奇怪的需要手动清除选择,不然无法取消选择状态
  table.value.clearCheckboxRow()
  selectedRows.value = []
}

//#endregion

defineExpose({
  getSelectedRows,
  refresh: refreshTableData,
  handleDelete,
})
</script>

<template>
  <!--     上方按钮 -->
  <vxe-toolbar v-if="hasToolbar" ref="toolbar" custom print>
    <template #buttons>
      <div class="flex justify-between mr-4">
        <div class="space-x-4">
          <slot name="buttons-left"></slot>
          <a-popconfirm v-if="deleteConfig" cancel-text="取消" ok-text="确认" title="确认删除?" @confirm="handleDelete()">
            <a-button v-show="selectedRows.length > 0" danger type="primary">删除</a-button>
          </a-popconfirm>
        </div>
        <div class="space-x-4">
          <slot name="buttons-right"></slot>
          <a-button shape="circle" @click="refreshTableData">
            <template #icon>
              <ReloadOutlined class="-translate-y-0.5" />
            </template>
          </a-button>
        </div>
      </div>
    </template>
  </vxe-toolbar>
  <!--   NOTE 需要解决点击编辑冲突的问题-->
  <!--    :checkbox-config="{ checkField: 'checked', trigger: 'row' }"-->
  <vxe-table
    ref="table"
    class="mt-4"
    :checkbox-config="{ range: true, highlight: true }"
    :column-config="{ resizable: true }"
    :custom-config="{ storage: true }"
    :data="data"
    :loading="loading"
    :print-config="{}"
    highlight-hover-row
    row-id="id"
    v-bind="$attrs"
    @checkbox-change="handleCheckboxChange"
    @checkbox-all="handleCheckboxChange"
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
