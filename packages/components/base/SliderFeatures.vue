<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Props for customization
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  autoPlayInterval: {
    type: Number,
    default: 5000
  },
  subjects: {
    type: Array,
    required: true
  }
})

const currentSlide = ref(0)
let slideInterval = null

const moveToNext = () => {
  currentSlide.value = (currentSlide.value + 1) % props.subjects.length
}

const resetInterval = () => {
  if (slideInterval) clearInterval(slideInterval)
  if (props.autoPlayInterval > 0) {
    slideInterval = setInterval(moveToNext, props.autoPlayInterval)
  }
}

const nextSlide = () => {
  moveToNext()
  resetInterval()
}

const prevSlide = () => {
  currentSlide.value = currentSlide.value === 0
    ? props.subjects.length - 1
    : currentSlide.value - 1
  resetInterval()
}

const goToSlide = (index) => {
  currentSlide.value = index
  resetInterval()
}

onMounted(() => {
  if (props.autoPlayInterval > 0) {
    slideInterval = setInterval(moveToNext, props.autoPlayInterval)
  }
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})
</script>

<template>
  <section class="py-20 px-4 bg-white">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold text-center text-slate-800 mb-4">
        {{ title }}
      </h2>
      <p class="text-center text-slate-600 mb-12">
        {{ subtitle }}
      </p>

      <div class="flex items-center gap-4">
        <!-- Prev button -->
        <button @click="prevSlide"
          class="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:bg-slate-50 transition"
          aria-label="Previous slide">
          <span class="text-xl">←</span>
        </button>

        <!-- Slides container -->
        <div class="flex-1 overflow-hidden rounded-2xl shadow-2xl bg-slate-100">
          <div class="flex transition-transform duration-500 ease-in-out will-change-transform"
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div v-for="obj in subjects" :key="obj.id" class="min-w-full flex-shrink-0 px-4 py-6">
              <div class="mx-auto flex min-h-[320px] max-h-[420px] w-full max-w-4xl items-center justify-center rounded-3xl bg-slate-200 relative p-8">
                <div class="text-center p-4">
                  <div class="w-24 h-24 mx-auto mb-4 bg-slate-300 rounded-full flex items-center justify-center">
                    <span class="text-4xl">📱</span>
                  </div>
                  <h3 class="text-xl font-semibold text-slate-600 mb-2">
                    {{ obj.title }}
                  </h3>
                  <p class="text-slate-500">
                    {{ obj.description }}
                  </p>
                  <div v-if="obj.image" class="bg-slate-200 relative mt-4 rounded-lg overflow-hidden">
                    <img :src="obj.image" :alt="obj.title" class="w-full max-h-64 object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Next button -->
        <button @click="nextSlide"
          class="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:bg-slate-50 transition"
          aria-label="Next slide">
          <span class="text-xl">→</span>
        </button>
      </div>

      <!-- Dots indicator -->
      <div class="flex justify-center gap-2 mt-6">
        <button v-for="(screenshot, index) in subjects" :key="screenshot.id" @click="goToSlide(index)"
          class="h-3 rounded-full transition-all duration-300"
          :class="currentSlide === index ? 'bg-blue-600 w-8' : 'bg-slate-300 w-3'"></button>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
