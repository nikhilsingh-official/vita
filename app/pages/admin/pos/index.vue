<script setup>
import { ArrowRight, ReceiptText } from '@lucide/vue'
import { formatShortDate } from '~/utils/formatters'

definePageMeta({ layout: 'admin' })

const { stalls, loaded } = useAdminStalls()

const orderedStalls = computed(() =>
  [...stalls.value].sort((a, b) => (a.status === 'upcoming' ? -1 : 0) - (b.status === 'upcoming' ? -1 : 0)),
)

const sellableCount = (stall) => (stall.menu ?? []).filter((item) => item.name && item.price != null).length

function openSessionFor(slug) {
  try {
    return JSON.parse(localStorage.getItem(`vita.pos.session.${slug}`))
  } catch {
    return null
  }
}
</script>

<template>
  <div class="admin-page">
    <header class="admin-page__header">
      <div>
        <h1>Point of sale</h1>
        <p>Pick the stall you're selling at. Its menu and prices load into the register.</p>
      </div>
    </header>

    <p v-if="!loaded" class="admin-empty">Loading stalls…</p>

    <ul v-else class="admin-stall-list">
      <li v-for="stall in orderedStalls" :key="stall.slug" :class="['admin-stall', { 'admin-stall--hidden': !sellableCount(stall) }]">
        <div class="admin-stall__main">
          <strong>{{ stall.title }}</strong>
          <span>
            {{ formatShortDate(stall.date) }}
            · <span :class="`admin-chip admin-chip--${stall.status}`">{{ stall.status === 'upcoming' ? 'Upcoming' : 'Completed' }}</span>
            · {{
              sellableCount(stall)
                ? `${sellableCount(stall)} items for sale`
                : stall.menu?.length ? 'Menu has no prices yet' : 'No menu yet'
            }}
          </span>
        </div>

        <div class="admin-stall__actions">
          <NuxtLink v-if="sellableCount(stall)" class="admin-button admin-button--primary" :to="`/admin/pos/${stall.slug}`">
            <ReceiptText :size="18" :stroke-width="2.5" />
            {{ openSessionFor(stall.slug) ? 'Resume register' : 'Open register' }}
            <ArrowRight :size="16" :stroke-width="2.5" />
          </NuxtLink>
          <NuxtLink v-else class="admin-button" :to="`/admin/stall/${stall.slug}`">
            {{ stall.menu?.length ? 'Add prices first' : 'Add a menu first' }}
          </NuxtLink>
        </div>
      </li>
    </ul>
  </div>
</template>
