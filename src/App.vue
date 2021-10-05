<script setup>
import { ref } from 'vue'
// noinspection ES6UnusedImports
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/lib/locale/lang/zh-cn'

const counter = ref(0)
</script>

<template>
  <el-config-provider :locale="zhCn">
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
  </el-config-provider>
</template>
