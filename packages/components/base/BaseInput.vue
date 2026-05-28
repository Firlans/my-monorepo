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

  wrapperClass: {
    type: String,
    default: 'base-input'
  },

  labelClass: {
    type: String,
    default: 'base-input__label'
  },

  fieldWrapperClass: {
    type: String,
    default: 'base-input__field'
  },

  errorClass: {
    type: String,
    default: 'base-input__error'
  },

  inputErrorClass: {
    type: String,
    default: 'base-input__control--error'
  },

  rightSlotClass: {
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

const inputRef = ref(null)
const isMoneyType = computed(() => props.type === 'money')

const normalizeMoneyValue = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits
}

const formatMoneyDisplay = (value) => {
  const digits = normalizeMoneyValue(value)
  if (!digits) return ''
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(digits))
}

const displayValue = computed(() => {
  if (isMoneyType.value) return formatMoneyDisplay(props.modelValue)
  return props.modelValue
})

const inputType = computed(() => (isMoneyType.value ? 'text' : props.type))
const inputMode = computed(() => (isMoneyType.value ? 'numeric' : undefined))

const isValueEmpty = (value) => {
  if (props.type === 'number' || isMoneyType.value) {
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
  return ['base-input__control', props.inputClass, displayError.value ? props.inputErrorClass : '']
    .filter(Boolean)
    .join(' ')
})

const onInput = (event) => {
  touched.value = true
  if (isMoneyType.value) {
    const normalized = normalizeMoneyValue(event.target.value)
    emit('update:modelValue', normalized)
    event.target.value = formatMoneyDisplay(normalized)
    return
  }
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
  <div :class="wrapperClass">
    <label v-if="label" :class="labelClass">
      {{ label }}
    </label>

    <div :class="fieldWrapperClass">
      <input ref="inputRef" :type="inputType" :inputmode="inputMode" :value="displayValue" :placeholder="placeholder" :class="computedClass"
        :required="required"
        @input="onInput"
        @blur="onBlur"
        @invalid="onInvalid" />

      <div v-if="$slots.right" :class="rightSlotClass">
        <slot name="right" />
      </div>
    </div>

    <p v-if="displayError" :class="errorClass">
      {{ displayError }}
    </p>
  </div>
</template>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.base-input__label {
  font-size: 0.875rem;
  font-weight: 500;
}

.base-input__field {
  position: relative;
}

.base-input__control {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  outline: none;
}

.base-input__control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.base-input__control--error {
  border-color: #dc2626;
}

.base-input__error {
  color: #dc2626;
  font-size: 0.875rem;
}
</style>
