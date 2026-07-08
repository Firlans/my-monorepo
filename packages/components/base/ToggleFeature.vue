<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  widthClass: {
    type: String,
    default: 'w-full'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleToggle = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <div :class="['flex items-center rounded-xl bg-slate-100/80 p-1 shadow-inner ring-1 ring-slate-200 backdrop-blur-md', widthClass]">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      @click="handleToggle(option.value)"
      class="relative flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      :class="[
        modelValue === option.value 
          ? 'text-slate-800' 
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
      ]"
    >
      <div 
        v-if="modelValue === option.value"
        class="absolute inset-0 -z-10 rounded-lg bg-white shadow-sm ring-1 ring-black/5"
      ></div>
      <span class="relative z-10 flex items-center justify-center gap-2">
        <component v-if="option.icon" :is="option.icon" class="h-4 w-4" />
        {{ option.label }}
      </span>
    </button>
  </div>
</template>
