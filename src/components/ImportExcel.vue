<script setup>
import { InboxOutlined } from '@ant-design/icons-vue'
import { ref } from 'vue'

const fileList = ref([])

function handleChange() {}
</script>

<template>
  <div class="mt-4 text-lg flex justify-center">
    <a-upload-dragger v-model:fileList="fileList" name="file" action="https://www.mocky.io/v2/5cc8019d300000980a055e76" @change="handleChange">
      <p class="ant-upload-drag-icon">
        <inbox-outlined></inbox-outlined>
      </p>
      <p class="ant-upload-text px-4">点击或拖拽上传</p>
    </a-upload-dragger>
  </div>
</template>

<style></style>
