<script setup>
import { computed, nextTick, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { debounce, keyBy, uniqBy } from 'lodash'
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
  visible: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['change', 'update:visible', 'update:row'])

let lastFetchId = 0
const state = reactive({
  value: [],
  fetching: false,
})

const options = shallowRef([])
// TODO 改为传json格式
const optionsByValue = computed(() => {
  return keyBy(options.value, 'value')
})
const initialTargetKeys = props.row.OrderList.map((item) => item.cProductionOrderNo)
// const
const targetKeys = shallowRef(initialTargetKeys)
let targetObjs = uniqBy(
  props.row.OrderList.map((item) => {
    return {
      ...item,
      key: item.cProductionOrderNo,
    }
  }),
  'key',
)
// watch(targetKeys,()={})

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
      options.value = uniqBy(
        res
          .map((item) => {
            const { cProductionOrderNo, id, fPlanningCount } = item
            return {
              cProductionOrderNo,
              fIsReleaseOrder: 0,
              fProductionOrderInfoId: id,
              label: cProductionOrderNo,
              // label: `${cProductionOrderNo}（${fPlanningCount}件）`,
              value: cProductionOrderNo,
              key: cProductionOrderNo,
              title: cProductionOrderNo,
              fPlanningCount,
            }
          })
          .concat(targetObjs),
        'key',
      )
      console.log('-> options targetObjs.value', targetObjs)
      console.log('-> options.value', options.value)

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

// function handleChange() {
//   // props.row._hasEdit = true
//   emit('change', props.row)
// }

// TODO 改变修改的方式 不要直接修改props
// function handleValueChange(value) {
//   // console.log(
//   //   'Georgia',
//   //   value.map((item) => optionsByValue.value[item.value]),
//   // )
//   props.row.OrderList = value.map((item) => optionsByValue.value[item.value])
// }

onMounted(() => {
  console.log('mounted')
  emit('update:visible', true)
})

function handleMousedown(e) {
  // console.log('-> e.target.tag', e.target)
  // if (e.target.tagName === 'BUTTON' || e.target.parentNode.tagName === 'BUTTON') {
  //   return
  // }
  e.stopPropagation()
}

const filterOption = (inputValue, option) => {
  return option.key.indexOf(inputValue) > -1
}

const handleChange = (keys, direction, moveKeys) => {
  console.log(keys, direction, moveKeys)
  console.log('targetKeys', targetKeys)
  targetObjs = uniqBy(
    targetKeys.value.map((key) => optionsByValue.value[key]),
    'key',
  )
}

const handleSearch = (dir, value) => {
  console.log('search:', dir, value)
  if (dir === 'left') {
    fetchUser(value)
  }
}

function handleConfirm() {
  // await nextTick()
  emit('update:row', targetObjs)
  // TODO 修改方式
  // props.row.OrederList = targetObjs
  // console.log('-> props.row', props.row)
  emit('change', props.row)
  emit('update:visible', false)
  //   TODO 手动激活, 不用激活模式
}
</script>

<template>
  <!--    @update:value="handleValueChange"-->
  <!--  <a-select v-model:value="row.OrderList" label-in-value mode="multiple" option-label-prop="label" placeholder="请选择关联工单" style="width: 100%">-->
  <!--    <a-select-option v-for="option in options" :key="option.cProductionOrderNo" :label="option.cProductionOrderNo" :value="option.cProductionOrderNo">-->
  <!--      {{ option.cProductionOrderNo }}-->
  <!--    </a-select-option>-->
  <!--  </a-select>-->

  <!--  TODO 改变修改的方式 不要直接修改props -->
  <!--  <a-select-->
  <!--    :filter-option="false"-->
  <!--    :value="row.OrderList"-->
  <!--    label-in-value-->
  <!--    mode="multiple"-->
  <!--    option-label-prop="label"-->
  <!--    placeholder="请输入工单编号进行搜索"-->
  <!--    style="width: 100%"-->
  <!--    @change="handleChange"-->
  <!--    @search="fetchUser"-->
  <!--    @update:value="handleValueChange"-->
  <!--  >-->
  <!--    <template #notFoundContent>-->
  <!--      <template v-if="state.fetching">-->
  <!--        <a-spin size="small" />-->
  <!--      </template>-->
  <!--      <template v-else>暂无数据</template>-->
  <!--    </template>-->
  <!--    <a-select-option v-for="option in options" :key="option.cProductionOrderNo" :label="option.cProductionOrderNo" :value="option.cProductionOrderNo">-->
  <!--      {{ option.cProductionOrderNo }}{{ option.fPlanningCount ? `（${option.fPlanningCount}件）` : '' }}-->
  <!--    </a-select-option>-->
  <!--  </a-select>-->

  <a-popover :visible="visible" placement="left" trigger="click">
    <template #content>
      <div class="" @mousedown="handleMousedown">
        <a-transfer
          v-model:target-keys="targetKeys"
          :data-source="options"
          :filter-option="filterOption"
          :list-style="{
            height: '400px',
            width: '300px',
          }"
          :titles="['未关联工单', '已关联工单']"
          one-way
          show-search
          @change="handleChange"
          @search="handleSearch"
        >
          <template #render="item">
            <div>
              {{ item.cProductionOrderNo }}
              <span>
                {{ item.fPlanningCount ? `（${item.fPlanningCount}件）` : '' }}
              </span>
            </div>
          </template>
          <template #notFoundContent>
            <template v-if="state.fetching">
              <a-spin size="small" />
            </template>
            <template v-else>暂无数据</template>
          </template>
        </a-transfer>

        <div class="flex mt-2 justify-end">
          <a-button class="" type="primary" @click="handleConfirm">确认</a-button>
          <a-button class="ml-2" @click="emit('update:visible', false)">取消</a-button>
        </div>
        <!--        <vxe-input v-model="tt" parse-format="yyyy-dd-MM" placeholder="请选择组装日期" type="date"></vxe-input>-->
      </div>
    </template>
    <!--    <a-button>请选择关联工单</a-button>-->
    <slot :row="row"></slot>
  </a-popover>
</template>

<style></style>
