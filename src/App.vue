<script setup>
// noinspection ES6UnusedImports
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/lib/locale/lang/zh-cn'
import { ref } from 'vue'

const isMenuOpen = ref(false)
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div class="bg-blue-200">
      <div class="px-4 py-5 md:px-24 lg:px-8">
        <div class="relative flex items-center justify-between">
          <a aria-label="Company" class="inline-flex items-center" href="/" title="Company">
            <svg
              class="w-8 text-deep-purple-accent-400"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-miterlimit="10"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <rect height="12" width="7" x="3" y="1"></rect>
              <rect height="6" width="7" x="3" y="17"></rect>
              <rect height="6" width="7" x="14" y="1"></rect>
              <rect height="12" width="7" x="14" y="11"></rect>
            </svg>
            <span class="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">Company</span>
          </a>
          <ul class="flex items-center hidden space-x-24 lg:flex">
            <li>
              <a aria-label="首页" class="btn-router-link border-white" href="/" title="首页">首页</a>
            </li>
            <li>
              <a aria-label="产品介绍" class="btn-router-link" href="/" title="产品介绍">产品介绍</a>
            </li>
            <li>
              <a aria-label="服务与合作" class="btn-router-link" href="/" title="服务与合作">服务与合作</a>
            </li>
            <li>
              <a aria-label="关于我们" class="btn-router-link" href="/" title="关于我们">关于我们</a>
            </li>
            <li>
              <a aria-label="新闻资讯" class="btn-router-link" href="/" title="新闻资讯">新闻资讯</a>
            </li>
          </ul>
          <ul class="flex items-center hidden space-x-8 lg:flex">
            <li>
              <a aria-label="免费体验" class="btn-router-link text-blue-400 bg-white px-10" href="/" title="免费体验">免费体验</a>
            </li>
          </ul>
          <div class="lg:hidden">
            <button
              aria-label="Open Menu"
              class="p-2 -mr-1 transition duration-200 rounded focus:outline-none focus:shadow-outline hover:bg-deep-purple-50 focus:bg-deep-purple-50"
              title="Open Menu"
              @click="isMenuOpen = true"
            >
              <svg class="w-5 text-gray-600" viewBox="0 0 24 24">
                <path d="M23,13H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,13,23,13z" fill="currentColor"></path>
                <path d="M23,6H1C0.4,6,0,5.6,0,5s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,6,23,6z" fill="currentColor"></path>
                <path d="M23,20H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,20,23,20z" fill="currentColor"></path>
              </svg>
            </button>
            <div v-if="isMenuOpen" class="absolute top-0 left-0 w-full">
              <div class="p-5 bg-white border rounded shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <a aria-label="Company" class="inline-flex items-center" href="/" title="Company">
                      <svg
                        class="w-8 text-deep-purple-accent-400"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                      >
                        <rect height="12" width="7" x="3" y="1"></rect>
                        <rect height="6" width="7" x="3" y="17"></rect>
                        <rect height="6" width="7" x="14" y="1"></rect>
                        <rect height="12" width="7" x="14" y="11"></rect>
                      </svg>
                      <span class="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">Company</span>
                    </a>
                  </div>
                  <div>
                    <button
                      aria-label="Close Menu"
                      class="p-2 -mt-2 -mr-2 transition duration-200 rounded hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
                      title="Close Menu"
                      @click="isMenuOpen = false"
                    >
                      <svg class="w-5 text-gray-600" viewBox="0 0 24 24">
                        <path
                          d="M19.7,4.3c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l6.3,6.3l-6.3,6.3 c-0.4,0.4-0.4,1,0,1.4C4.5,19.9,4.7,20,5,20s0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3 c0.4-0.4,0.4-1,0-1.4L13.4,12l6.3-6.3C20.1,5.3,20.1,4.7,19.7,4.3z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <nav>
                  <ul class="space-y-4">
                    <li>
                      <a
                        aria-label="Our product"
                        class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-deep-purple-accent-400"
                        href="/"
                        title="Our product"
                        >Product</a
                      >
                    </li>
                    <li>
                      <a
                        aria-label="Our product"
                        class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-deep-purple-accent-400"
                        href="/"
                        title="Our product"
                        >Features</a
                      >
                    </li>
                    <li>
                      <a
                        aria-label="Product pricing"
                        class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-deep-purple-accent-400"
                        href="/"
                        title="Product pricing"
                        >Pricing</a
                      >
                    </li>
                    <li>
                      <a
                        aria-label="About us"
                        class="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-deep-purple-accent-400"
                        href="/"
                        title="About us"
                        >About us</a
                      >
                    </li>
                    <li>
                      <a
                        aria-label="Sign up"
                        class="
                          inline-flex
                          items-center
                          justify-center
                          w-full
                          h-12
                          px-6
                          font-medium
                          tracking-wide
                          text-white
                          transition
                          duration-200
                          rounded
                          shadow-md
                          bg-deep-purple-accent-400
                          hover:bg-deep-purple-accent-700
                          focus:shadow-outline focus:outline-none
                        "
                        href="/"
                        title="Sign up"
                      >
                        Sign up
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main>
        <router-view />
      </main>
    </div>
  </el-config-provider>
</template>
