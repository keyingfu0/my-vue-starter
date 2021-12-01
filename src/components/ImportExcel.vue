<script setup>
import { InboxOutlined } from '@ant-design/icons-vue'
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { readExcel } from '@/utils/excel.js'
import { last } from 'lodash'

const fileList = ref([])

//#region ## 跳转到下一页 ==================================================
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:isLoading', 'update:data'])

function setIsLoading(value) {
  emit('update:isLoading', value)
}

//#endregion

function handleChange({ file, fileList: newFileList } = {}) {
  console.log('-> handleChange file', file)
  console.log('-> handleChange newFileList', newFileList)
  if (!newFileList || newFileList.length === 0) {
    return
  }
  if (newFileList.length > 1) {
    fileList.value = [last(newFileList)]
  }

  //
  // // this.$message.success(
  // //   '导入模板数据中...导入完成后可进行下一步,请耐心等待'
  // // )
  //
  // NOTE 并不是马上读取到数据, 是通过事件异步读取的
  readExcel(file, {
    setIsLoading,
    async onLoad(res) {
      console.log('-> res', res[0].sheet)
      emit('update:data', res[0]?.sheet ?? [])
      await nextTick()
      console.log('dataaaaaa', props.data)
    },
  })
}

function beforeUpload(file, files) {
  // console.log('-> files', files)
  // console.log('-> file', file)
  return false
}
</script>

<template>
  <div class="mt-6 text-lg mb-4 max-w-xl mx-auto">
    <a-upload-dragger
      v-model:fileList="fileList"
      :before-upload="beforeUpload"
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      name="file"
      @change="handleChange"
    >
      <template v-if="isLoading">
        <a-spin tip="正在导入数据中...请稍后" />
      </template>
      <template v-else>
        <p class="ant-upload-drag-icon">
          <inbox-outlined></inbox-outlined>
        </p>
        <p class="ant-upload-text px-4">点击或拖拽上传</p>
      </template>
    </a-upload-dragger>
  </div>
</template>

<style></style>
