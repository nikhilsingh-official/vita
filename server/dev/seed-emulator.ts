import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import seedPartnersData from '~~/scripts/seed/partners.json'
import seedStallsData from '~~/scripts/seed/stalls.json'
import { parseAdminEmails, seedAdmins, seedPartners, seedStalls } from '~~/scripts/seed/seed-data.mjs'

// Registered only in development (nuxt.config $development): fills an empty
// Firestore emulator from the seed data before a request reads it.
export default defineNitroPlugin((nitroApp) => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) return

  nitroApp.hooks.hook('request', async (event) => {
    if (!event.path.startsWith('/api/')) return
    const app = getApps()[0] ?? initializeApp({ projectId: useRuntimeConfig().public.firebase.projectId })
    const db = getFirestore(app)
    if (!(await db.collection('stalls').limit(1).get()).empty) return

    const { created } = await seedStalls(db, seedStallsData)
    await seedPartners(db, seedPartnersData)
    await seedAdmins(db, parseAdminEmails(process.env.ADMIN_EMAILS))
    console.info(`[dev] Seeded the empty Firestore emulator with ${created} stalls.`)
  })
})
