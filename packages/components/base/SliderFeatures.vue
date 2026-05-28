<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Props for customization
const props = defineProps({
  rootClass: {
    type: String,
    default: ''
  },
  containerClass: {
    type: String,
    default: ''
  },
  titleClass: {
    type: String,
    default: ''
  },
  subtitleClass: {
    type: String,
    default: ''
  },
  frameClass: {
    type: String,
    default: ''
  },
  trackClass: {
    type: String,
    default: ''
  },
  slideClass: {
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
  },
  dotsClass: {
    type: String,
    default: ''
  },
  dotClass: {
    type: String,
    default: ''
  },
  activeDotClass: {
    type: String,
    default: ''
  },
  inactiveDotClass: {
    type: String,
    default: ''
  },
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
  <section :class="rootClass">
    <div :class="containerClass">
      <h2 :class="titleClass">
        {{ title }}
      </h2>
      <p :class="subtitleClass">
        {{ subtitle }}
      </p>

      <div>
        <button @click="prevSlide"
          :class="prevButtonClass"
          aria-label="Previous slide">
          <span class="text-xl">←</span>
        </button>

        <div :class="frameClass">
          <div :class="trackClass"
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div v-for="obj in subjects" :key="obj.id" :class="slideClass">
              <div>
                <div>
                  <div>
                    <span class="text-4xl">📱</span>
                  </div>
                  <h3>
                    {{ obj.title }}
                  </h3>
                  <p>
                    {{ obj.description }}
                  </p>
                  <div v-if="obj.image">
                    <img :src="obj.image" :alt="obj.title" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button @click="nextSlide"
          :class="nextButtonClass"
          aria-label="Next slide">
          <span class="text-xl">→</span>
        </button>
      </div>

      <div :class="dotsClass">
        <button v-for="(screenshot, index) in subjects" :key="screenshot.id" @click="goToSlide(index)"
          :class="currentSlide === index ? [dotClass, activeDotClass] : [dotClass, inactiveDotClass]"></button>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
