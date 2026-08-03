<script setup>
import { provide, ref, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits(['submit'])
const attrs = useAttrs()

const isFormLoading = ref(false)

provide('formFeatureLoading', isFormLoading)

const handleSubmit = (nativeEvent) => {
  const customEvent = nativeEvent || {}
  customEvent.loading = {
    start: () => {
      isFormLoading.value = true
    },
    stop: () => {
      isFormLoading.value = false
    }
  }

  emit('submit', customEvent)

  if (typeof attrs.onSubmit === 'function') {
    attrs.onSubmit(customEvent)
  }
}
</script>

<template>
  <form v-bind="attrs" @submit.prevent="handleSubmit">
    <slot />
  </form>
</template>
