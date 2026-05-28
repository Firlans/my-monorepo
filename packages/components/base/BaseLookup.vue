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
    default: 'base-lookup'
  },
  labelClass: {
    type: String,
    default: 'base-lookup__label'
  },
  selectClass: {
    type: String,
    default: 'base-lookup__select'
  },
  errorClass: {
    type: String,
    default: 'base-lookup__error'
  },
  selectErrorClass: {
    type: String,
    default: 'base-lookup__select--error'
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
  placeholder: {
    type: String,
    default: '-- Pilih --'
  },
  route: {
    type: String,
    required: true
  },
  itemKey: {
    type: String,
    default: 'id'
  },
  display: {
    type: String,
    default: 'name'
  },
  auth: {
    type: Boolean,
    default: false
  },
  filter: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'loaded', 'error'])
const attrs = useAttrs()

const items = ref([])
const loading = ref(false)
const fetchError = ref('')
const hasLoaded = ref(false)
const touched = ref(false)
const selectRef = ref(null)

const normalizeCollection = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

const buildLookupUrl = () => {
  if (!Array.isArray(props.filter) || props.filter.length === 0) {
    return props.route
  }

  const separator = props.route.includes('?') ? '&' : '?'
  const serializedFilter = encodeURIComponent(JSON.stringify(props.filter))
  return `${props.route}${separator}filter=${serializedFilter}`
}

const normalizeValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  return String(value)
}

const options = computed(() => {
  return items.value.map((item) => ({
    label: item?.[props.display] ?? '-',
    value: normalizeValue(item?.[props.itemKey])
  }))
})

const normalizedModelValue = computed(() => normalizeValue(props.modelValue))
const isValueEmpty = (value) => value === '' || value === null || value === undefined

const getValidationError = (value) => {
  const validateMessage = Array.isArray(props.validate) ? props.validate[0] : 'Pilihan tidak valid'
  const validateFn = Array.isArray(props.validate) ? props.validate[1] : null

  if (props.required && isValueEmpty(value)) return validateMessage || 'Pilihan wajib diisi'

  if (typeof validateFn === 'function') {
    const valid = validateFn(value)
    if (valid === false) return validateMessage || 'Pilihan tidak valid'
  }

  if (typeof props.validator === 'function') {
    const result = props.validator(value)
    if (typeof result === 'string') return result
    if (result === false) return 'Pilihan tidak valid'
  }

  return ''
}

const shouldShowValidationError = computed(() => touched.value || !!props.error)
const validationError = computed(() => {
  if (!shouldShowValidationError.value) return ''
  return getValidationError(props.modelValue)
})

const controlError = computed(() => props.error || validationError.value)
const displayError = computed(() => {
  return controlError.value || fetchError.value
})

const selectClasses = computed(() => {
  return [props.selectClass, displayError.value ? props.selectErrorClass : '']
    .filter(Boolean)
    .join(' ')
})

const getLookupHeaders = () => {
  if (!props.auth || typeof window === 'undefined' || !window.localStorage) {
    return {}
  }

  const accessToken = String(window.localStorage.getItem('access_token') || '')
    .trim()
    .replace(/^Bearer\s+/i, '')

  if (!accessToken) {
    return {}
  }

  return {
    Authorization: `Bearer ${accessToken}`
  }
}

const fetchOptions = async () => {
  if (!props.route || loading.value || hasLoaded.value) {
    if (!props.route) {
      items.value = []
      hasLoaded.value = false
    }
    return
  }

  loading.value = true
  fetchError.value = ''

  try {
    const response = await fetch(buildLookupUrl(), {
      headers: getLookupHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to load lookup data (${response.status})`)
    }

    const payload = await response.json()
    items.value = normalizeCollection(payload)
    hasLoaded.value = true
    emit('loaded', items.value)
  } catch (error) {
    items.value = []
    hasLoaded.value = false
    fetchError.value = error instanceof Error ? error.message : 'Failed to load lookup data'
    emit('error', fetchError.value)
  } finally {
    loading.value = false
  }
}

watch(() => props.route, async () => {
  items.value = []
  fetchError.value = ''
  hasLoaded.value = false
  await fetchOptions()
})

watch(() => props.filter, async () => {
  items.value = []
  fetchError.value = ''
  hasLoaded.value = false
  await fetchOptions()
}, { deep: true })

watch(controlError, (value) => {
  if (selectRef.value) selectRef.value.setCustomValidity(value || '')
})

onMounted(async () => {
  await fetchOptions()
  if (selectRef.value) selectRef.value.setCustomValidity(controlError.value || '')
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
      :disabled="attrs.disabled || loading"
      :required="required || attrs.required"
      :class="selectClasses"
      @change="onChange"
      @blur="onBlur"
      @invalid="onInvalid"
    >
      <option value="">
        {{ loading ? 'Memuat data...' : placeholder }}
      </option>

      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
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
.base-lookup {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.base-lookup__label {
  font-size: 0.875rem;
  font-weight: 500;
}

.base-lookup__select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  outline: none;
  background: #fff;
}

.base-lookup__select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.base-lookup__select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.base-lookup__select--error {
  border-color: #dc2626;
}

.base-lookup__error {
  color: #dc2626;
  font-size: 0.875rem;
}
</style>