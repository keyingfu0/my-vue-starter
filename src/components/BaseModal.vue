<script setup>
import { computed, ref } from 'vue'
import { toNumber } from 'lodash'
import { DownOutlined } from '@ant-design/icons-vue'

// TODO 非响应式的放到外面或store中去
const documentWidth = document.documentElement.clientWidth

//#region ## 宽度调整 ==================================================

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  initialWidth: {
    type: Number,
    default: 1200,
  },
  visible: {
    type: Boolean,
    default: false,
  },
})

const initialWidthPercent = (props.initialWidth / documentWidth).toFixed(2) * 100
const width = ref(initialWidthPercent)
// const width = useDebounce(_width, 300)
const widthValue = computed(() => {
  return `${width.value}vw`
})
const isFullScreen = ref(false)

// const widthValueNextTick = ref(`${initialWidthPercent}vw`)
// watch(widthValue, async (newVal) => {
//   await nextTick()
//   widthValueNextTick.value = newVal
// })
const widthKeyMap = {
  default: {
    text: '默认',
  },
  40: {
    text: '小',
  },
  60: {
    text: '中',
  },
  80: {
    text: '大',
  },
  full: {
    text: '最大',
  },
  custom: {
    text: '自定义',
  },
}
const currentWidthKey = ref('default')

function handleMenuClick({ key }) {
  currentWidthKey.value = key
  const num = toNumber(key)
  if (num) {
    isFullScreen.value = false
    width.value = num
    return
  }
  if (key === 'default') {
    isFullScreen.value = false
    width.value = initialWidthPercent
    return
  }
  if (key === 'full') {
    width.value = 100
    isFullScreen.value = true
  }
}

//#endregion
</script>

<template>
  <!--    class="flex justify-center"-->
  <a-modal
    :visible="visible"
    :width="widthValue"
    :wrap-class-name="isFullScreen ? 'full-modal' : ''"
    v-bind="$attrs"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #title>
      <div class="flex justify-between mr-8 leading-8 items-center">
        <div>{{ title }}</div>
        <a-dropdown>
          <template #overlay>
            <a-menu @click="handleMenuClick">
              <a-menu-item key="default"> {{ widthKeyMap['default'].text }}</a-menu-item>
              <a-menu-item key="40"> {{ widthKeyMap['40'].text }}</a-menu-item>
              <a-menu-item key="60"> {{ widthKeyMap['60'].text }}</a-menu-item>
              <a-menu-item key="80"> {{ widthKeyMap['80'].text }}</a-menu-item>
              <a-menu-item key="full"> {{ widthKeyMap['full'].text }}</a-menu-item>
              <!--              <a-menu-item key="5"> 自定义</a-menu-item>-->
              <!--              <a-button>自定义</a-button>-->
              <a-sub-menu key="custom" :title="widthKeyMap['custom'].text">
                <div class="w-36">
                  <a-slider v-model:value="width" :max="100" :min="20" :step="1" :tip-formatter="(v) => `${v}%`" @change="handleMenuClick({ key: 'custom' })" />
                  <!--    宽度百分比：-->
                  <a-input-number
                    v-model:value="width"
                    class="ml-4"
                    :formatter="(v) => `${v}%`"
                    :max="100"
                    :min="20"
                    :parser="(v) => v.replace('%', '')"
                    :step="1"
                    suffix="%"
                    @change="handleMenuClick({ key: 'custom' })"
                  />
                </div>
              </a-sub-menu>
            </a-menu>
          </template>
          <a-button>
            窗口宽度 - {{ widthKeyMap[currentWidthKey].text }}
            <DownOutlined />
          </a-button>
        </a-dropdown>
      </div>
    </template>

    <slot></slot>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </a-modal>
</template>

<style lang="less">
.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }

  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }

  .ant-modal-body {
    flex: 1;
  }
}
</style>
