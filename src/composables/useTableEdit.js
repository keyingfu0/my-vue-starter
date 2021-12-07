import { ref, shallowRef, watch } from 'vue'
import { map } from 'lodash'
import request from '@/utils/request'
import message from 'ant-design-vue/es/message'

export default function useTableEdit(saveService, { tableRef }) {
  const hasEdit = ref(false)
  const editedRows = shallowRef({})

  function handleCellChange(row) {
    console.log('-> row', row)
    console.log('ArnoJared')
    hasEdit.value = true
    row._hasEdit = true
    editedRows.value = {
      ...editedRows.value,
      [row.id]: row,
    }
  }

  async function saveTable() {
    await saveService(editedRows.value)
    hasEdit.value = false
    editedRows.value = {}
    message.success('保存成功!')
    tableRef.value.refresh()
  }

  function resetTable() {
    hasEdit.value = false
    tableRef.value.refresh()
  }

  // 任意刷新之后取消编辑状态
  function refreshed() {
    hasEdit.value = false
  }

  return { hasEdit, handleCellChange, saveTable, resetTable, refreshed }
}
