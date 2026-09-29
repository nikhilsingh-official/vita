<script setup>
import { ArrowLeft } from '@lucide/vue'
import BoardHeader from '~/components/BoardHeader.vue'

const props = defineProps({ error: { type: Object, required: true } })
const notFound = computed(() => props.error.statusCode === 404)

function navigateTo(section) {
  clearError({ redirect: `/#${section}` })
}

useHead({ title: () => (notFound.value ? 'Page not found | Project Vita' : 'Something went wrong | Project Vita') })
</script>

<template>
  <BoardHeader @navigate="navigateTo" />
  <main class="error-page cork-section">
    <div class="error-sheet paper">
      <h1>{{ notFound ? 'This page is not on the board' : 'Something went wrong' }}</h1>
      <p>
        {{ notFound ? 'The address does not match a Project Vita page.' : 'The board could not be loaded. Try again in a moment.' }}
      </p>
      <button class="button button--primary" type="button" @click="clearError({ redirect: '/' })">
        <ArrowLeft :size="15" :stroke-width="2.75" /> Back to Project Vita
      </button>
    </div>
  </main>
</template>
