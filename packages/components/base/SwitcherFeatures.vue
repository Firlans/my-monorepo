<template>
  <div :class="rootClass">
    <button @click="$emit('prev')"
      :class="prevButtonClass"
      aria-label="Previous month">
      ‹
    </button>

    <div :class="contentClass">
      <p :class="slotClass">
        <slot></slot>
      </p>
      <p :class="labelClass">
        {{ label }}
      </p>
    </div>

    <button @click="$emit('next')"
      :class="nextButtonClass"
      aria-label="Next month">
      ›
    </button>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  rootClass: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: ''
  },
  slotClass: {
    type: String,
    default: ''
  },
  labelClass: {
    type: String,
    default: ''
  },
  prevButtonClass: {
    type: String,
    default: ''
  },
  nextButtonClass: {
    type: String,
    default: ''
  }
})

defineEmits(['prev', 'next'])
</script>
