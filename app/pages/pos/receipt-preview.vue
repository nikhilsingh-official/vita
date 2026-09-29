<script setup>
import { computed, ref } from 'vue'
import ReceiptTicket from '~/components/pos/ReceiptTicket.vue'
import { printReceipt } from '~/utils/printReceipt'

const { data: swimMeet } = await usePublishedStall(ref('swim-meet-2026'))
const priceOf = (name) => swimMeet.value.menu.find((item) => item.name === name).price
const paymentMethod = ref('UPI')
const receiptWrap = ref(null)

const order = computed(() => ({
  number: 'A-042',
  stallTitle: swimMeet.value.title,
  createdAt: '2026-08-29T10:42:00+05:30',
  cashier: 'Neel',
  partner: swimMeet.value.ngo.recorded ? swimMeet.value.ngo.name : null,
  items: [
    { name: 'Butter Popcorn', quantity: 2, unitPrice: priceOf('Butter Popcorn') },
    {
      name: 'Nachos and Salsa',
      quantity: 1,
      unitPrice: priceOf('Nachos and Salsa'),
      addOns: [{ name: 'Extra dip', price: 25 }],
    },
    { name: 'Peri Peri Fries', quantity: 1, unitPrice: priceOf('Peri Peri Fries') },
    { name: 'Lemonade', quantity: 2, unitPrice: priceOf('Lemonade') },
  ],
  payment: paymentMethod.value === 'Cash' ? { method: 'Cash', tendered: 700 } : { method: 'UPI' },
}))

useHead({ title: 'Receipt preview | Project Vita' })
</script>

<template>
  <main class="receipt-preview">
    <div class="receipt-preview__controls">
      <button
        v-for="method in ['UPI', 'Cash']"
        :key="method"
        type="button"
        :aria-pressed="paymentMethod === method"
        @click="paymentMethod = method"
      >
        Paid by {{ method }}
      </button>
      <button class="is-primary" type="button" @click="printReceipt(receiptWrap.firstElementChild)">
        Print receipt
      </button>
    </div>
    <div ref="receiptWrap">
      <ReceiptTicket :order="order" />
    </div>
  </main>
</template>
