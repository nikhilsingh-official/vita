import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

export function useFirestore() {
  const app = getApps()[0] ?? initializeApp({ projectId: useRuntimeConfig().public.firebase.projectId })
  return getFirestore(app)
}

// Matches slugify() in the admin.
export const partnerId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export async function loadPartners(db: FirebaseFirestore.Firestore) {
  const snapshot = await db.collection('partners').get()
  return new Map(snapshot.docs.map((doc) => [doc.id, doc.data()]))
}

export function toPublicStall(doc: FirebaseFirestore.DocumentSnapshot, partners: Map<string, FirebaseFirestore.DocumentData>) {
  const { published: _published, updatedAt: _updatedAt, ...stall } = doc.data() ?? {}
  const partner = stall.ngo?.recorded ? partners.get(partnerId(stall.ngo.name)) : undefined
  return {
    ...stall,
    slug: doc.id,
    ngo: { name: stall.ngo?.name, recorded: Boolean(stall.ngo?.recorded), description: partner?.description ?? null },
  }
}
