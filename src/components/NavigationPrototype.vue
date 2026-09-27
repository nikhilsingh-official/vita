<script setup>
// PROTOTYPE: Three navbar directions, switchable via ?variant=, on the existing home route.
import { ArrowUp, ChevronLeft, ChevronRight } from '@lucide/vue'
import { onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineProps({ activeSection: { type: String, default: '' } })
const emit = defineEmits(['navigate'])
const route = useRoute()
const router = useRouter()
const showSwitcher = import.meta.env.DEV

const variants = [
  { key: 'A', name: 'Hero paper strip' },
  { key: 'B', name: 'Warm canvas bar' },
  { key: 'C', name: 'Floating index card' },
]

function navigate(id) {
  emit('navigate', id)
}

function cycle(direction) {
  const currentIndex = variants.findIndex((item) => item.key === route.query.variant)
  const nextIndex = (currentIndex + direction + variants.length) % variants.length
  router.replace({ query: { ...route.query, variant: variants[nextIndex].key }, hash: route.hash })
}

function handleKeydown(event) {
  const target = event.target
  if (target instanceof HTMLElement && (target.matches('input, textarea, [contenteditable]'))) return
  if (event.key === 'ArrowLeft') cycle(-1)
  if (event.key === 'ArrowRight') cycle(1)
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <header v-if="route.query.variant === 'A'" class="nav-prototype nav-prototype--paper">
    <span class="pin pin-gold" aria-hidden="true"></span>
    <button class="nav-prototype__brand" type="button" @click="navigate('upcoming')">
      <span class="nav-prototype__seal">V</span>
      <span><strong>Project Vita</strong><small>Inventure Academy</small></span>
    </button>
    <nav aria-label="Prototype navigation A">
      <button :class="{ active: activeSection === 'upcoming' }" @click="navigate('upcoming')">Upcoming</button>
      <button :class="{ active: activeSection === 'wall' }" @click="navigate('wall')">The Wall</button>
      <button :class="{ active: activeSection === 'about' }" @click="navigate('about')">About</button>
    </nav>
  </header>

  <header v-else-if="route.query.variant === 'B'" class="nav-prototype nav-prototype--quiet">
    <button class="nav-prototype__wordmark" type="button" @click="navigate('upcoming')">
      <strong>Project Vita</strong>
      <span>Student initiative · Inventure Academy</span>
    </button>
    <nav aria-label="Prototype navigation B">
      <button :class="{ active: activeSection === 'upcoming' }" @click="navigate('upcoming')">Upcoming stall</button>
      <button :class="{ active: activeSection === 'wall' }" @click="navigate('wall')">Impact wall</button>
      <button :class="{ active: activeSection === 'about' }" @click="navigate('about')">About</button>
    </nav>
  </header>

  <header v-else class="nav-prototype nav-prototype--index">
    <span class="pin pin-gold" aria-hidden="true"></span>
    <button class="nav-prototype__index-brand" type="button" @click="navigate('upcoming')">
      <small>Board index</small>
      <strong>Project Vita</strong>
    </button>
    <nav aria-label="Prototype navigation C">
      <button :class="{ active: activeSection === 'upcoming' }" @click="navigate('upcoming')"><span>01</span> Upcoming</button>
      <button :class="{ active: activeSection === 'wall' }" @click="navigate('wall')"><span>02</span> The Wall</button>
      <button :class="{ active: activeSection === 'about' }" @click="navigate('about')"><span>03</span> About</button>
    </nav>
  </header>

  <button class="back-to-top-tag" type="button" @click="navigate('upcoming')">
    <ArrowUp :size="14" :stroke-width="2.75" />
    <span>Back to top</span>
  </button>

  <div v-if="showSwitcher" class="prototype-switcher" aria-label="Navigation prototype switcher">
    <button type="button" aria-label="Previous navigation variant" @click="cycle(-1)">
      <ChevronLeft :size="17" />
    </button>
    <span>{{ route.query.variant }} — {{ variants.find((item) => item.key === route.query.variant)?.name }}</span>
    <button type="button" aria-label="Next navigation variant" @click="cycle(1)">
      <ChevronRight :size="17" />
    </button>
  </div>
</template>
