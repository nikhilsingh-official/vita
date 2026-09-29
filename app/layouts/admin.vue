<script setup>
import { CloudOff, LogOut, RefreshCw, Check } from '@lucide/vue'

const { state, user, signIn, signOut } = useAdminSession()
const { hasPendingWrites } = useAdminSyncState()
const online = ref(navigator.onLine)
const signInError = ref('')

function updateOnline() {
  online.value = navigator.onLine
}
onMounted(() => {
  window.addEventListener('online', updateOnline)
  window.addEventListener('offline', updateOnline)
})
onBeforeUnmount(() => {
  window.removeEventListener('online', updateOnline)
  window.removeEventListener('offline', updateOnline)
})

const syncStatus = computed(() => {
  if (!online.value) return { icon: CloudOff, text: hasPendingWrites.value ? 'Offline · changes saved on this device' : 'Offline', tone: 'warn' }
  if (hasPendingWrites.value) return { icon: RefreshCw, text: 'Syncing…', tone: 'busy' }
  return { icon: Check, text: 'All changes saved', tone: 'ok' }
})

async function handleSignIn() {
  signInError.value = ''
  try {
    await signIn()
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user') signInError.value = 'Sign-in failed. Try again.'
  }
}

useHead({ title: 'Admin | Project Vita', meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <div class="admin">
    <header class="admin-bar">
      <NuxtLink class="admin-bar__brand" to="/admin">Project Vita <span>Admin</span></NuxtLink>
      <template v-if="state === 'admin'">
        <nav class="admin-nav" aria-label="Admin sections">
          <NuxtLink to="/admin" :class="{ active: $route.path === '/admin' || $route.path.startsWith('/admin/stall') }">Stalls</NuxtLink>
          <NuxtLink to="/admin/partners" active-class="active">Partners</NuxtLink>
          <NuxtLink to="/admin/pos" active-class="active">POS</NuxtLink>
        </nav>
        <span :class="['admin-sync', `admin-sync--${syncStatus.tone}`]" role="status">
          <component :is="syncStatus.icon" :size="16" :stroke-width="2.5" /> {{ syncStatus.text }}
        </span>
        <button class="admin-button admin-button--quiet" type="button" @click="signOut">
          <LogOut :size="16" :stroke-width="2.5" /> Sign out
        </button>
      </template>
    </header>

    <main class="admin-main">
      <p v-if="state === 'loading'" class="admin-empty">Loading…</p>

      <section v-else-if="state === 'signed-out'" class="admin-gate">
        <h1>Sign in to manage stalls</h1>
        <p>Use the Google account the team added to the admin list.</p>
        <button class="admin-button admin-button--primary" type="button" @click="handleSignIn">Sign in with Google</button>
        <p v-if="signInError" class="admin-error" role="alert">{{ signInError }}</p>
      </section>

      <section v-else-if="state === 'not-admin'" class="admin-gate">
        <h1>This account isn't on the admin list</h1>
        <p>{{ user?.email }} can't manage stalls. Ask someone on the team to add it.</p>
        <button class="admin-button" type="button" @click="signOut">Use a different account</button>
      </section>

      <slot v-else />
    </main>
  </div>
</template>
