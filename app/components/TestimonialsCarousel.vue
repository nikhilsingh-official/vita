<script setup>
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import emblaCarouselVue from 'embla-carousel-vue'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  testimonials: { type: Array, default: () => [] },
  placeholderCount: { type: Number, default: 5 },
})

const placeholderSlides = computed(() =>
  Array.from({ length: props.placeholderCount }, (_, index) => ({
    id: `testimonial-placeholder-${index + 1}`,
    placeholder: true,
  })),
)
const slides = computed(() =>
  props.testimonials.length ? props.testimonials : placeholderSlides.value,
)
const selectedIndex = ref(0)
const canScrollPrevious = ref(false)
const canScrollNext = ref(false)

const [emblaRef, emblaApi] = emblaCarouselVue({
  align: 'start',
  containScroll: 'trimSnaps',
  dragFree: false,
  loop: false,
})

function updateControls(api = emblaApi.value) {
  if (!api) return
  selectedIndex.value = api.selectedScrollSnap()
  canScrollPrevious.value = api.canScrollPrev()
  canScrollNext.value = api.canScrollNext()
}

watch(
  emblaApi,
  (api, _previousApi, onCleanup) => {
    if (!api) return

    api.on('select', updateControls)
    api.on('reInit', updateControls)
    updateControls(api)

    onCleanup(() => {
      api.off('select', updateControls)
      api.off('reInit', updateControls)
    })
  },
  { immediate: true },
)
</script>

<template>
  <section class="testimonials-section" aria-labelledby="testimonials-title">
    <div class="section-inner testimonials-inner">
      <header class="testimonials-heading">
        <div>
          <h2 id="testimonials-title">Notes people left us</h2>
          <p>Messages from the people and organisations around the stall.</p>
        </div>

        <!-- autocomplete="off" stops Firefox restoring a stale disabled state on reload. -->
        <div class="testimonials-controls" aria-label="Testimonial carousel controls">
          <span class="testimonials-position" aria-live="polite">
            {{ String(selectedIndex + 1).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}
          </span>
          <button
            type="button"
            autocomplete="off"
            aria-label="Previous testimonial"
            :disabled="!canScrollPrevious"
            @click="emblaApi?.scrollPrev()"
          >
            <ChevronLeft :size="18" :stroke-width="2.5" />
          </button>
          <button
            type="button"
            autocomplete="off"
            aria-label="Next testimonial"
            :disabled="!canScrollNext"
            @click="emblaApi?.scrollNext()"
          >
            <ChevronRight :size="18" :stroke-width="2.5" />
          </button>
        </div>
      </header>

      <div ref="emblaRef" class="testimonials-viewport" aria-label="Written testimonials carousel">
        <div class="testimonials-rail">
          <article
            v-for="(testimonial, index) in slides"
            :key="testimonial.id ?? testimonial.src"
            class="testimonial-slide"
          >
            <figure
              :class="['testimonial-card', { 'testimonial-card--placeholder': testimonial.placeholder }]"
              :style="{ '--rotation': `${[-1.6, 1.1, -0.6, 1.4, -1.1][index % 5]}deg` }"
            >
              <span :class="['pin', index % 3 === 1 ? 'pin-sage' : 'pin-gold']" aria-hidden="true"></span>
              <img
                v-if="testimonial.src"
                :src="testimonial.src"
                :alt="testimonial.alt || `Written testimonial ${index + 1}`"
                loading="lazy"
              />
              <div v-else class="testimonial-placeholder">
                <span class="testimonial-placeholder__number" aria-hidden="true">
                  {{ String(index + 1).padStart(2, '0') }}
                </span>
                <div class="testimonial-placeholder__lines" aria-hidden="true">
                  <i></i><i></i><i></i><i></i><i></i>
                </div>
                <p>Waiting for a note.</p>
                <small>Photo coming soon</small>
              </div>
            </figure>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
