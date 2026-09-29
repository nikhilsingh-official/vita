export default defineEventHandler(async () => {
  const db = useFirestore()
  const published = () => db.collection('stalls').where('published', '==', true).get()

  let snapshot = await published()
  if (snapshot.empty && (await seedEmptyEmulator(db))) snapshot = await published()

  const partners = await loadPartners(db)
  return snapshot.docs.map((doc) => toPublicStall(doc, partners)).sort((a, b) => b.sortOrder - a.sortOrder)
})
