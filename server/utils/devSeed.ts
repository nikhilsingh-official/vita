import seedPartnersData from '~~/scripts/seed/partners.json'
import seedStallsData from '~~/scripts/seed/stalls.json'
import { parseAdminEmails, seedAdmins, seedPartners, seedStalls } from '~~/scripts/seed/seed-data.mjs'

// Dev only: fill an empty emulator from the seed data.
export async function seedEmptyEmulator(db: FirebaseFirestore.Firestore) {
  if (!import.meta.dev || !process.env.FIRESTORE_EMULATOR_HOST) return false
  const existing = await db.collection('stalls').limit(1).get()
  if (!existing.empty) return false

  const { created } = await seedStalls(db, seedStallsData)
  await seedPartners(db, seedPartnersData)
  await seedAdmins(db, parseAdminEmails(process.env.ADMIN_EMAILS))
  console.info(`[dev] Seeded the empty Firestore emulator with ${created} stalls.`)
  return true
}
