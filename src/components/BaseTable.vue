<script setup>
defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  columnSchema: {
    type: Array,
    default: () => [],
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
