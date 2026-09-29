export function usePublishedStalls() {
  return useFetch('/api/stalls', { key: 'published-stalls', default: () => [] })
}

export function usePublishedStall(slug) {
  return useFetch(() => `/api/stalls/${slug.value}`, { key: `stall-${slug.value}` })
}

export function pickFeaturedStall(stalls) {
  return (
    stalls.find((stall) => stall.pinned) ??
    stalls.find((stall) => stall.status === 'upcoming') ??
    stalls.find((stall) => stall.status === 'completed') ??
    null
  )
}
