<script setup>
import { ArrowDown, ArrowRight } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import { formatMoney, formatShortDate, formatTimeRange } from '../utils/formatters'

defineProps({
  stall: { type: Object, required: true },
  summary: { type: Object, required: true },
})

defineEmits(['select-stall'])
</script>

<template>
  <section id="upcoming" class="upcoming-board cork" data-nav-section="upcoming">
    <div class="hero-layout">
      <div class="hero-copy">
        <h1>Project Vita</h1>
        <p class="hero-description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>

        <ul class="hero-impact" aria-label="Project Vita impact so far">
          <li class="impact-card impact-card--stalls">
            <span class="pin pin-gold" aria-hidden="true"></span>
            <span class="impact-card__label">Stalls so far</span>
            <strong class="impact-card__value">{{ summary.stallCount }}</strong>
          </li>
          <li class="impact-card impact-card--donation">
            <span class="pin pin-sage" aria-hidden="true"></span>
            <span class="impact-card__label">Given to partners</span>
            <strong class="impact-card__value">{{ formatMoney(summary.totalDonation) }}</strong>
          </li>
          <li class="impact-card impact-card--partners">
            <span class="pin pin-gold" aria-hidden="true"></span>
            <span class="impact-card__label">Number of partners</span>
            <strong class="impact-card__value">{{ summary.partnerCount }}</strong>
          </li>
        </ul>

        <RouterLink class="hero-wall-link" :to="{ name: 'home', hash: '#wall' }">
          See the impact wall <ArrowDown :size="15" :stroke-width="2.75" />
        </RouterLink>
      </div>

      <div class="receipt-wrap">
        <article class="next-receipt" aria-labelledby="next-stall-title">
          <div class="receipt-heading">
            <span>Project Vita</span>
            <span>Stall {{ stall.board.number }}</span>
          </div>

          <div class="receipt-intro">
            <span class="receipt-kicker">Next stall</span>
            <h2 id="next-stall-title">{{ stall.title }}</h2>
          </div>

          <dl class="receipt-details">
            <div>
              <dt>Date</dt>
              <dd>{{ formatShortDate(stall.date) }}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{{ formatTimeRange(stall.startTime, stall.endTime) }}</dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>{{ stall.location }}</dd>
            </div>
            <div>
              <dt>In support of</dt>
              <dd>{{ stall.ngo.name }}</dd>
            </div>
          </dl>

          <p class="receipt-note">
            Feel free to drop in and say hello!
          </p>

          <button
            class="button button--primary receipt-button"
            type="button"
            @click="$emit('select-stall', stall)"
          >
            View stall summary <ArrowRight :size="15" :stroke-width="2.75" />
          </button>

        </article>
      </div>
    </div>
  </section>
</template>
