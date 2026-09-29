<script setup>
import { Mail } from '@lucide/vue'
import { formatMoney } from '../utils/formatters'

defineProps({ summary: { type: Object, required: true } })

const steps = [
  'We pick a partner and ask what they need funding for.',
  'We plan a menu we can cook in a school kitchen.',
  "Ingredients are paid for up front, out of the last stall's float.",
  'The poster goes on the board a week ahead.',
  'We count, hand it over, and write the number down here.',
]
</script>

<template>
  <section id="about" class="about-section cork-section" data-nav-section="about">
    <div class="section-inner about-grid">
      <article class="about-sheet paper">
        <span class="tape tape-left" aria-hidden="true"></span>
        <h2>We run a food stall once a month</h2>
        <p>Project Vita is a student initiative. Once a month we set up a stall outside the canteen, cook something we can actually manage between classes, and sell it for a couple of hours. Whatever is left after ingredients goes to one partner organisation, chosen before the stall, not after.</p>
        <p>We keep it small on purpose. One menu, one afternoon, one partner. It means we can tell you exactly what was made and exactly where it went.</p>
        <p>The board is the record. Every poster we put up stays up with its menu, photos and number. Nothing gets quietly taken down, including the stalls that went badly.</p>
        <p>If you want to cook, serve, wash up, or hold the cash box, come find us at the stall. That is genuinely how everyone here joined.</p>
      </article>

      <div class="about-notes">
        <div class="process-note scrap">
          <span class="pin pin-sage" aria-hidden="true"></span>
          <small class="note-label note-label--sage">How a stall works</small>
          <ol>
            <li v-for="(step, index) in steps" :key="step"><strong>{{ index + 1 }}</strong><span>{{ step }}</span></li>
          </ol>
        </div>

        <div class="totals-note scrap">
          <small class="note-label">The board, in total</small>
          <div>
            <span><strong>{{ summary.stallCount }}</strong><small>stalls</small></span>
            <span><strong>{{ formatMoney(summary.amountRaised) }}</strong><small>raised in total</small></span>
            <span><strong>{{ summary.partnerCount }}</strong><small>partner orgs</small></span>
          </div>
        </div>

        <a class="contact-link" href="mailto:ouremailhere@gmail.com">
          <Mail :size="16" :stroke-width="2.75" /> ouremailhere@gmail.com
        </a>
      </div>
    </div>
  </section>
</template>
