<script setup>
import { computed, nextTick, onMounted, provide, ref, watch, watchEffect } from 'vue'
import { debounce, toNumber } from 'lodash'
import { DownOutlined } from '@ant-design/icons-vue'

// TODO 非响应式的放到外面或store中去
const documentWidth = document.documentElement.clientWidth
const modalRef = ref()

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
const left = computed(() => {
  const w = 50 - parseInt(width.value / 2)
  return w
})
const position = computed(() => {
  return {
    left: (documentWidth * left.value) / 100,
    top: documentWidth * 0.05,
  }
})

watch(position, (newVal) => {
  // console.log('-> pos newVal', newVal)
  modalRef.value.setPosition(newVal.top, newVal.left)
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

//#region ## 窗口缩放 ==================================================
let handler

function _handleZoom() {
  if (handler) {
    const el = modalRef.value.getBox()
    handler(el)
  }
  // const height = el.offsetHeight
  // console.log('-> height', height)
}

function onZoom(cb) {
  handler = cb
}

provide('onZoom', onZoom)

const handleZoom = debounce(_handleZoom, 500)

//#endregion
</script>

<template>
  <!--    class="flex justify-center"-->

  <vxe-modal
    id="test"
    ref="modalRef"
    :mask="false"
    :model-value="visible"
    :position="position"
    :width="widthValue"
    esc-closable
    min-height="400"
    min-width="600"
    remember
    resize
    show-zoom
    transfer
    v-bind="$attrs"
    @zoom="handleZoom"
    @update:model-value="$emit('update:visible', $event)"
  >
    <!--    @zoom="handleZoom"-->
    <template #title>
      <div class="flex justify-between mr-8 leading-8 items-center">
        <div>{{ title }}</div>
        <!--        <a-dropdown>-->
        <!--          <template #overlay>-->
        <!--            <a-menu :trigger="['click']" @click="handleMenuClick">-->
        <!--              <a-menu-item key="default"> {{ widthKeyMap['default'].text }}</a-menu-item>-->
        <!--              <a-menu-item key="40"> {{ widthKeyMap['40'].text }}</a-menu-item>-->
        <!--              <a-menu-item key="60"> {{ widthKeyMap['60'].text }}</a-menu-item>-->
        <!--              <a-menu-item key="80"> {{ widthKeyMap['80'].text }}</a-menu-item>-->
        <!--              <a-menu-item key="full"> {{ widthKeyMap['full'].text }}</a-menu-item>-->
        <!--              &lt;!&ndash;              <a-menu-item key="5"> 自定义</a-menu-item>&ndash;&gt;-->
        <!--              &lt;!&ndash;              <a-button>自定义</a-button>&ndash;&gt;-->
        <!--              &lt;!&ndash;              <a-sub-menu key="custom" :title="widthKeyMap['custom'].text">&ndash;&gt;-->
        <!--              &lt;!&ndash;                <div class="w-36">&ndash;&gt;-->
        <!--              &lt;!&ndash;                  <a-slider v-model:value="width" :max="100" :min="20" :step="1" :tip-formatter="(v) => `${v}%`" @change="handleMenuClick({ key: 'custom' })" />&ndash;&gt;-->
        <!--              &lt;!&ndash;                  &lt;!&ndash;    宽度百分比：&ndash;&gt;&ndash;&gt;-->
        <!--              &lt;!&ndash;                  <a-input-number&ndash;&gt;-->
        <!--              &lt;!&ndash;                    v-model:value="width"&ndash;&gt;-->
        <!--              &lt;!&ndash;                    class="ml-4"&ndash;&gt;-->
        <!--              &lt;!&ndash;                    :formatter="(v) => `${v}%`"&ndash;&gt;-->
        <!--              &lt;!&ndash;                    :max="100"&ndash;&gt;-->
        <!--              &lt;!&ndash;                    :min="20"&ndash;&gt;-->
        <!--              &lt;!&ndash;                    :parser="(v) => v.replace('%', '')"&ndash;&gt;-->
        <!--              &lt;!&ndash;                    :step="1"&ndash;&gt;-->
        <!--              &lt;!&ndash;                    suffix="%"&ndash;&gt;-->
        <!--              &lt;!&ndash;                    @change="handleMenuClick({ key: 'custom' })"&ndash;&gt;-->
        <!--              &lt;!&ndash;                  />&ndash;&gt;-->
        <!--              &lt;!&ndash;                </div>&ndash;&gt;-->
        <!--              &lt;!&ndash;              </a-sub-menu>&ndash;&gt;-->
        <!--            </a-menu>-->
        <!--          </template>-->
        <!--          <a-button>-->
        <!--            窗口宽度 - {{ widthKeyMap[currentWidthKey].text }}-->
        <!--            <DownOutlined />-->
        <!--          </a-button>-->
        <!--        </a-dropdown>-->
      </div>
    </template>
    <slot></slot>

    <slot name="footer"></slot>
    <!--    ? 看文档是有的,为什么实际上没有?-->
    <!--    <template #footer>-->
    <!--      <slot name="footer"></slot>-->
    <!--    </template>-->
  </vxe-modal>
</template>

<style lang="less">
//.full-modal {
//  .ant-modal {
//    max-width: 100%;
//    top: 0;
//    padding-bottom: 0;
//    margin: 0;
//  }
//
//  .ant-modal-content {
//    display: flex;
//    flex-direction: column;
//    height: calc(100vh);
//  }
//
//  .ant-modal-body {
//    flex: 1;
//  }
//}

//body {
//  overflow: hidden;
//}
</style>
