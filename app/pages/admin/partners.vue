<script setup>
definePageMeta({ layout: 'admin' })

const { partners, savePartner } = useAdminPartners()

const drafts = reactive({})
const draftFor = (partner) => drafts[partner.id] ?? partner.description ?? ''
const isDirty = (partner) => drafts[partner.id] !== undefined && drafts[partner.id] !== (partner.description ?? '')

function save(partner) {
  savePartner(partner.id, partner.name, draftFor(partner))
  delete drafts[partner.id]
}
</script>

<template>
  <div class="admin-page">
    <header class="admin-page__header">
      <div>
        <h1>Partners</h1>
        <p>Descriptions show on the home page's partner strip and on each stall's page. Leave one empty to hide it.</p>
      </div>
    </header>

    <ul class="admin-partner-list">
      <li v-for="partner in partners" :key="partner.id" class="admin-card">
        <div class="admin-partner__heading">
          <h2>{{ partner.name }}</h2>
          <small v-if="partner.stalls.length">{{ partner.stalls.join(' · ') }}</small>
        </div>
        <label class="admin-field">
          <span>Description</span>
          <textarea
            :value="draftFor(partner)"
            rows="3"
            placeholder="One or two sentences about who they are and what the money supports."
            @input="drafts[partner.id] = $event.target.value"
          ></textarea>
        </label>
        <div class="admin-partner__actions">
          <button class="admin-button admin-button--quiet" type="button" :disabled="!isDirty(partner)" @click="delete drafts[partner.id]">
            Discard
          </button>
          <button class="admin-button admin-button--primary" type="button" :disabled="!isDirty(partner)" @click="save(partner)">
            Save
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
