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

onMounted(async () => {
  await fetchOptions()
})

const onChange = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label
      v-if="label"
      class="text-sm font-medium text-gray-700"
    >
      {{ label }}
    </label>

    <select
      v-bind="attrs"
      :value="normalizedModelValue"
      :disabled="attrs.disabled || loading"
      class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
             disabled:cursor-not-allowed disabled:bg-gray-100"
      @change="onChange"
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
      v-if="fetchError"
      class="text-sm text-red-500"
    >
      {{ fetchError }}
    </p>
  </div>
</template>