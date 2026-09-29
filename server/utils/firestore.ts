import { getApps, initializeApp } from 'firebase/app'
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore/lite'

// Reads use the public web SDK, so no service account is needed on any host;
// firestore.rules allow public reads of published stalls and partners.
let db: Firestore | undefined

function publicFirestore() {
  if (db) return db
  const { firebase, useEmulators } = useRuntimeConfig().public
  const app = getApps().find((existing) => existing.name === 'server') ?? initializeApp(firebase, 'server')
  db = getFirestore(app)
  if (useEmulators) connectFirestoreEmulator(db, '127.0.0.1', 8080)
  return db
}

// Matches slugify() in the admin.
export const partnerId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function loadPartners() {
  const snapshot = await getDocs(collection(publicFirestore(), 'partners'))
  return new Map(snapshot.docs.map((partner) => [partner.id, partner.data()]))
}

function toPublicStall(slug: string, data: DocumentData, partners: Map<string, DocumentData>) {
  const { published: _published, updatedAt: _updatedAt, ...stall } = data
  const partner = stall.ngo?.recorded ? partners.get(partnerId(stall.ngo.name)) : undefined
  return {
    ...stall,
    slug,
    ngo: { name: stall.ngo?.name, recorded: Boolean(stall.ngo?.recorded), description: partner?.description ?? null },
  }
}

export async function listPublishedStalls() {
  const [snapshot, partners] = await Promise.all([
    getDocs(query(collection(publicFirestore(), 'stalls'), where('published', '==', true))),
    loadPartners(),
  ])
  return snapshot.docs
    .map((stall) => toPublicStall(stall.id, stall.data(), partners))
    .sort((a, b) => b.sortOrder - a.sortOrder)
}

// Null when missing or unpublished (the rules deny reading unpublished stalls).
export async function getPublishedStall(slug: string) {
  try {
    const [snapshot, partners] = await Promise.all([getDoc(doc(publicFirestore(), 'stalls', slug)), loadPartners()])
    const data = snapshot.data()
    return data?.published === true ? toPublicStall(slug, data, partners) : null
  } catch (error) {
    if ((error as { code?: string }).code === 'permission-denied') return null
    throw error
  }
}
