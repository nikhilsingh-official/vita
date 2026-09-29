export default defineEventHandler(async (event) => {
  const db = useFirestore()
  const ref = db.collection('stalls').doc(getRouterParam(event, 'slug')!)

  let doc = await ref.get()
  if (!doc.exists && (await seedEmptyEmulator(db))) doc = await ref.get()

  if (!doc.exists || doc.data()?.published !== true) {
    throw createError({ statusCode: 404, statusMessage: 'Stall not found' })
  }
  return toPublicStall(doc, await loadPartners(db))
})
