<script setup>
import { Input, Space, Form, Button, InputNumber } from 'ant-design-vue'
import { createForm } from '@formily/core'
import { FormProvider, ArrayField, Field, mapProps, connect } from '@formily/vue'
import 'ant-design-vue/dist/antd.css'

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})

const FormItem = connect(
  Form.Item,
  mapProps(
    {
      title: 'label',
      description: 'extra',
      required: true,
      validateStatus: true,
      validateTrigger: true,
      name: true,
    },
    (props, field) => {
      return {
        ...props,
        help: field.selfErrors?.length ? field.selfErrors : undefined,
      }
    },
  ),
)

// const submit = {
//   name: 'Submit',
//   props: [''],
//   setup(props) {
//     const
//     return h()
//   }
// }
const emit = defineEmits(['submit'])

const form = createForm({
  initialValues: {
    List: [
      {
        cBomNo: '',
        fCount: 1,
      },
    ],
  },
})

function handleSubmit() {
  form.submit((formValues) => {
    console.log('-> formValues', formValues)
    emit('submit', formValues)
  })
}

// #region ## 默认新增一条 ==================================================

// #endregion
</script>

<template>
  <div class="">
    <FormProvider :form="form">
      <ArrayField name="List">
        <template #default="{ field }">
          <div v-for="(item, index) in field.value || []" :key="item.id" :style="{ marginBottom: '10px' }">
            <div class="flex space-x-2">
              <Field
                :component="[Input]"
                :decorator="[
                  FormItem,
                  {
                    validateTrigger: 'change',
                    autoLink: false,
                    class: 'mb-4',
                  },
                ]"
                :name="`${index}.cBomNo`"
                required
                title="物料BOM编码"
              />
              <!--                required-->
              <Field
                :component="[
                  InputNumber,
                  {
                    min: 1,
                  },
                ]"
                :decorator="[
                  FormItem,
                  {
                    validateTrigger: 'change',
                    autoLink: false,
                    class: 'mb-4',
                  },
                ]"
                :initial-value="1"
                :name="`${index}.fCount`"
                required
                title="数量"
              />

              <div class="h-[32px] flex items-center ml-2">
                <a-button
                  danger
                  size="small"
                  type="primary"
                  @click="
                    () => {
                      field.remove(index)
                    }
                  "
                >
                  删除
                </a-button>
              </div>
              <!--                required-->
            </div>
          </div>
          <div class="flex space-x-2">
            <a-button ref="addButton" @click="() => field.push({ id: Date.now(), value: '' })"> 新增</a-button>

            <a-button :disabled="false" :loading="loading" type="primary" @click="handleSubmit">查询</a-button>
          </div>
        </template>
      </ArrayField>
    </FormProvider>
  </div>
</template>

<style></style>
