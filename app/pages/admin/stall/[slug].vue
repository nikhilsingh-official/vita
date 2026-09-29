<script setup>
import { ArrowLeft, Pin, Plus, Trash2 } from '@lucide/vue'

definePageMeta({ layout: 'admin' })

const CATEGORIES = ['Savoury', 'Sweets', 'Drinks', 'Add-on']
const DATE_PATTERN = /^\d{4}(-\d{2}(-\d{2})?)?$/

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { stalls, loaded, saveStall, setPublished, setPinned } = useAdminStalls()
const stall = computed(() => stalls.value.find((item) => item.slug === slug.value))

// Edits a copy so live updates don't overwrite what's being typed.
const draft = ref(null)

function toDraft(source) {
  return {
    title: source.title,
    date: source.date,
    status: source.status,
    story: source.story ?? '',
    partner: source.ngo?.recorded ? source.ngo.name : '',
    amountRaised: source.impact?.amountRaised ?? null,
    expenses: source.impact?.expenses ?? null,
    platesServed: source.impact?.platesServed ?? null,
    menu: (source.menu ?? []).map((item) => ({ costPrice: null, ...item })),
  }
}

watch(
  stall,
  (current) => {
    if (current && !draft.value) draft.value = toDraft(current)
  },
  { immediate: true },
)

const dirty = computed(
  () => draft.value && stall.value && JSON.stringify(draft.value) !== JSON.stringify(toDraft(stall.value)),
)
const dateValid = computed(() => DATE_PATTERN.test(draft.value?.date ?? ''))
const canSave = computed(() => dirty.value && dateValid.value && draft.value.title.trim())

// v-model.number gives '' for an empty input.
const numberOrNull = (value) => (value === '' || value == null ? null : Number(value))

function addMenuItem() {
  draft.value.menu.push({ name: '', category: CATEGORIES[0], costPrice: null, price: null })
}

function save() {
  if (!canSave.value) return
  const partner = draft.value.partner.trim()
  const fields = {
    title: draft.value.title.trim(),
    date: draft.value.date,
    status: draft.value.status,
    story: draft.value.story.trim(),
    ngo: partner ? { name: partner, recorded: true } : { name: 'Partner not recorded', recorded: false },
    impact: {
      ...stall.value.impact,
      amountRaised: numberOrNull(draft.value.amountRaised),
      expenses: numberOrNull(draft.value.expenses),
      platesServed: numberOrNull(draft.value.platesServed),
    },
    menu: draft.value.menu
      .filter((item) => item.name.trim())
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        costPrice: numberOrNull(item.costPrice),
        price: numberOrNull(item.price),
      })),
  }
  saveStall(slug.value, fields)
  // Built from the saved fields: the local snapshot may not have arrived yet.
  draft.value = toDraft({ ...stall.value, ...fields })
}

function discard() {
  draft.value = toDraft(stall.value)
}

onBeforeRouteLeave(() => {
  if (dirty.value && !window.confirm('You have unsaved changes. Leave without saving?')) return false
})
</script>

<template>
  <div class="admin-page">
    <NuxtLink class="admin-back" to="/admin"><ArrowLeft :size="16" :stroke-width="2.5" /> All stalls</NuxtLink>

    <p v-if="!loaded" class="admin-empty">Loading…</p>
    <p v-else-if="!stall" class="admin-empty">There's no stall called “{{ slug }}”.</p>

    <form v-else-if="draft" class="admin-editor" @submit.prevent="save">
      <header class="admin-page__header">
        <div>
          <h1>{{ stall.title }}</h1>
          <p>{{ stall.published ? `Live at /stall/${stall.slug}` : 'Hidden from the site' }}</p>
        </div>
        <div class="admin-stall__actions">
          <label class="admin-switch">
            <input type="checkbox" :checked="stall.published" @change="setPublished(stall.slug, $event.target.checked)" />
            <span class="admin-switch__track" aria-hidden="true"></span>
            {{ stall.published ? 'Published' : 'Hidden' }}
          </label>
          <button
            :class="['admin-button', { 'admin-button--pinned': stall.pinned }]"
            type="button"
            :aria-pressed="stall.pinned"
            :disabled="!stall.published"
            @click="setPinned(stall.slug, !stall.pinned)"
          >
            <Pin :size="16" :stroke-width="2.5" /> {{ stall.pinned ? 'Pinned' : 'Pin' }}
          </button>
        </div>
      </header>

      <fieldset class="admin-card">
        <legend>Details</legend>
        <label class="admin-field">
          <span>Name</span>
          <input v-model="draft.title" type="text" required />
        </label>
        <div class="admin-field-row">
          <label class="admin-field">
            <span>Date</span>
            <input v-model="draft.date" type="text" inputmode="numeric" placeholder="2026-08-29" :aria-invalid="!dateValid" />
            <small :class="{ 'admin-error': !dateValid }">Full date (2026-08-29), month (2026-02) or year (2026).</small>
          </label>
          <div class="admin-field">
            <span>Status</span>
            <div class="admin-segmented" role="radiogroup" aria-label="Status">
              <label v-for="option in ['upcoming', 'completed']" :key="option">
                <input v-model="draft.status" type="radio" name="status" :value="option" />
                <span>{{ option === 'upcoming' ? 'Upcoming' : 'Completed' }}</span>
              </label>
            </div>
          </div>
        </div>
        <label class="admin-field">
          <span>Overview</span>
          <textarea v-model="draft.story" rows="3" placeholder="One or two sentences shown under the stall name."></textarea>
        </label>
        <label class="admin-field">
          <span>Partner</span>
          <input v-model="draft.partner" type="text" placeholder="Leave empty if not decided yet" />
        </label>
      </fieldset>

      <fieldset class="admin-card">
        <legend>Impact</legend>
        <div class="admin-field-row admin-field-row--three">
          <label class="admin-field">
            <span>{{ draft.status === 'upcoming' ? 'Expected amount (₹)' : 'Amount raised (₹)' }}</span>
            <input v-model.number="draft.amountRaised" type="number" min="0" inputmode="numeric" />
          </label>
          <label class="admin-field">
            <span>Expenses (₹)</span>
            <input v-model.number="draft.expenses" type="number" min="0" step="any" inputmode="decimal" />
          </label>
          <label class="admin-field">
            <span>Items served</span>
            <input v-model.number="draft.platesServed" type="number" min="0" inputmode="numeric" />
          </label>
        </div>
        <small>Leave a figure empty to hide it on the site.</small>
      </fieldset>

      <fieldset class="admin-card">
        <legend>Menu</legend>
        <p class="admin-menu__hint">The POS uses this menu: selling price is what customers pay; cost price is optional and gives the register its profit figure.</p>
        <div v-if="draft.menu.length" class="admin-menu__row admin-menu__labels" aria-hidden="true">
          <span>Item</span><span>Category</span><span>Cost ₹</span><span>Sell ₹</span><span></span>
        </div>
        <ul class="admin-menu">
          <li v-for="(item, index) in draft.menu" :key="index" class="admin-menu__row">
            <input v-model="item.name" type="text" placeholder="Item name" :aria-label="`Item ${index + 1} name`" />
            <select v-model="item.category" :aria-label="`Item ${index + 1} category`">
              <option v-for="category in CATEGORIES" :key="category" :value="category">{{ category }}</option>
            </select>
            <input v-model.number="item.costPrice" type="number" min="0" step="any" inputmode="decimal" placeholder="Cost" :aria-label="`Item ${index + 1} cost price`" />
            <input v-model.number="item.price" type="number" min="0" inputmode="numeric" placeholder="Sell" :aria-label="`Item ${index + 1} selling price`" />
            <button class="admin-button admin-button--quiet" type="button" :aria-label="`Remove ${item.name || 'item'}`" @click="draft.menu.splice(index, 1)">
              <Trash2 :size="16" :stroke-width="2.5" />
            </button>
          </li>
        </ul>
        <button class="admin-button" type="button" @click="addMenuItem"><Plus :size="16" :stroke-width="2.5" /> Add item</button>
      </fieldset>

      <div class="admin-savebar" :class="{ 'admin-savebar--dirty': dirty }">
        <span>{{ dirty ? 'Unsaved changes' : 'No unsaved changes' }}</span>
        <button class="admin-button admin-button--quiet" type="button" :disabled="!dirty" @click="discard">Discard</button>
        <button class="admin-button admin-button--primary" type="submit" :disabled="!canSave">Save changes</button>
      </div>
    </form>
  </div>
</template>
