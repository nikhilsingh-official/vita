<script setup>
import { computed } from 'vue'
import { formatMoney } from '../../utils/formatters'
import { getAmountLabel, getItemsLabel } from '../../utils/impact'

const props = defineProps({ stall: { type: Object, required: true } })

const metrics = computed(() => {
  const { impact } = props.stall
  return [
    { label: getAmountLabel(props.stall), value: formatMoney(impact.amountRaised), primary: true },
    impact.platesServed != null && { label: getItemsLabel(impact), value: impact.platesServed },
    impact.expenses != null && { label: 'Expenses', value: formatMoney(impact.expenses) },
  ].filter(Boolean)
})
</script>

<template>
  <div class="report-impact" :style="{ '--metric-count': metrics.length }">
    <div
      v-for="metric in metrics"
      :key="metric.label"
      :class="['report-metric', { 'report-metric--primary': metric.primary }]"
    >
      <small>{{ metric.label }}</small>
      <strong>{{ metric.value }}</strong>
    </div>
  </div>
</template>
