<script setup>
import AutoScroll from 'embla-carousel-auto-scroll'
import emblaCarouselVue from 'embla-carousel-vue'

defineProps({ partners: { type: Array, required: true } })

const reduceMotion = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const plugins = reduceMotion
  ? []
  : [
      AutoScroll({
        playOnInit: true,
        speed: 0.8,
        startDelay: 700,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ]

const [emblaRef] = emblaCarouselVue(
  {
    align: 'start',
    dragFree: true,
    loop: true,
  },
  plugins,
)
</script>

<template>
  <section class="partners-section cork" aria-labelledby="partners-title">
    <div class="section-inner partners-inner">
      <header class="partners-heading">
        <h2 id="partners-title">Our Partners</h2>
      </header>

      <div ref="emblaRef" class="partners-viewport">
        <div class="partners-rail">
          <article v-for="partner in partners" :key="partner.name" class="partner-tile">
            <div class="partner-tile__heading">
              <div class="partner-monogram" aria-hidden="true">{{ partner.name.charAt(0) }}</div>
              <h3>{{ partner.name }}</h3>
            </div>
            <p v-if="partner.description" class="partner-tile__description">{{ partner.description }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
