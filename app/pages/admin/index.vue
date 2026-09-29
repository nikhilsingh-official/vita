<script setup>
import { ExternalLink, Pin, Plus, ReceiptText } from '@lucide/vue'
import { formatShortDate } from '~/utils/formatters'

definePageMeta({ layout: 'admin' })

const { stalls, loaded, setPublished, setPinned, createStall } = useAdminStalls()
const newTitle = ref('')
const newSlugTaken = computed(() => stalls.value.some((stall) => stall.slug === slugify(newTitle.value)))

function addStall() {
  const title = newTitle.value.trim()
  if (!title || newSlugTaken.value) return
  const slug = createStall(title)
  newTitle.value = ''
  navigateTo(`/admin/stall/${slug}`)
}
</script>

<template>
  <div class="admin-page">
    <header class="admin-page__header">
      <div>
        <h1>Stalls</h1>
        <p>Published stalls appear on the site. The pinned one is featured at the top of the home page.</p>
      </div>
      <NuxtLink class="admin-button admin-button--primary admin-pos-link" to="/admin/pos">
        <ReceiptText :size="18" :stroke-width="2.5" /> Open POS
      </NuxtLink>
      <form class="admin-new-stall" @submit.prevent="addStall">
        <label class="visually-hidden" for="new-stall-title">New stall name</label>
        <input id="new-stall-title" v-model="newTitle" type="text" placeholder="New stall, e.g. Sports Day 2026" autocomplete="off" />
        <button class="admin-button admin-button--primary" type="submit" :disabled="!newTitle.trim() || newSlugTaken">
          <Plus :size="18" :stroke-width="2.5" /> Add
        </button>
        <small v-if="newSlugTaken" class="admin-error">A stall with this name already exists.</small>
      </form>
    </header>

    <p v-if="!loaded" class="admin-empty">Loading stalls…</p>

    <ul v-else class="admin-stall-list">
      <li
        v-for="stall in stalls"
        :key="stall.slug"
        :class="['admin-stall', { 'admin-stall--hidden': !stall.published }]"
      >
        <NuxtLink class="admin-stall__main" :to="`/admin/stall/${stall.slug}`">
          <strong>{{ stall.title }}</strong>
          <span>
            {{ formatShortDate(stall.date) }}
            · <span :class="`admin-chip admin-chip--${stall.status}`">{{ stall.status === 'upcoming' ? 'Upcoming' : 'Completed' }}</span>
          </span>
        </NuxtLink>

        <div class="admin-stall__actions">
          <label class="admin-switch">
            <input
              type="checkbox"
              :checked="stall.published"
              @change="setPublished(stall.slug, $event.target.checked)"
            />
            <span class="admin-switch__track" aria-hidden="true"></span>
            {{ stall.published ? 'Published' : 'Hidden' }}
          </label>

          <button
            :class="['admin-button', { 'admin-button--pinned': stall.pinned }]"
            type="button"
            :aria-pressed="stall.pinned"
            :disabled="!stall.published"
            :title="stall.published ? '' : 'Publish the stall before pinning it'"
            @click="setPinned(stall.slug, !stall.pinned)"
          >
            <Pin :size="16" :stroke-width="2.5" /> {{ stall.pinned ? 'Pinned' : 'Pin' }}
          </button>

          <a
            v-if="stall.published"
            class="admin-button admin-button--quiet"
            :href="`/stall/${stall.slug}`"
            target="_blank"
            rel="noopener"
            :aria-label="`View ${stall.title} on the site`"
          >
            <ExternalLink :size="16" :stroke-width="2.5" />
          </a>
        </div>
      </li>
    </ul>
  </div>
</template>
