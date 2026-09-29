<script setup>
import { computed } from 'vue'

// 58mm roll, 48mm printable. Pure black and borders only: browsers drop
// background colours when printing.
const props = defineProps({
  order: { type: Object, required: true },
})

const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
const timeFormat = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })

const lines = computed(() =>
  props.order.items.map((item) => {
    const addOns = item.addOns ?? []
    const unitTotal = item.unitPrice + addOns.reduce((sum, addOn) => sum + addOn.price, 0)
    return { ...item, addOns, lineTotal: unitTotal * item.quantity }
  }),
)
const itemCount = computed(() => lines.value.reduce((sum, line) => sum + line.quantity, 0))
const total = computed(() => lines.value.reduce((sum, line) => sum + line.lineTotal, 0))
const change = computed(() =>
  props.order.payment.method === 'Cash' ? props.order.payment.tendered - total.value : 0,
)
const createdAt = computed(() => new Date(props.order.createdAt))
</script>

<template>
  <article class="receipt" :aria-label="`Receipt for order ${order.number}`">
    <header class="receipt__header">
      <strong class="receipt__brand">Project Vita</strong>
      <span>Student food stall</span>
      <span class="receipt__event">{{ order.stallTitle }}</span>
    </header>

    <div class="receipt__order-number">
      <small>Order no.</small>
      <strong>{{ order.number }}</strong>
    </div>

    <dl class="receipt__meta">
      <div><dt>Date</dt><dd>{{ dateFormat.format(createdAt) }}</dd></div>
      <div><dt>Time</dt><dd>{{ timeFormat.format(createdAt) }}</dd></div>
      <div v-if="order.cashier"><dt>Served by</dt><dd>{{ order.cashier }}</dd></div>
    </dl>

    <table class="receipt__items">
      <thead>
        <tr><th scope="col">Qty</th><th scope="col">Item</th><th scope="col">Amt</th></tr>
      </thead>
      <tbody v-for="line in lines" :key="line.name">
        <tr>
          <td>{{ line.quantity }}</td>
          <td>{{ line.name }}</td>
          <td>{{ rupees.format(line.lineTotal) }}</td>
        </tr>
        <tr v-if="line.quantity > 1" class="receipt__detail">
          <td></td><td>@ {{ rupees.format(line.unitPrice) }} each</td><td></td>
        </tr>
        <tr v-for="addOn in line.addOns" :key="addOn.name" class="receipt__detail">
          <td></td><td>+ {{ addOn.name }} ({{ rupees.format(addOn.price) }})</td><td></td>
        </tr>
      </tbody>
    </table>

    <dl class="receipt__totals">
      <div><dt>Items</dt><dd>{{ itemCount }}</dd></div>
      <div class="receipt__grand-total"><dt>Total</dt><dd>{{ rupees.format(total) }}</dd></div>
      <div><dt>Paid by {{ order.payment.method }}</dt><dd>{{ rupees.format(order.payment.tendered ?? total) }}</dd></div>
      <div v-if="change > 0"><dt>Change</dt><dd>{{ rupees.format(change) }}</dd></div>
    </dl>

    <footer class="receipt__footer">
      <p v-if="order.partner">All proceeds support {{ order.partner }}.</p>
      <p class="receipt__thanks">Thank you!</p>
      <small>Not a tax invoice</small>
    </footer>
  </article>
</template>
