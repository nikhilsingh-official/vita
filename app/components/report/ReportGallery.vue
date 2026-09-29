<script setup>
defineProps({ photos: { type: Array, required: true } })
</script>

<template>
  <div class="report-gallery">
    <figure v-for="photo in photos" :key="photo.src">
      <img :src="photo.src" :alt="photo.alt" :style="{ objectPosition: photo.crop }" loading="lazy" />
    </figure>
  </div>
</template>
