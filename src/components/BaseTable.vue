<script setup>
defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  columnSchema: {
    type: Array,
    default: () => {
      return [
        {
          field: 'cWeekNo',
          title: '周次编码',
        },
        {
          field: 'cProductNo',
          title: '零部件名字',
        },
        {
          field: 'cProductName',
          title: '毛需求',
        },
        {
          field: 'fGrossCount',
          title: '期初结余',
        },
        {
          field: 'fBalanceCount',
          title: '本周在制量',
        },
        {
          field: 'fProduceCount',
          title: 'ATP',
        },
        {
          field: 'fATPCount',
          title: '关联工单',
        },
        {
          field: 'cRelateNo',
          title: '版本',
        },
      ]
    },
  },
  hasCheckbox: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <vxe-table class="mt-4" :checkbox-config="{ checkField: 'checked', trigger: 'row' }" :data="data" highlight-hover-row stripe v-bind="$attrs">
    <vxe-column v-if="hasCheckbox" type="checkbox" width="60"></vxe-column>
    <vxe-column type="seq" width="60"></vxe-column>
    <vxe-column v-for="col in columnSchema" :key="col.field" show-overflow="tooltip" v-bind="col"></vxe-column>
  </vxe-table>
</template>
