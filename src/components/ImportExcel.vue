<script setup>
import { InboxOutlined } from '@ant-design/icons-vue'
import { ref } from 'vue'

const fileList = ref([])

function handleChange(file, files) {
  console.log('-> handleChange files', files)
  console.log('-> handleChange file', file)
}

function beforeUpload(file, files) {
  console.log('-> files', files)
  console.log('-> file', file)
  return false
}
</script>

<template>
  <div class="mt-6 text-lg mb-4 max-w-xl mx-auto">
    <a-upload-dragger
      v-model:fileList="fileList"
      :before-upload="beforeUpload"
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      name="file"
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      @change="handleChange"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined></inbox-outlined>
      </p>
      <p class="ant-upload-text px-4">点击或拖拽上传</p>
    </a-upload-dragger>
  </div>
</template>

<style></style>
