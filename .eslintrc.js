module.exports = {
  extends: ['plugin:vue/vue3-recommended', 'eslint-config-ali/vue', 'prettier', 'prettier/vue'],
  rules: {
    'spaced-comment': 'off',
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
}
