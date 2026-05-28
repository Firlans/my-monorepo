<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'vertical',
    validator: (value) => ['horizontal', 'vertical'].includes(value)
  },
  label: {
    type: String,
    default: 'Panel'
  },
  description: {
    type: String,
    default: ''
  },
  initiallyOpen: {
    type: Boolean,
    default: true
  },
  gapClass: {
    type: String,
    default: 'gap-3'
  }
})

const isOpen = ref(props.initiallyOpen)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const containerClass = computed(() => {
  if (props.type === 'horizontal') {
    return ['flex', 'flex-row', 'overflow-x-auto', 'overflow-y-hidden', 'pb-1']
  }

  return ['flex', 'flex-col', 'overflow-y-auto', 'overflow-x-hidden']
})

const contentWrapperClass = computed(() => {
  if (props.type === 'horizontal') {
    return [
      'transition-all',
      'duration-300',
      'ease-in-out',
      'overflow-hidden',
      isOpen.value ? 'w-full opacity-100' : 'w-0 opacity-0'
    ]
  }

  return [
    'transition-all',
    'duration-300',
    'ease-in-out',
    'overflow-hidden',
    isOpen.value ? 'max-h-[200vh] opacity-100 pt-3' : 'max-h-0 opacity-0'
  ]
})

const indicatorClass = computed(() => [
  'inline-block',
  'transition-transform',
  'duration-300',
  isOpen.value ? 'rotate-0' : props.type === 'horizontal' ? '-rotate-90' : '-rotate-180'
])
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white/80">
    <button type="button" class="flex w-full items-start justify-between gap-3 px-4 py-3 text-left" @click="toggle">
      <div class="min-w-0">
        <span class="text-sm font-semibold text-slate-700">{{ label }}</span>
        <div v-if="$slots.description || description" class="mt-1 text-xs text-slate-500">
          <slot name="description">
            {{ description }}
          </slot>
        </div>
      </div>
      <span :class="indicatorClass" aria-hidden="true">⌃</span>
    </button>

    <div :class="contentWrapperClass">
      <div :class="[containerClass, gapClass]">
        <slot />
      </div>
    </div>
  </section>
</template>