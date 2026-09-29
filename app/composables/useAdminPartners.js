import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'

const partnerDocs = ref(new Map())
let unsubscribe

// Includes partners named on a stall that have no partners/ document yet.
export function useAdminPartners() {
  const { db } = useFirebase()
  const { stalls } = useAdminStalls()

  if (!unsubscribe) {
    unsubscribe = onSnapshot(
      collection(db, 'partners'),
      (snapshot) => {
        partnerDocs.value = new Map(snapshot.docs.map((partnerDoc) => [partnerDoc.id, partnerDoc.data()]))
      },
      (error) => {
        console.error('[admin] partner listener stopped', error)
        unsubscribe = null
      },
    )
  }

  const partners = computed(() => {
    const byId = new Map()
    for (const stall of stalls.value) {
      if (!stall.ngo?.recorded) continue
      const id = slugify(stall.ngo.name)
      const entry = byId.get(id) ?? { id, name: stall.ngo.name, stalls: [] }
      entry.stalls.push(stall.title)
      byId.set(id, entry)
    }
    for (const [id, data] of partnerDocs.value) {
      byId.set(id, { stalls: [], ...byId.get(id), id, name: data.name, description: data.description ?? '' })
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
  })

  function savePartner(id, name, description) {
    setDoc(
      doc(db, 'partners', id),
      { name, description: description.trim() || null, updatedAt: serverTimestamp() },
      { merge: true },
    ).catch((error) => console.error('[admin] write failed', error))
  }

  return { partners, savePartner }
}
