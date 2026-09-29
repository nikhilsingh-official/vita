<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import AboutSection from '../components/AboutSection.vue'
import ArchiveWall from '../components/ArchiveWall.vue'
import BoardHeader from '../components/BoardHeader.vue'
import PartnersCarousel from '../components/PartnersCarousel.vue'
import StallSummary from '../components/StallSummary.vue'
import TestimonialsCarousel from '../components/TestimonialsCarousel.vue'
import UpcomingBoard from '../components/UpcomingBoard.vue'
import { testimonials } from '../data/testimonials'
import { sumAmountRaised } from '../utils/impact'

const route = useRoute()
const router = useRouter()
const { data: stalls, error } = await usePublishedStalls()
if (error.value) {
  throw createError({ statusCode: 503, statusMessage: 'Stalls could not be loaded', fatal: true })
}
const archivedStalls = computed(() => stalls.value.filter((stall) => stall.status === 'completed'))
const featuredStall = computed(() => pickFeaturedStall(stalls.value))
const partners = computed(() => [
  ...new Map(
    stalls.value
      .filter((stall) => stall.ngo.recorded)
      .map((stall) => [stall.ngo.name, stall.ngo]),
  ).values(),
])
const summary = computed(() => ({
  stallCount: archivedStalls.value.length,
  amountRaised: sumAmountRaised(archivedStalls.value),
  partnerCount: new Set(
    archivedStalls.value.filter((stall) => stall.ngo.recorded).map((stall) => stall.ngo.name),
  ).size,
}))
const selectedSlug = ref(null)
const selectedStall = computed(
  () => stalls.value.find((stall) => stall.slug === selectedSlug.value) ?? featuredStall.value,
)
const activeSection = ref('upcoming')
let observer

function navigateTo(id) {
  router.push({ path: '/', hash: `#${id}` })
}

function selectStall(stall) {
  selectedSlug.value = stall.slug
  nextTick(() => {
    document.getElementById('stall-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function observeSections() {
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) activeSection.value = visible.target.dataset.navSection
    },
    { rootMargin: '-20% 0px -55%', threshold: [0, 0.2, 0.5] },
  )

  document.querySelectorAll('[data-nav-section]').forEach((section) => observer.observe(section))
}

useHead({ title: 'Project Vita' })

onMounted(() => {
  observeSections()

  if (route.hash) document.querySelector(route.hash)?.scrollIntoView()
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <BoardHeader :active-section="activeSection" @navigate="navigateTo" />
  <main>
    <UpcomingBoard
      v-if="featuredStall"
      :stall="featuredStall"
      :summary="summary"
      @select-stall="selectStall"
    />
    <PartnersCarousel v-if="partners.length" :partners="partners" />
    <StallSummary v-if="selectedStall" :stall="selectedStall" />
    <ArchiveWall
      :stalls="archivedStalls"
      :selected-slug="selectedStall?.slug"
      @select-stall="selectStall"
    />
    <TestimonialsCarousel :testimonials="testimonials" />
    <AboutSection :summary="summary" />
  </main>
</template>
