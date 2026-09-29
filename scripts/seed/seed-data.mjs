// Used by scripts/seed-firestore.mjs and server/utils/devSeed.ts.
// Only missing documents are created.
export async function seedStalls(db, stalls) {
  let created = 0
  for (const { slug, ...stall } of stalls) {
    const ref = db.collection('stalls').doc(slug)
    if ((await ref.get()).exists) continue
    await ref.create(stall)
    created += 1
  }
  return { created, kept: stalls.length - created }
}

// Partner ids are the slugified name, matching stall.ngo.name.
export async function seedPartners(db, partners) {
  let created = 0
  for (const { id, ...partner } of partners) {
    const ref = db.collection('partners').doc(id)
    if ((await ref.get()).exists) continue
    await ref.create(partner)
    created += 1
  }
  return { created, kept: partners.length - created }
}

export function parseAdminEmails(value = '') {
  return value.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
}

export async function seedAdmins(db, emails) {
  for (const email of emails) {
    await db.collection('admins').doc(email).set({ addedAt: new Date() }, { merge: true })
  }
}
