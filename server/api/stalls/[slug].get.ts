export default defineEventHandler(async (event) => {
  const stall = await getPublishedStall(getRouterParam(event, 'slug')!)
  if (!stall) throw createError({ statusCode: 404, statusMessage: 'Stall not found' })
  return stall
})
