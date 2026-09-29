<script setup>
import { ArrowRight } from '@lucide/vue'
import {
  formatLongDate,
  formatMoney,
} from '../utils/formatters'
import { getAmountLabel, getItemsLabel } from '../utils/impact'

defineProps({ stall: { type: Object, required: true } })
</script>

<template>
  <section id="stall-summary" class="stall-summary-section cork-section" aria-live="polite">
    <div class="section-inner stall-summary-inner">
      <div class="stall-summary-heading">
        <div>
          <h2>Stall summary</h2>
        </div>
        <p>The short version is pinned here. Open the report for photos, totals and the full menu.</p>
      </div>

      <NuxtLink
        class="stall-summary-card paper"
        :to="`/stall/${stall.slug}`"
        :aria-label="`View complete event report for ${stall.title}`"
      >
        <span class="pin pin-gold" aria-hidden="true"></span>

        <div class="stall-summary-main">
          <strong v-if="stall.status === 'upcoming'" class="stall-summary-status">Upcoming</strong>

          <h3>{{ stall.title }}</h3>
          <p class="stall-summary-description">{{ stall.story }}</p>

          <dl class="stall-summary-facts">
            <div><dt>Date</dt><dd>{{ formatLongDate(stall.date) }}</dd></div>
          </dl>

          <div class="stall-summary-menu">
            <span class="note-label">Featured menu</span>
            <div>
              <span v-for="item in stall.menu.slice(0, 4)" :key="item.name">
                <strong>{{ item.name }}</strong>
                <small>{{ formatMoney(item.price) }}</small>
              </span>
            </div>
          </div>
        </div>

        <aside class="stall-summary-side">
          <div v-if="stall.gallery.length" class="stall-summary-gallery">
            <img
              v-for="photo in stall.gallery.slice(0, 3)"
              :key="photo.src"
              :src="photo.src"
              :alt="photo.alt"
              :style="{ objectPosition: photo.crop }"
            />
          </div>

          <div class="stall-summary-ngo">
            <span class="note-label note-label--sage">Partner NGO</span>
            <h4>{{ stall.ngo.name }}</h4>
            <p v-if="stall.ngo.description">{{ stall.ngo.description }}</p>
          </div>

          <div class="stall-summary-impact">
            <span>
              <strong>{{ formatMoney(stall.impact.amountRaised, 'Not recorded') }}</strong>
              <small>{{ getAmountLabel(stall) }}</small>
            </span>
            <span v-if="stall.impact.platesServed != null">
              <strong>{{ stall.impact.platesServed }}</strong>
              <small>{{ getItemsLabel(stall.impact) }}</small>
            </span>
          </div>
        </aside>

        <footer class="stall-summary-action">
          <span>View Event Report</span>
          <ArrowRight :size="17" :stroke-width="2.75" />
        </footer>
      </NuxtLink>
    </div>
  </section>
</template>
