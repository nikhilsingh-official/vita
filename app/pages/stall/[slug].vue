<script setup>
import { ArrowLeft, CalendarDays, HandHeart } from '@lucide/vue'
import { computed } from 'vue'
import BoardHeader from '~/components/BoardHeader.vue'
import ReportGallery from '~/components/report/ReportGallery.vue'
import ReportImpact from '~/components/report/ReportImpact.vue'
import ReportMenu from '~/components/report/ReportMenu.vue'
import ReportSection from '~/components/report/ReportSection.vue'
import { formatLongDate } from '~/utils/formatters'

const route = useRoute()
const router = useRouter()
const slug = computed(() => String(route.params.slug))
const { data: stall, error } = await usePublishedStall(slug)
if (error.value) {
  const notFound = error.value.statusCode === 404
  throw createError({
    statusCode: notFound ? 404 : 503,
    statusMessage: notFound ? 'Stall not found' : 'Stall could not be loaded',
    fatal: true,
  })
}

const hasPhotos = computed(() => Boolean(stall.value.gallery.length))
const coverPhoto = computed(() =>
  stall.value.heroImage
    ? { src: stall.value.heroImage, alt: stall.value.heroImageAlt }
    : stall.value.gallery[0],
)
const galleryPhotos = computed(() =>
  stall.value.gallery.filter((photo) => photo.src !== coverPhoto.value?.src),
)

function navigateTo(section) {
  router.push({ path: '/', hash: `#${section}` })
}

useHead({ title: () => `${stall.value.title} | Project Vita` })
</script>

<template>
  <BoardHeader @navigate="navigateTo" />

  <main class="report-page">
    <article :class="['event-report', hasPhotos ? 'event-report--photos' : 'event-report--text']">
      <nav class="report-toolbar" aria-label="Report navigation">
        <NuxtLink class="report-back" :to="{ path: '/', hash: '#wall' }">
          <ArrowLeft :size="15" :stroke-width="2.5" /> Notice board
        </NuxtLink>
      </nav>

      <header class="report-cover">
        <div class="report-cover__copy">
          <strong v-if="stall.status === 'upcoming'" class="report-status">Upcoming</strong>
          <h1>{{ stall.title }}</h1>
          <p class="report-summary">{{ stall.story }}</p>
        </div>

        <figure v-if="hasPhotos" class="report-cover__media">
          <img :src="coverPhoto.src" :alt="coverPhoto.alt" />
        </figure>
        <ReportImpact v-else class="report-cover__impact" :stall="stall" />
      </header>

      <div class="report-facts">
        <div class="report-fact">
          <CalendarDays :size="19" :stroke-width="2" />
          <span><small>Date</small><strong>{{ formatLongDate(stall.date) }}</strong></span>
        </div>
        <div v-if="stall.ngo.recorded" class="report-fact">
          <HandHeart :size="19" :stroke-width="2" />
          <span><small>Partner</small><strong>{{ stall.ngo.name }}</strong></span>
        </div>
      </div>

      <ReportSection v-if="hasPhotos" title="Impact">
        <ReportImpact :stall="stall" />
      </ReportSection>

      <ReportSection v-if="galleryPhotos.length" title="Gallery">
        <ReportGallery :photos="galleryPhotos" />
      </ReportSection>

      <ReportSection v-if="stall.menu.length" title="Menu">
        <ReportMenu :items="stall.menu" />
      </ReportSection>

      <ReportSection v-if="stall.ngo.description" :title="`About ${stall.ngo.name}`">
        <p class="report-partner">{{ stall.ngo.description }}</p>
      </ReportSection>
    </article>
  </main>
</template>
