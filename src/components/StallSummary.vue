<script setup>
import { ArrowRight } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import {
  formatLongDate,
  formatMoney,
  formatStatus,
  formatTimeRange,
} from '../utils/formatters'

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

      <RouterLink
        class="stall-summary-card paper"
        :to="{ name: 'stall', params: { slug: stall.slug } }"
        :aria-label="`View complete event report for ${stall.title}`"
      >
        <span class="pin pin-gold" aria-hidden="true"></span>

        <div class="stall-summary-main">
          <header class="stall-summary-header">
            <span>Stall no. {{ stall.board.number }}</span>
            <strong :class="`stall-summary-status stall-summary-status--${stall.status}`">
              {{ formatStatus(stall.status) }}
            </strong>
          </header>

          <h3>{{ stall.title }}</h3>
          <p class="stall-summary-subtitle">{{ stall.subtitle }}</p>
          <p class="stall-summary-description">{{ stall.story }}</p>

          <dl class="stall-summary-facts">
            <div><dt>Date</dt><dd>{{ formatLongDate(stall.date) }}</dd></div>
            <div><dt>Time</dt><dd>{{ formatTimeRange(stall.startTime, stall.endTime) }}</dd></div>
            <div><dt>Location</dt><dd>{{ stall.location }}</dd></div>
            <div><dt>Payment</dt><dd>{{ stall.paymentMethods.join(' · ') }}</dd></div>
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
          <div class="stall-summary-gallery">
            <img
              v-for="photo in stall.gallery.slice(0, 3)"
              :key="`${photo.src}-${photo.caption}`"
              :src="photo.src"
              :alt="photo.alt"
              :style="{ objectPosition: photo.crop }"
            />
          </div>

          <div class="stall-summary-ngo">
            <span class="note-label note-label--sage">Partner NGO</span>
            <h4>{{ stall.ngo.name }}</h4>
            <p>{{ stall.ngo.description }}</p>
          </div>

          <div class="stall-summary-impact">
            <span>
              <strong>{{ formatMoney(stall.impact.netDonation, 'Pending') }}</strong>
              <small>amount raised</small>
            </span>
            <span>
              <strong>{{ stall.impact.platesServed ?? 'Pending' }}</strong>
              <small>plates served</small>
            </span>
          </div>
        </aside>

        <footer class="stall-summary-action">
          <span>View Event Report</span>
          <ArrowRight :size="17" :stroke-width="2.75" />
        </footer>
      </RouterLink>
    </div>
  </section>
</template>
