<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { isEmptyValue } from '@packages/utils/Validator.js'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: String,

  type: {
    type: String,
    default: 'text'
  },

  placeholder: String,

  error: {
    type: String,
    default: ''
  },

  inputClass: {
    type: String,
    default: ''
  },

  required: {
    type: Boolean,
    default: false
  },

  validate: {
    type: Array,
    default: null
  },

  validator: Function
})

const emit = defineEmits(['update:modelValue'])
const touched = ref(false)

const baseClass =
  'w-full px-4 py-2 border rounded-lg focus:ring-2 transition'

const errorClass =
  'border-red-500 focus:ring-red-400'

const normalClass =
  'border-slate-300 focus:ring-blue-500'

const inputRef = ref(null)

const isValueEmpty = (value) => {
  if (props.type === 'number') {
    return value === '' || value === null || value === undefined || Number.isNaN(Number(value))
  }
  return isEmptyValue(value)
}

const getValidationError = (value) => {
  const validateMessage = Array.isArray(props.validate) ? props.validate[0] : 'Invalid value'
  const validateFn = Array.isArray(props.validate) ? props.validate[1] : null
  if (props.required && isValueEmpty(value)) return validateMessage
  if (typeof validateFn === 'function') {
    const valid = validateFn(value)
    if (valid === false) return validateMessage
  }
  if (typeof props.validator === 'function') {
    const result = props.validator(value)
    if (typeof result === 'string') return result
    if (result === false) return 'Invalid value'
  }
  return ''
}

const shouldShowError = computed(() => touched.value || !!props.error)

const validationError = computed(() => {
  if (!shouldShowError.value) return ''
  return getValidationError(props.modelValue)
})

const displayError = computed(() => props.error || validationError.value)

watch(displayError, (value) => {
  if (inputRef.value) inputRef.value.setCustomValidity(value || '')
})

onMounted(() => {
  if (inputRef.value) inputRef.value.setCustomValidity(displayError.value || '')
})

const computedClass = computed(() => {
  return [
    baseClass,
    displayError.value ? errorClass : normalClass,
    props.inputClass,
    'pr-12' // ruang untuk tombol kanan
  ].join(' ')
})

const onInput = (event) => {
  touched.value = true
  emit('update:modelValue', event.target.value)
}

const onBlur = () => {
  touched.value = true
}

const onInvalid = (event) => {
  touched.value = true
  event.target.setCustomValidity(getValidationError(props.modelValue) || '')
}
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-sm font-medium text-slate-700">
      {{ label }}
    </label>

    <div class="relative">
      <input ref="inputRef" :type="type" :value="modelValue" :placeholder="placeholder" :class="computedClass"
        :required="required"
        @input="onInput"
        @blur="onBlur"
        @invalid="onInvalid" />

      <!-- SLOT KANAN (opsional) -->
      <div v-if="$slots.right" class="absolute inset-y-0 right-3 flex items-center">
        <slot name="right" />
      </div>
    </div>

    <p v-if="displayError" class="text-sm text-red-500">
      {{ displayError }}
    </p>
  </div>
</template>
