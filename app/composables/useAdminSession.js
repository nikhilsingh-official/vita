import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

// 'loading' → 'signed-out' | 'not-admin' | 'admin'
const state = ref('loading')
const user = ref(null)
let listening = false

export function useAdminSession() {
  const { auth, db } = useFirebase()

  if (!listening) {
    listening = true
    onAuthStateChanged(auth, async (currentUser) => {
      user.value = currentUser
      if (!currentUser) {
        state.value = 'signed-out'
        return
      }
      const allowed = await getDoc(doc(db, 'admins', currentUser.email.toLowerCase())).catch(() => null)
      state.value = allowed?.exists() ? 'admin' : 'not-admin'
    })
  }

  return {
    state: readonly(state),
    user: readonly(user),
    signIn: () => signInWithPopup(auth, new GoogleAuthProvider()),
    signOut: () => signOut(auth),
  }
}
