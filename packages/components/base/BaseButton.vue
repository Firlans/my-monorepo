<script setup>
import { computed, inject, ref, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  loading: {
    type: Boolean,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  },
  buttonClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])
const attrs = useAttrs()

const formFeatureLoading = inject('formFeatureLoading', null)
const isAsyncLoading = ref(false)

const isFormSubmitType = computed(() => {
  const buttonType = props.type || attrs.type || 'button'
  return buttonType === 'submit'
})

const isLoading = computed(() => {
  if (props.loading !== undefined) {
    return props.loading
  }
  if (isFormSubmitType.value && formFeatureLoading && formFeatureLoading.value) {
    return true
  }
  return isAsyncLoading.value
})

const isDisabled = computed(() => props.disabled || isLoading.value)

const handleClick = async (event) => {
  if (isDisabled.value) {
    event.preventDefault()
    return
  }

  const onClickHandler = attrs.onClick || attrs.onClickOnce

  emit('click', event)

  if (typeof onClickHandler === 'function') {
    try {
      const result = onClickHandler(event)
      if (result && typeof result.then === 'function') {
        isAsyncLoading.value = true
        await result
      }
    } finally {
      isAsyncLoading.value = false
    }
  }
}
</script>

<template>
  <button
    v-bind="attrs"
    :type="type"
    :disabled="isDisabled"
    :class="[
      'relative inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed',
      buttonClass || 'rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white hover:bg-blue-700'
    ]"
    @click="handleClick"
  >
    <!-- Content Slot (Hidden during loading to keep button size stable) -->
    <span :class="{ 'opacity-0 invisible': isLoading }" class="inline-flex items-center space-x-2">
      <slot />
    </span>

    <!-- Centered Loading Spinner -->
    <span
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center"
    >
      <slot name="loading">
        <svg
          class="animate-spin h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </slot>
    </span>
  </button>
</template>
