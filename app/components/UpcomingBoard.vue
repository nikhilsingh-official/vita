<script setup>
import { ArrowDown, ArrowRight } from '@lucide/vue'
import { formatMoney, formatShortDate } from '../utils/formatters'

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
          Student-run food stalls, recorded here with their menus, proceeds and photographs.
        </p>

        <ul class="hero-impact" aria-label="Project Vita impact so far">
          <li class="impact-card impact-card--stalls">
            <span class="pin pin-gold" aria-hidden="true"></span>
            <span class="impact-card__label">Stalls so far</span>
            <strong class="impact-card__value">{{ summary.stallCount }}</strong>
          </li>
          <li class="impact-card impact-card--donation">
            <span class="pin pin-sage" aria-hidden="true"></span>
            <span class="impact-card__label">Total raised</span>
            <strong class="impact-card__value">{{ formatMoney(summary.amountRaised) }}</strong>
          </li>
          <li class="impact-card impact-card--partners">
            <span class="pin pin-gold" aria-hidden="true"></span>
            <span class="impact-card__label">Number of partners</span>
            <strong class="impact-card__value">{{ summary.partnerCount }}</strong>
          </li>
        </ul>

        <NuxtLink class="hero-wall-link" :to="{ path: '/', hash: '#wall' }">
          See the impact wall <ArrowDown :size="15" :stroke-width="2.75" />
        </NuxtLink>
      </div>

      <div class="receipt-wrap">
        <article class="next-receipt" aria-labelledby="next-stall-title">
          <div class="receipt-heading">
            <span>Project Vita</span>
          </div>

          <div class="receipt-intro">
            <span class="receipt-kicker">{{ stall.status === 'upcoming' ? 'Next stall' : stall.pinned ? 'Featured stall' : 'Latest stall' }}</span>
            <h2 id="next-stall-title">{{ stall.title }}</h2>
          </div>

          <dl class="receipt-details">
            <div>
              <dt>Date</dt>
              <dd>{{ formatShortDate(stall.date) }}</dd>
            </div>
            <div>
              <dt>In support of</dt>
              <dd>{{ stall.ngo.name }}</dd>
            </div>
          </dl>

          <p v-if="stall.status === 'upcoming'" class="receipt-note">
            Feel free to drop in and say hello!
          </p>

          <button
            class="button button--primary receipt-button"
            type="button"
            @click="$emit('select-stall', stall)"
          >
            {{ stall.status === 'upcoming' || stall.pinned ? 'View stall summary' : 'View latest stall summary' }}
            <ArrowRight :size="15" :stroke-width="2.75" />
          </button>

        </article>
      </div>
    </div>
  </section>
</template>
