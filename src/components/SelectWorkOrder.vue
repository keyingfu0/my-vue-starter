<script setup>
import { reactive, shallowRef, watch } from 'vue'
import { debounce } from 'lodash'
import request from '@/utils/request'
import useRequest, { useList } from '@/utils/useRequest'

const props = defineProps({
  row: {
    type: Object,
    default: () => ({}),
  },
  activeWeek: {
    type: Object,
    default: () => ({}),
  },
})

let lastFetchId = 0
const state = reactive({
  value: [],
  fetching: false,
})
const options = shallowRef([])
const { run } = useRequest.$preset(['get-list'])(
  async ({ value = '', fetchId = 0 } = {}) => {
    if (fetchId !== lastFetchId) {
      // for fetch callback order
      return
    }
    return request('/ApsMaterialRequestInfo/GetUnReleaseOrderInfoList', {
      method: 'post',
      data: {
        cProductionOrderNo: value,
        cProductNo: props.row.cProductNo,
        ...props.activeWeek,
      },
    })
  },
  {
    onSuccess(res) {
      console.log('-> res', res)

      console.log('props.row.OrderList', props.row.OrderList)
      options.value = res.map((item) => {
        const { cProductionOrderNo, id } = item
        return {
          cProductionOrderNo,
          fIsReleaseOrder: 0,
          fProductionOrderInfoId: id,
          label: cProductionOrderNo,
          value: cProductionOrderNo,
        }
      })

      state.fetching = false
    },
  },
)

const fetchUser = debounce((value) => {
  console.log('fetching value', value)
  lastFetchId += 1
  const fetchId = lastFetchId
  options.value = []
  // if (!value) return
  state.fetching = true
  run({
    value,
    fetchId,
  })
}, 300)
watch(
  () => props.row.OrderList,
  () => {
    options.value = []
    state.fetching = false
  },
)

// TODO 改变修改的方式 不要直接修改props
function handleChange() {
  props.row._hasEdit = true
}
</script>

<template>
  <!--    @update:value="handleValueChange"-->
  <!--  <a-select v-model:value="row.OrderList" label-in-value mode="multiple" option-label-prop="label" placeholder="请选择关联工单" style="width: 100%">-->
  <!--    <a-select-option v-for="option in options" :key="option.cProductionOrderNo" :label="option.cProductionOrderNo" :value="option.cProductionOrderNo">-->
  <!--      {{ option.cProductionOrderNo }}-->
  <!--    </a-select-option>-->
  <!--  </a-select>-->

  <!--   TODO 改变修改的方式-->
  <a-select
    v-model:value="row.OrderList"
    :filter-option="false"
    label-in-value
    mode="multiple"
    option-label-prop="label"
    placeholder="请输入工单编号进行搜索"
    style="width: 100%"
    @change="handleChange"
    @search="fetchUser"
  >
    <template #notFoundContent>
      <template v-if="state.fetching">
        <a-spin size="small" />
      </template>
      <template v-else>暂无数据</template>
    </template>
    <a-select-option v-for="option in options" :key="option.cProductionOrderNo" :label="option.cProductionOrderNo" :value="option.cProductionOrderNo">
      {{ option.cProductionOrderNo }}
    </a-select-option>
  </a-select>
</template>

<style></style>
