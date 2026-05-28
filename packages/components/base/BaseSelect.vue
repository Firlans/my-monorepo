<script setup>
import { computed, onMounted, ref, useAttrs, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  wrapperClass: {
    type: String,
    default: 'base-select'
  },
  labelClass: {
    type: String,
    default: 'base-select__label'
  },
  selectClass: {
    type: String,
    default: 'base-select__control'
  },
  errorClass: {
    type: String,
    default: 'base-select__error'
  },
  selectErrorClass: {
    type: String,
    default: 'base-select__control--error'
  },
  placeholder: {
    type: String,
    default: '-- Pilih --'
  },
  required: {
    type: Boolean,
    default: false
  },
  validate: {
    type: Array,
    default: null
  },
  validator: Function,
  error: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()
const touched = ref(false)
const selectRef = ref(null)

const normalizeValue = (value) => {
  if (value === null || value === undefined || value === '') return ''
  return String(value)
}

const normalizedModelValue = computed(() => normalizeValue(props.modelValue))
const isValueEmpty = (value) => value === '' || value === null || value === undefined

const getValidationError = (value) => {
  const validateMessage = Array.isArray(props.validate) ? props.validate[0] : 'Pilihan tidak valid'
  const validateFn = Array.isArray(props.validate) ? props.validate[1] : null

  if (props.required && isValueEmpty(value)) return validateMessage

  if (typeof validateFn === 'function') {
    const valid = validateFn(value)
    if (valid === false) return validateMessage
  }

  if (typeof props.validator === 'function') {
    const result = props.validator(value)
    if (typeof result === 'string') return result
    if (result === false) return 'Pilihan tidak valid'
  }

  return ''
}

const shouldShowError = computed(() => touched.value || !!props.error)
const validationError = computed(() => {
  if (!shouldShowError.value) return ''
  return getValidationError(props.modelValue)
})

const displayError = computed(() => props.error || validationError.value)
const selectClasses = computed(() => {
  return [props.selectClass, displayError.value ? props.selectErrorClass : '']
    .filter(Boolean)
    .join(' ')
})

watch(displayError, (value) => {
  if (selectRef.value) selectRef.value.setCustomValidity(value || '')
})

onMounted(() => {
  if (selectRef.value) selectRef.value.setCustomValidity(displayError.value || '')
})

const onChange = (event) => {
  touched.value = true
  event.target.setCustomValidity(getValidationError(event.target.value) || '')
  emit('update:modelValue', event.target.value)
}

const onBlur = (event) => {
  touched.value = true
  event.target.setCustomValidity(getValidationError(event.target.value) || '')
}

const onInvalid = (event) => {
  touched.value = true
  event.target.setCustomValidity(getValidationError(event.target.value) || 'Pilihan tidak valid')
}
</script>

<template>
  <div :class="wrapperClass">
    <label
      v-if="label"
      :class="labelClass"
    >
      {{ label }}
    </label>

    <select
      v-bind="attrs"
      ref="selectRef"
      :value="normalizedModelValue"
      :required="required || attrs.required"
      :class="selectClasses"
      @change="onChange"
      @blur="onBlur"
      @invalid="onInvalid"
    >
      <option value="">{{ placeholder }}</option>

      <option
        v-for="{ label: optionLabel, value } in options"
        :key="value"
        :value="value"
      >
        {{ optionLabel }}
      </option>
    </select>

    <p
      v-if="displayError"
      :class="errorClass"
    >
      {{ displayError }}
    </p>
  </div>
</template>

<style scoped>
.base-select {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.base-select__label {
  font-size: 0.875rem;
  font-weight: 500;
}

.base-select__control {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  outline: none;
  background: #fff;
}

.base-select__control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.base-select__control--error {
  border-color: #dc2626;
}

.base-select__error {
  color: #dc2626;
  font-size: 0.875rem;
}
</style>
