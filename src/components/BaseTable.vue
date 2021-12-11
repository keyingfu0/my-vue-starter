<script setup>
import { computed, h, inject, nextTick, onMounted, reactive, ref, resolveComponent, shallowRef, watch } from 'vue'
import message from 'ant-design-vue/es/message'
import 'ant-design-vue/es/message/style/index.css'
import useRequest, { useList } from '@/utils/useRequest'
import request from '@/utils/request'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { useResizeObserver } from '@vueuse/core/index'

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
  reloading: {
    type: Boolean,
    default: false,
  },
  customPreset: {
    type: Array,
    default: null,
  },
  showOverflow: {
    type: String,
    default: 'tooltip',
  },

  maxHeight: {
    type: String,
    default: '550',
  },
  /**
   * 动态计算最大高度
   */
  maxHeightConfig: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['refreshed', 'update:reloading'])

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
        // showOverflow: 'tooltip',
        ...col,
        key: col.field,
      },
      col.slots ?? {},
    )
  })
}

//#region ## 数据请求 ==================================================

const { data = [], loading, current, total, pageSize, refresh, changePagination, reloading, run } = props.requestConfig
  ? props.customPreset
    ? useRequest.$preset(props.customPreset)(...props.requestConfig)
    : useList.$preset(['loading-delay'])(...props.requestConfig)
  : {}
console.log('-> total', total)

// sync reloading
if (props.reloading !== undefined) {
  // console.log('-> props.reloading', props.reloading)
  watch([loading, reloading], (newValues) => {
    console.log('-> newValues', newValues)
    emit('update:reloading', newValues[0] || newValues[1])
  })
}
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
// const tablePage = reactive({
//   total: 0,
//   currentPage: 1,
//   pageSize: 10,
// })
// const handlePageChange = ({ currentPage, pageSize: _pageSize }) => {
//   current.value = currentPage
//   pageSize.value = _pageSize
//   // findList()
// }

function handlePageSizeChange(val) {
  // NOTE 记得重置到第一页, 需要用这种一起改变!!
  changePagination(1, val)
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
  // props.refreshed && props.refreshed()
  emit('refreshed')
}

//#endregion

//#region ## 获取数据长度 ==================================================
function getTableDataLength() {
  return data.value.length
}

//#endregion

//#region ## 计算最大高度 ==================================================
const tableMaxHeight = ref(props.maxHeight)
//
// function setTableMaxHeight(val) {
//   tableMaxHeight.value = val
// }

// TODO 更好的实现方式
function handleZoom(el, options = {}) {
  // TODO offset可以通过第一次计算 height - table.value.$el.offsetHeight 获取
  const { offset = 90 } = options
  const $container = el.querySelector('.vxe-modal--content')
  const height = $container.offsetHeight
  // const offset = height - table.value.$el.offsetHeight
  console.log('-> offset', offset)
  console.log('-> height', height)
  const res = height - offset
  if (res > 0) {
    tableMaxHeight.value = res
  }
}

if (props.maxHeightConfig) {
  // const {handleZoom} = props.maxHeightConfig
  const onZoom = inject('onZoom')
  if (onZoom) {
    onZoom((el) => {
      handleZoom(el, props.maxHeightConfig)
    })
  }
  // ;(async function calcMaxHeight() {
  //   const { el = '.vxe-modal--content', margin = 10 } = props.maxHeightConfig
  //
  //   if (el) {
  //     await nextTick()
  //     const $parent = table.value.$el.closest(el)
  //     console.log('-> $parent', $parent)
  //     const toolbarHeight = props.hasToolbar ? 52 : 0
  //     // const initialHeight =
  //     useResizeObserver($parent, (entries) => {
  //       const entry = entries[0]
  //       const { height } = entry.contentRect
  //       if (height < parseInt(tableMaxHeight.value)) {
  //         return
  //       }
  //       console.log('-> height', height)
  //       // // if()
  //       // tableMaxHeight.value = Number(height) - toolbarHeight - margin
  //       // console.log('-> tableMaxHeight', tableMaxHeight.value)
  //     })
  //   }
  // })()
}

//#endregion

defineExpose({
  getSelectedRows,
  refresh: refreshTableData,
  handleDelete,
  getTableDataLength,
  fetchData: run,
  async print(args) {
    return table.value.print(args)
  },
  clearActived: async () => {
    return table.value.clearActived()
  },
})
</script>

<template>
  <!--     上方按钮 -->
  <vxe-toolbar v-if="hasToolbar" ref="toolbar" custom print>
    <template #buttons>
      <div class="flex justify-between mr-4">
        <div class="space-x-4">
          <slot :selectedRows="selectedRows" name="buttons-left"></slot>
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
    :data="data.List"
    :loading="loading"
    :max-height="tableMaxHeight"
    :print-config="{}"
    :show-overflow="showOverflow"
    highlight-hover-row
    row-id="id"
    v-bind="$attrs"
    @checkbox-change="handleCheckboxChange"
    @checkbox-all="handleCheckboxChange"
  >
    <vxe-column v-if="hasCheckbox" align="center" type="checkbox" width="60"></vxe-column>
    <vxe-column align="right" type="seq" width="60"></vxe-column>
    <component :is="columns"></component>
    <slot name="default"></slot>
    <slot name="empty"></slot>
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
    v-model:current-page="current"
    :layouts="['Sizes', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'FullJump', 'Total']"
    :page-size="pageSize"
    :page-sizes="[
      {
        value: 10,
        label: '10 条/页',
      },
      {
        value: 50,
        label: '50 条/页',
      },
      {
        value: 100,
        label: '100 条/页',
      },
      {
        value: 500,
        label: '500 条/页',
      },
      {
        value: 99999,
        label: '全部',
      },
    ]"
    :total="total"
    @update:page-size="handlePageSizeChange"
  >
    <!--    @page-change="handlePageChange"-->
  </vxe-pager>
</template>

<style>
/*NOTE 禁止滚动到底之后继续滚动*/
.vxe-table--body-wrapper {
  @apply overscroll-y-contain;
  /*overscroll-y:*/
}

/* 给正在编辑的单元格添加蓝色边框 */
.vxe-body--column.col--edit.col--actived {
  @apply border-2 border-blue-200 !important;
}
</style>
