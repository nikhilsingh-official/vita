<script setup>
import { computed } from 'vue'
import { formatMoney, formatShortDate } from '../utils/formatters'

const props = defineProps({
  stalls: { type: Array, required: true },
  selectedSlug: { type: String, default: '' },
})
defineEmits(['select-stall'])
const years = computed(() => [...new Set(props.stalls.map((stall) => stall.date.slice(0, 4)))])

const ROTATIONS = ['-0.8deg', '1deg', '-1.4deg', '0.6deg', '-0.4deg', '1.2deg', '-1deg', '0.4deg']
const rotationFor = (stall) => ROTATIONS[(stall.sortOrder - 1) % ROTATIONS.length]
const pinFor = (stall) => (stall.sortOrder % 3 === 0 ? 'pin-sage' : 'pin-gold')
</script>

<template>
  <section id="wall" class="archive-section cork-section" data-nav-section="wall">
    <div class="section-inner archive-inner">
      <div class="section-heading">
        <div>
          <h2>{{ stalls.length }} stalls, so far</h2>
        </div>
        <p>Newest at the top. Choose a poster to bring its summary into focus.</p>
      </div>

      <template v-for="year in years" :key="year">
        <div class="year-marker"><span>{{ year }}</span><i></i></div>
        <div class="archive-grid">
          <button
            v-for="stall in stalls.filter((item) => item.date.startsWith(year))"
            :key="stall.slug"
            :class="['archive-poster', 'paper', { 'archive-poster--selected': stall.slug === selectedSlug }]"
            type="button"
            :style="{ '--rotation': rotationFor(stall) }"
            :aria-label="`Show summary for ${stall.title}`"
            :aria-pressed="stall.slug === selectedSlug"
            @click="$emit('select-stall', stall)"
          >
            <span :class="['pin', pinFor(stall)]" aria-hidden="true"></span>
            <small>{{ formatShortDate(stall.date) }}</small>
            <strong>{{ stall.title }}</strong>
            <span class="archive-meta">
              <span>{{ stall.ngo.name }}</span>
              <b>{{ formatMoney(stall.impact.amountRaised) }}</b>
            </span>
          </button>
        </div>
      </template>
    </div>
  </section>
</template>
