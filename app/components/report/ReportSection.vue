<script setup>
defineProps({ title: { type: String, required: true } })
</script>

<template>
  <section class="report-section">
    <h2 class="report-section__title">{{ title }}</h2>
    <slot />
  </section>
</template>
