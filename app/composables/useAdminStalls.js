import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'

const stalls = ref([])
const loaded = ref(false)

// Unsynced writes per listener (stalls, orders), for the sync status.
const pendingWrites = reactive({})
const hasPendingWrites = computed(() => Object.values(pendingWrites).some(Boolean))

export function setPendingWrites(source, pending) {
  pendingWrites[source] = pending
}
let unsubscribe

export function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// Not awaited: offline, a write only resolves once it syncs.
function write(promise) {
  promise.catch((error) => console.error('[admin] write failed', error))
}

export function useAdminSyncState() {
  return { hasPendingWrites }
}

// Admin pages only: the rules reject a full listing for non-admins.
export function useAdminStalls() {
  const { db } = useFirebase()
  const stallRef = (slug) => doc(db, 'stalls', slug)

  if (!unsubscribe) {
    unsubscribe = onSnapshot(
      collection(db, 'stalls'),
      { includeMetadataChanges: true },
      (snapshot) => {
        stalls.value = snapshot.docs
          .map((stallDoc) => ({ ...stallDoc.data(), slug: stallDoc.id }))
          .sort((a, b) => b.sortOrder - a.sortOrder)
        setPendingWrites('stalls', snapshot.metadata.hasPendingWrites)
        loaded.value = true
      },
      (error) => {
        console.error('[admin] stall listener stopped', error)
        unsubscribe = null
      },
    )
  }

  function setPublished(slug, published) {
    const changes = published ? { published } : { published, pinned: false }
    write(updateDoc(stallRef(slug), { ...changes, updatedAt: serverTimestamp() }))
  }

  // At most one stall is pinned.
  function setPinned(slug, pinned) {
    const batch = writeBatch(db)
    for (const stall of stalls.value) {
      if (stall.pinned && stall.slug !== slug) batch.update(stallRef(stall.slug), { pinned: false })
    }
    batch.update(stallRef(slug), { pinned, updatedAt: serverTimestamp() })
    write(batch.commit())
  }

  function createStall(title) {
    const slug = slugify(title)
    const sortOrder = Math.max(0, ...stalls.value.map((stall) => stall.sortOrder)) + 1
    write(
      setDoc(stallRef(slug), {
        title,
        status: 'upcoming',
        published: false,
        pinned: false,
        sortOrder,
        date: String(new Date().getFullYear()),
        story: '',
        ngo: { name: 'Partner not recorded', recorded: false },
        impact: { amountRaised: null, expenses: null, platesServed: null, itemsBasis: null },
        menu: [],
        gallery: [],
        updatedAt: serverTimestamp(),
      }),
    )
    return slug
  }

  function saveStall(slug, fields) {
    write(updateDoc(stallRef(slug), { ...fields, updatedAt: serverTimestamp() }))
  }

  return {
    stalls: readonly(stalls),
    loaded: readonly(loaded),
    setPublished,
    setPinned,
    createStall,
    saveStall,
  }
}
