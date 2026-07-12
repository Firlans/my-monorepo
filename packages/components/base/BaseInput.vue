<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
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
  const digits = String(value ?? '').replace(/[^\d+\-*/()]/g, '')
  return digits
}

const formatMoneyDisplay = (value) => {
  const digits = normalizeMoneyValue(value)
  if (!digits) return ''
  if (/[-+*/()]/.test(digits)) {
    return digits
  }
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(digits))
}

const evaluateMath = (expr) => {
  try {
    const sanitized = String(expr).replace(/[^\d+\-*/()]/g, '')
    if (!sanitized) return ''
    // eslint-disable-next-line no-new-func
    const result = new Function('return ' + sanitized)()
    return Number.isFinite(result) ? String(Math.floor(result)) : ''
  } catch (e) {
    return expr
  }
}

const displayValue = computed(() => {
  if (isMoneyType.value) return formatMoneyDisplay(props.modelValue)
  return props.modelValue
})

const inputType = computed(() => (isMoneyType.value ? 'text' : props.type))
const inputMode = computed(() => {
  if (isMoneyType.value) {
    return isMobile.value ? 'none' : 'numeric'
  }
  return undefined
})

const isMobile = ref(false)
const showCalculator = ref(false)

const checkMobile = () => {
  if (typeof window !== 'undefined') {
    const isMobileViewport = window.innerWidth < 768
    const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    isMobile.value = isMobileViewport || isMobileAgent
  }
}

const onFocus = () => {
  if (isMoneyType.value && isMobile.value) {
    showCalculator.value = true
  }
}

const onInputClick = () => {
  if (isMoneyType.value && isMobile.value) {
    showCalculator.value = true
  }
}

const onVirtualInput = (char) => {
  if (!inputRef.value) return
  const currentVal = inputRef.value.value
  const newVal = currentVal + char
  
  touched.value = true
  const normalized = normalizeMoneyValue(newVal)
  emit('update:modelValue', normalized)
  inputRef.value.value = formatMoneyDisplay(normalized)
}

const onVirtualBackspace = () => {
  if (!inputRef.value) return
  const currentVal = inputRef.value.value
  const newVal = currentVal.slice(0, -1)
  
  touched.value = true
  const normalized = normalizeMoneyValue(newVal)
  emit('update:modelValue', normalized)
  inputRef.value.value = formatMoneyDisplay(normalized)
}

const onVirtualEvaluate = () => {
  if (!inputRef.value) return
  const evaluated = evaluateMath(inputRef.value.value)
  const normalized = normalizeMoneyValue(evaluated)
  emit('update:modelValue', normalized)
  inputRef.value.value = formatMoneyDisplay(normalized)
}

const calculatorKeys = [
  ['7', '8', '9', '/'],
  ['4', '5', '6', '*'],
  ['1', '2', '3', '-'],
  ['0', 'C', '=', '+']
]

const onClose = () => {
  showCalculator.value = false
  if (inputRef.value) {
    inputRef.value.blur()
  }
}

const onKeyClick = (key) => {
  if (key === 'C') onVirtualBackspace()
  else if (key === '=') {
    onVirtualEvaluate()
    onClose()
  }
  else onVirtualInput(key)
}

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
  checkMobile()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', checkMobile)
  }
  if (inputRef.value) inputRef.value.setCustomValidity(displayError.value || '')
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkMobile)
  }
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

const onBlur = (event) => {
  touched.value = true
  if (isMoneyType.value && event && event.target) {
    const evaluated = evaluateMath(event.target.value)
    const normalized = normalizeMoneyValue(evaluated)
    emit('update:modelValue', normalized)
    event.target.value = formatMoneyDisplay(normalized)
    showCalculator.value = false
  }
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
      <input ref="inputRef" :type="inputType" :inputmode="inputMode" :readonly="isMoneyType && isMobile ? true : undefined" :value="displayValue" :placeholder="placeholder" :class="computedClass"
        :required="required"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
        @click="onInputClick"
        @invalid="onInvalid" />

      <Teleport to="body">
        <div v-if="showCalculator" class="fixed inset-x-0 bottom-0 z-50 bg-slate-100 p-4 pb-8 rounded-t-3xl shadow-2xl border-t border-slate-200 transform transition-transform duration-300 ease-out">
          <!-- Header -->
          <div class="flex justify-between items-center mb-4 px-1">
            <span class="text-slate-500 font-medium text-sm">Kalkulator</span>
            <button type="button" @pointerdown.prevent="onClose" class="text-blue-600 font-bold px-4 py-2 bg-blue-100/50 hover:bg-blue-100 rounded-xl transition-colors">
              Selesai
            </button>
          </div>
          
          <!-- Keys Grid -->
          <div class="grid grid-cols-4 gap-3">
            <template v-for="(row, rowIndex) in calculatorKeys" :key="rowIndex">
              <button v-for="key in row" :key="key" type="button" @pointerdown.prevent="onKeyClick(key)"
                class="h-14 rounded-2xl shadow-sm text-xl font-medium flex items-center justify-center transition-all active:scale-95"
                :class="[
                  ['/', '*', '-', '+', '='].includes(key) ? 'bg-blue-100 text-blue-700 shadow-blue-200/50' : 'bg-white text-slate-800',
                  key === 'C' ? 'bg-rose-100 text-rose-600 shadow-rose-200/50' : '',
                  key === '=' ? 'bg-blue-600 text-white shadow-blue-600/30' : ''
                ]"
              >
                {{ key === 'C' ? '⌫' : key }}
              </button>
            </template>
          </div>
        </div>
      </Teleport>

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
