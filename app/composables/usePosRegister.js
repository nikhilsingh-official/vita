import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore'

// A session is one device selling for one stall. It is kept in localStorage;
// totals are summed from its orders in stalls/{slug}/orders.

const REGISTER_CODE_KEY = 'vita.pos.registerCode'
const sessionKey = (slug) => `vita.pos.session.${slug}`
// Order numbers continue across sessions; only the totals reset.
const sequenceKey = (slug) => `vita.pos.nextSequence.${slug}`

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}

function writeStorage(key, value) {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable (private mode, quota): keep going without it.
  }
}

// One letter per device keeps order numbers unique across tills.
function registerCode() {
  let code = readStorage(REGISTER_CODE_KEY)
  if (!code) {
    code = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    writeStorage(REGISTER_CODE_KEY, code)
  }
  return code
}

export function orderLineTotal(line) {
  return line.unitPrice * line.quantity
}

export function usePosRegister(slug) {
  const { db } = useFirebase()
  const ordersRef = collection(db, 'stalls', slug, 'orders')

  const session = ref(readStorage(sessionKey(slug)))
  const orders = ref([])
  let unsubscribe

  function listen() {
    unsubscribe?.()
    orders.value = []
    if (!session.value) return
    unsubscribe = onSnapshot(
      query(ordersRef, where('sessionId', '==', session.value.id)),
      { includeMetadataChanges: true },
      (snapshot) => {
        orders.value = snapshot.docs
          .map((orderDoc) => orderDoc.data())
          .sort((a, b) => b.sequence - a.sequence)
        setPendingWrites('orders', snapshot.metadata.hasPendingWrites)
      },
    )
  }

  function saveSession(value) {
    session.value = value
    writeStorage(sessionKey(slug), value)
  }

  function openSession() {
    saveSession({
      id: crypto.randomUUID(),
      code: registerCode(),
      openedAt: new Date().toISOString(),
      nextSequence: readStorage(sequenceKey(slug)) ?? 1,
    })
    listen()
  }

  function closeSession() {
    saveSession(null)
    listen()
  }

  const totals = computed(() => {
    const sum = (list, pick) => list.reduce((total, order) => total + pick(order), 0)
    const cash = orders.value.filter((order) => order.payment.method === 'Cash')
    const upi = orders.value.filter((order) => order.payment.method === 'UPI')
    const costed = orders.value.filter((order) => order.costTotal != null)
    return {
      orderCount: orders.value.length,
      itemCount: sum(orders.value, (order) => order.items.reduce((count, item) => count + item.quantity, 0)),
      registerCash: sum(cash, (order) => order.total),
      upi: sum(upi, (order) => order.total),
      sales: sum(orders.value, (order) => order.total),
      profit: costed.length ? sum(costed, (order) => order.total - order.costTotal) : null,
    }
  })

  // Not awaited: offline, the write only resolves once it syncs.
  function recordOrder({ lines, payment, cashier }) {
    const sequence = session.value.nextSequence
    const items = lines.map((line) => ({
      name: line.name,
      category: line.category,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      costPrice: line.costPrice ?? null,
    }))
    const total = items.reduce((sum, item) => sum + orderLineTotal(item), 0)
    const everyItemCosted = items.every((item) => item.costPrice != null)
    const orderRef = doc(ordersRef)
    const order = {
      id: orderRef.id,
      number: `${session.value.code}-${String(sequence).padStart(3, '0')}`,
      sequence,
      sessionId: session.value.id,
      items,
      total,
      costTotal: everyItemCosted ? items.reduce((sum, item) => sum + item.costPrice * item.quantity, 0) : null,
      payment,
      cashier,
      createdAt: new Date().toISOString(),
    }

    saveSession({ ...session.value, nextSequence: sequence + 1 })
    writeStorage(sequenceKey(slug), sequence + 1)
    setDoc(orderRef, { ...order, syncedAt: serverTimestamp() }).catch((error) =>
      console.error('[pos] order write failed', error),
    )
    return order
  }

  onMounted(listen)
  onBeforeUnmount(() => {
    unsubscribe?.()
    setPendingWrites('orders', false)
  })

  return { session: readonly(session), orders: readonly(orders), totals, openSession, closeSession, recordOrder }
}
