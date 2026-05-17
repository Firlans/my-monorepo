<script setup>
import { useAttrs } from 'vue'

defineProps({
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '-- Pilih --'
  },
  options: {
    type: Array,
    default: () => []
  }
})

const attrs = useAttrs()
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
      class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">{{ placeholder }}</option>

      <option
        v-for="{ label, value } in options"
        :key="value"
        :value="value"
      >
        {{ label }}
      </option>
    </select>
  </div>
</template>
