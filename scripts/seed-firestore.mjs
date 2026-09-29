// Seeds stalls and partners from scripts/seed/ and admins from ADMIN_EMAILS.
//   pnpm seed               local emulator
//   pnpm seed --production  real project (application default credentials)
// Existing documents are never overwritten.
import { readFile } from 'node:fs/promises'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseAdminEmails, seedAdmins, seedPartners, seedStalls } from './seed/seed-data.mjs'

const production = process.argv.includes('--production')
if (!production && !process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('FIRESTORE_EMULATOR_HOST is not set. Start the emulators, or pass --production.')
  process.exit(1)
}
if (production) delete process.env.FIRESTORE_EMULATOR_HOST

const projectId = process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'demo-vita'
const db = getFirestore(initializeApp({ projectId }))

const stalls = JSON.parse(await readFile(new URL('./seed/stalls.json', import.meta.url), 'utf8'))
const { created, kept } = await seedStalls(db, stalls)
console.log(`Stalls: created ${created}, kept ${kept} existing (${projectId})`)

const partners = JSON.parse(await readFile(new URL('./seed/partners.json', import.meta.url), 'utf8'))
const partnerResult = await seedPartners(db, partners)
console.log(`Partners: created ${partnerResult.created}, kept ${partnerResult.kept} existing`)

const adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS)
await seedAdmins(db, adminEmails)
console.log(`Admins: ${adminEmails.length ? adminEmails.join(', ') : 'none (set ADMIN_EMAILS)'}`)
