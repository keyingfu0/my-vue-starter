<script setup>
import { reactive, ref, shallowRef, watch } from 'vue'
/**
 * NOTE 不在template中使用的组件需要手动引入, `unplugin-vue-components` 无法识别
 * @see [ant-design-vue 的message和Modal没有样式 · Issue #162 · antfu/unplugin-vue-components](https://github.com/antfu/unplugin-vue-components/issues/162)
 */
import ImportExcel from '@/components/ImportExcel.vue'
import AAlert from 'ant-design-vue/es/alert'
import ASpin from 'ant-design-vue/es/spin'
import BaseTable from '@/components/BaseTable.vue'
import message from 'ant-design-vue/es/message'
import 'ant-design-vue/es/message/style/index.css'
import 'ant-design-vue/es/alert/style/index.css'
import 'ant-design-vue/es/spin/style/index.css'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:visible', 'finish'])

const current = ref(0)

function getInitialButtonData() {
  return {
    0: {
      disabled: true,
      loading: false,
    },
  }
}

const nextButtonState = reactive(getInitialButtonData())
const excelData = shallowRef([])

const next = () => {
  current.value++
}
const prev = () => {
  current.value--
}

// 导入完成后提示并解禁按钮, 自动跳转到下一步
// TODO 这里用0去索引是不对的, 万一步骤改了呢, 要换种方式
watch(
  () => nextButtonState['0'].loading,
  (newVal) => {
    if (!newVal && current.value === 0) {
      message.success('数据已导入!')
      nextButtonState['0'].disabled = false
      next()
    }
  },
)

const importRef = ref(null)
const uploading = ref(false)

const DownloadLink = {
  template: `
    <div class="mt-4 text-lg flex justify-center">
    <!--       <span @click="handleDownload">点击下载excel模板</span>-->
    <!--        TODO  link 可以换成link类型的a-button-->
    <a type="link" @click="handleDownload"
       :href="url"
       download="订单导入.xlsx">点击下载订单导入模板
    </a>
    </div>`,
  setup() {
    function handleDownload() {
      next()
      // saveAs('http://47.98.59.211:6247/Content/template/ProductionOrderTemplate.xls', '订单模板.xls')
    }

    return {
      handleDownload,
      url: `${import.meta.env.VITE_APP_BASE_URL}/Content/template/ApsSalesOrderImport.xlsx`,
    }
    // return
  },
}
const steps = [
  {
    title: '导入excel数据',
    // content: '从excel文件中导入数据',
    content: {
      template: `
        <a-alert class="mt-4" message="请保持列名和模板一致,否则无法导入数据" type="info" show-icon banner/>
        <DownloadLink/>
        <ImportExcel ref="importRef" v-model:data="excelData" :next="next"
                     action="/ApsSalesOrderInfo/SalesOrderInfoImport"
                     v-model:uploading="uploading"
                     v-model:is-loading="nextButtonState['0'].loading"></ImportExcel>`,
      components: { ImportExcel, DownloadLink, AAlert },
      setup() {
        return {
          next,
          importRef,
          uploading,
          nextButtonState,
          excelData,
        }
      },
    },
  },
  {
    title: '预览并确认',
    // content: '预览导入数据并确认导入',
    content: {
      template: `
        <div>
        <a-alert class="mt-4" message="返回上一步可重新导入" type="info" show-icon banner/>
        <template v-if="uploading">
          <div class="flex mt-6 items-center justify-center">
            <a-spin tip="正在上传中...请稍后"/>
          </div>
        </template>
        <BaseTable :data="excelData" v-bind="tableConfig"></BaseTable>
        </div>`,
      components: { AAlert, BaseTable, ASpin },
      setup() {
        return {
          excelData,
          uploading,
          tableConfig: {
            hasCheckbox: false,
            customConfig: {},
            rowId: '订单编号',
            columnSchema: [
              {
                field: '订单编号',
                title: '订单编号',
              },
              {
                field: '订单BOM编号',
                title: '订单BOM编号',
              },
              {
                field: '物料编号',
                title: '物料编号',
              },
              {
                field: '物料名称',
                title: '物料名称',
              },
              {
                field: '客户名',
                title: '客户名',
              },
              {
                field: '数量',
                title: '数量',
              },
              {
                field: '组装开始时间',
                title: '组装开始时间',
                formatter: ['formatDate', 'yyyy/MM/dd'],
              },
            ],
          },
        }
      },
    },
  },
]

//#region ## 完成导入 ==================================================
async function handleFinish() {
  // emit.finish()
  await importRef.value.upload()
  emit('finish')
}

//#endregion
</script>

<template>
  <a-modal class="flex justify-center" :visible="visible" title="Excel导入" width="auto" @update:visible="emit('update:visible', $event)">
    <div class="min-w-[1000px]">
      <a-steps :current="current">
        <a-step v-for="item in steps" :key="item.title" :title="item.title" />
      </a-steps>
      <div v-if="steps[current].content" class="steps-content">
        <keep-alive>
          <component :is="steps[current].content"></component>
        </keep-alive>
        <!--        {{ steps[current].content }}-->
      </div>
    </div>
    <template #footer>
      <div class="steps-action">
        <a-button v-if="current > 0" :loading="uploading" style="margin-left: 8px" @click="prev">上一步</a-button>
        <a-button v-if="current < steps.length - 1" type="primary" v-bind="nextButtonState[current]" @click="next">下一步 </a-button>
        <a-button v-if="current === steps.length - 1" :loading="uploading" type="primary" @click="handleFinish"> 完成 </a-button>
      </div>
    </template>
  </a-modal>
</template>
