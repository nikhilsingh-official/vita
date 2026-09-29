<script setup>
import { ArrowLeft, Banknote, Check, Minus, Plus, Printer, Search, Smartphone, Trash2, X } from '@lucide/vue'
import ReceiptTicket from '~/components/pos/ReceiptTicket.vue'
import { formatMoney } from '~/utils/formatters'
import { printReceipt } from '~/utils/printReceipt'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const slug = String(route.params.slug)
const { stalls, loaded } = useAdminStalls()
const { user } = useAdminSession()
const stall = computed(() => stalls.value.find((item) => item.slug === slug))
const menu = computed(() => (stall.value?.menu ?? []).filter((item) => item.name && item.price != null))

const { session, orders, totals, openSession, closeSession, recordOrder } = usePosRegister(slug)
onMounted(() => {
  if (!session.value) openSession()
})

useHead({ title: () => `Register · ${stall.value?.title ?? 'POS'} | Project Vita` })

const search = ref('')
const category = ref('All')
const searchInput = ref(null)
const categories = computed(() => ['All', ...new Set(menu.value.map((item) => item.category))])
const visibleItems = computed(() => {
  const term = search.value.trim().toLowerCase()
  return menu.value.filter(
    (item) =>
      (category.value === 'All' || item.category === category.value) &&
      (!term || item.name.toLowerCase().includes(term)),
  )
})

const cart = ref([])
const cartTotal = computed(() => cart.value.reduce((sum, line) => sum + orderLineTotal(line), 0))
const cartCount = computed(() => cart.value.reduce((sum, line) => sum + line.quantity, 0))
const nextNumber = computed(() =>
  session.value ? `${session.value.code}-${String(session.value.nextSequence).padStart(3, '0')}` : '',
)

function addItem(item) {
  const line = cart.value.find((existing) => existing.name === item.name)
  if (line) line.quantity += 1
  else {
    cart.value.push({
      name: item.name,
      category: item.category,
      unitPrice: item.price,
      costPrice: item.costPrice ?? null,
      quantity: 1,
    })
  }
}

function changeQuantity(line, delta) {
  line.quantity += delta
  if (line.quantity <= 0) cart.value = cart.value.filter((existing) => existing !== line)
}

const quantityIn = (item) => cart.value.find((line) => line.name === item.name)?.quantity ?? 0

function addFirstMatch() {
  if (visibleItems.value.length) {
    addItem(visibleItems.value[0])
    search.value = ''
  }
}

const step = ref('order') // 'order' | 'payment' | 'done'
const method = ref('Cash')
const tendered = ref(null)
const lastOrder = ref(null)
const receiptWrap = ref(null)

const change = computed(() => (tendered.value ?? 0) - cartTotal.value)
const canConfirmPayment = computed(() => method.value === 'UPI' || (tendered.value ?? 0) >= cartTotal.value)
const quickAmounts = computed(() => {
  const total = cartTotal.value
  const rounded = [50, 100, 200, 500, 2000].map((note) => Math.ceil(total / note) * note)
  return [...new Set([total, ...rounded])].filter((amount) => amount >= total).slice(0, 5)
})

function startPayment() {
  if (!cart.value.length) return
  method.value = 'Cash'
  tendered.value = null
  step.value = 'payment'
}

function confirmPayment() {
  if (!canConfirmPayment.value) return
  const payment =
    method.value === 'Cash'
      ? { method: 'Cash', tendered: tendered.value, change: change.value }
      : { method: 'UPI', tendered: cartTotal.value, change: 0 }
  lastOrder.value = recordOrder({
    lines: cart.value,
    payment,
    cashier: user.value?.displayName || user.value?.email || null,
  })
  step.value = 'done'
}

const receiptOrder = computed(
  () =>
    lastOrder.value && {
      ...lastOrder.value,
      stallTitle: stall.value?.title,
      partner: stall.value?.ngo?.recorded ? stall.value.ngo.name : null,
      items: lastOrder.value.items,
    },
)

function newOrder() {
  cart.value = []
  lastOrder.value = null
  step.value = 'order'
  nextTick(() => searchInput.value?.focus())
}

function print() {
  window.addEventListener('afterprint', newOrder, { once: true })
  printReceipt(receiptWrap.value.querySelector('.receipt'))
}

const reprintOrder = ref(null)
const reprintWrap = ref(null)
function reprint(order) {
  reprintOrder.value = { ...order, stallTitle: stall.value?.title, partner: stall.value?.ngo?.recorded ? stall.value.ngo.name : null }
  nextTick(() => printReceipt(reprintWrap.value.querySelector('.receipt')))
}

function close() {
  const { orderCount, registerCash, upi } = totals.value
  const summary = `Close this register?\n\n${orderCount} orders · Cash ${formatMoney(registerCash)} · UPI ${formatMoney(upi)}\n\nThe next session starts again from ₹0.`
  if (!window.confirm(summary)) return
  closeSession()
  navigateTo('/admin/pos')
}

const time = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
</script>

<template>
  <div class="pos">
    <p v-if="!loaded" class="admin-empty">Loading…</p>
    <div v-else-if="!stall || !menu.length" class="admin-gate">
      <h1>{{ stall ? `${stall.title} has no menu yet` : 'No such stall' }}</h1>
      <p>The register needs a menu with selling prices.</p>
      <NuxtLink class="admin-button admin-button--primary" :to="stall ? `/admin/stall/${slug}` : '/admin/pos'">
        {{ stall ? 'Add a menu' : 'Back to the POS' }}
      </NuxtLink>
    </div>

    <template v-else>
      <header class="pos-header">
        <NuxtLink class="admin-back" to="/admin/pos"><ArrowLeft :size="16" :stroke-width="2.5" /> POS</NuxtLink>
        <div class="pos-header__title">
          <h1>{{ stall.title }}</h1>
          <span v-if="session">Register {{ session.code }} · open since {{ time(session.openedAt) }}</span>
        </div>
        <button class="admin-button" type="button" @click="close">Close register</button>
      </header>

      <dl class="pos-stats">
        <div class="pos-stats__primary"><dt>Register cash</dt><dd>{{ formatMoney(totals.registerCash) }}</dd></div>
        <div><dt>UPI</dt><dd>{{ formatMoney(totals.upi) }}</dd></div>
        <div><dt>Total sales</dt><dd>{{ formatMoney(totals.sales) }}</dd></div>
        <div><dt>Orders</dt><dd>{{ totals.orderCount }}</dd></div>
        <div><dt>Items sold</dt><dd>{{ totals.itemCount }}</dd></div>
        <div v-if="totals.profit != null"><dt>Profit</dt><dd>{{ formatMoney(totals.profit) }}</dd></div>
      </dl>

      <div class="pos-body">
        <section class="pos-items" aria-label="Menu">
          <div class="pos-search">
            <Search :size="18" :stroke-width="2.5" aria-hidden="true" />
            <input
              ref="searchInput"
              v-model="search"
              type="search"
              placeholder="Search the menu, Enter to add"
              aria-label="Search the menu"
              autofocus
              @keydown.enter.prevent="addFirstMatch"
              @keydown.esc="search = ''"
            />
          </div>
          <div class="pos-categories" role="tablist" aria-label="Category">
            <button
              v-for="option in categories"
              :key="option"
              type="button"
              role="tab"
              :aria-selected="category === option"
              @click="category = option"
            >
              {{ option }}
            </button>
          </div>
          <div class="pos-grid">
            <button
              v-for="item in visibleItems"
              :key="item.name"
              class="pos-item"
              type="button"
              :disabled="step !== 'order'"
              @click="addItem(item)"
            >
              <span class="pos-item__name">{{ item.name }}</span>
              <span class="pos-item__price">{{ formatMoney(item.price) }}</span>
              <span v-if="quantityIn(item)" class="pos-item__count" aria-label="in this order">{{ quantityIn(item) }}</span>
            </button>
            <p v-if="!visibleItems.length" class="admin-empty">No items match “{{ search }}”.</p>
          </div>
        </section>

        <aside class="pos-order" aria-live="polite">
          <template v-if="step === 'order'">
            <header class="pos-order__header">
              <h2>Order {{ nextNumber }}</h2>
              <button v-if="cart.length" class="admin-button admin-button--quiet" type="button" @click="cart = []">
                <Trash2 :size="16" :stroke-width="2.5" /> Clear
              </button>
            </header>
            <p v-if="!cart.length" class="pos-order__empty">Tap items to add them to the order.</p>
            <ul v-else class="pos-lines">
              <li v-for="line in cart" :key="line.name" class="pos-line">
                <span class="pos-line__name">{{ line.name }}<small>{{ formatMoney(line.unitPrice) }} each</small></span>
                <span class="pos-line__qty">
                  <button type="button" :aria-label="`One less ${line.name}`" @click="changeQuantity(line, -1)"><Minus :size="16" :stroke-width="2.5" /></button>
                  <strong>{{ line.quantity }}</strong>
                  <button type="button" :aria-label="`One more ${line.name}`" @click="changeQuantity(line, 1)"><Plus :size="16" :stroke-width="2.5" /></button>
                </span>
                <span class="pos-line__total">{{ formatMoney(orderLineTotal(line)) }}</span>
              </li>
            </ul>
            <footer class="pos-order__footer">
              <div class="pos-total"><span>{{ cartCount }} items</span><strong>{{ formatMoney(cartTotal) }}</strong></div>
              <button class="admin-button admin-button--primary pos-charge" type="button" :disabled="!cart.length" @click="startPayment">
                Confirm order · {{ formatMoney(cartTotal) }}
              </button>
            </footer>
          </template>

          <template v-else-if="step === 'payment'">
            <header class="pos-order__header">
              <h2>Payment · {{ nextNumber }}</h2>
              <button class="admin-button admin-button--quiet" type="button" @click="step = 'order'"><X :size="16" :stroke-width="2.5" /> Back</button>
            </header>
            <div class="pos-due"><span>Amount due</span><strong>{{ formatMoney(cartTotal) }}</strong></div>
            <div class="pos-methods" role="radiogroup" aria-label="Payment method">
              <button type="button" role="radio" :aria-checked="method === 'Cash'" @click="method = 'Cash'">
                <Banknote :size="22" :stroke-width="2.25" /> Cash
              </button>
              <button type="button" role="radio" :aria-checked="method === 'UPI'" @click="method = 'UPI'">
                <Smartphone :size="22" :stroke-width="2.25" /> UPI
              </button>
            </div>

            <div v-if="method === 'Cash'" class="pos-cash">
              <label class="admin-field">
                <span>Cash received</span>
                <input v-model.number="tendered" type="number" min="0" inputmode="numeric" placeholder="₹" @keydown.enter.prevent="confirmPayment" />
              </label>
              <div class="pos-quick">
                <button v-for="amount in quickAmounts" :key="amount" type="button" @click="tendered = amount">
                  {{ amount === cartTotal ? 'Exact' : formatMoney(amount) }}
                </button>
              </div>
              <p v-if="tendered != null" :class="['pos-change', { 'pos-change--short': change < 0 }]">
                {{ change < 0 ? `${formatMoney(-change)} short` : `Change ${formatMoney(change)}` }}
              </p>
            </div>
            <p v-else class="pos-upi">Check the payment has arrived on the stall's UPI before confirming.</p>

            <button class="admin-button admin-button--primary pos-charge" type="button" :disabled="!canConfirmPayment" @click="confirmPayment">
              <Check :size="18" :stroke-width="2.5" /> Confirm {{ method }} payment
            </button>
          </template>

          <template v-else-if="step === 'done' && receiptOrder">
            <header class="pos-order__header">
              <h2><Check :size="20" :stroke-width="2.75" /> Paid · {{ receiptOrder.number }}</h2>
            </header>
            <p v-if="receiptOrder.payment.change > 0" class="pos-change pos-change--big">Give change {{ formatMoney(receiptOrder.payment.change) }}</p>
            <div ref="receiptWrap" class="pos-receipt">
              <ReceiptTicket :order="receiptOrder" />
            </div>
            <div class="pos-done-actions">
              <button class="admin-button" type="button" @click="newOrder">New order</button>
              <button class="admin-button admin-button--primary pos-charge" type="button" @click="print">
                <Printer :size="18" :stroke-width="2.5" /> Print receipt
              </button>
            </div>
          </template>
        </aside>
      </div>

      <section v-if="orders.length" class="pos-history" aria-label="Orders this session">
        <h2>This session</h2>
        <ul>
          <li v-for="order in orders" :key="order.id">
            <strong>{{ order.number }}</strong>
            <span>{{ time(order.createdAt) }}</span>
            <span class="pos-history__items">{{ order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ') }}</span>
            <span>{{ order.payment.method }}</span>
            <strong>{{ formatMoney(order.total) }}</strong>
            <button class="admin-button admin-button--quiet" type="button" :aria-label="`Reprint ${order.number}`" @click="reprint(order)">
              <Printer :size="16" :stroke-width="2.5" />
            </button>
          </li>
        </ul>
      </section>

      <div ref="reprintWrap" class="receipt-offscreen" aria-hidden="true">
        <ReceiptTicket v-if="reprintOrder" :order="reprintOrder" />
      </div>
    </template>
  </div>
</template>
