<script setup>
import { computed } from 'vue'
import { formatMoney } from '../../utils/formatters'

const props = defineProps({ items: { type: Array, required: true } })

const groups = computed(() => {
  const byCategory = new Map()
  for (const item of props.items) {
    if (!byCategory.has(item.category)) byCategory.set(item.category, [])
    byCategory.get(item.category).push(item)
  }
  return [...byCategory].map(([category, items]) => ({ category, items }))
})
</script>

<template>
  <div class="report-menu-groups">
    <section v-for="group in groups" :key="group.category" class="report-menu-group">
      <h3 class="report-menu-group__title">{{ group.category }}</h3>
      <div class="report-menu">
        <div v-for="item in group.items" :key="item.name" class="report-menu__item">
          <span class="report-menu__name">{{ item.name }}</span>
          <strong class="report-menu__price">{{ formatMoney(item.price) }}</strong>
        </div>
      </div>
    </section>
  </div>
</template>
