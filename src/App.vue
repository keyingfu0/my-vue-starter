<script setup>
import { ref } from 'vue'
import request from '@/utils/request'
import { onSuccess, useList } from '@/utils/useRequest'

const counter = ref(0)

setInterval(() => {
  counter.value++
}, 1000)

const service = () =>
  request({
    url: 'http://47.98.59.211:5285/api/v1/Android/User/UserLogin_Cookie',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'post',
    data: {
      userName: 'it',
      password: '123123',
      fAppInfoId: 2133,
    },
  })

useList(service, {
  setup() {
    onSuccess((res) => {
      console.log('ssssssss -> res', res)
    })

    onSuccess((res) => {
      console.log('sssssss22222s -> res', res)
    })
  },
  successMessage: '登录成功',
})
</script>

<template>
  <div>
    <header v-if="$route.meta.title" class="bg-white shadow">
      <div class="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900" @click="counter = 0">{{ $route.meta.title }} / {{ counter }}</h1>
      </div>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>
