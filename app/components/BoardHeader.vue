<script setup>
defineProps({ activeSection: { type: String, default: '' } })
defineEmits(['navigate'])

const links = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'wall', label: 'The Wall' },
  { id: 'about', label: 'About' },
]
</script>

<template>
  <header class="site-header">
    <button class="brand" type="button" aria-label="Project Vita, go to the upcoming stall" @click="$emit('navigate', 'upcoming')">
      <img class="brand-mark" src="/favicon.svg" alt="" width="36" height="36" />
      <span class="brand-copy">
        <strong>Project Vita</strong>
      </span>
    </button>

    <nav aria-label="Main navigation">
      <button
        v-for="link in links"
        :key="link.id"
        :class="{ active: activeSection === link.id }"
        :aria-current="activeSection === link.id ? 'location' : undefined"
        type="button"
        @click="$emit('navigate', link.id)"
      >
        {{ link.label }}
      </button>
    </nav>
  </header>
</template>
