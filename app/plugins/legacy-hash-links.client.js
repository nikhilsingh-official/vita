// Redirect old hash URLs (/#/stall/<slug>) to their real paths.
export default defineNuxtPlugin(() => {
  const { hash } = window.location
  if (hash.startsWith('#/')) window.location.replace(hash.slice(1))
})
