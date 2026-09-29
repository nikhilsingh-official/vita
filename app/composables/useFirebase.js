import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

let services

// Admin-only client. The persistent cache keeps the admin working offline.
export function useFirebase() {
  if (services) return services

  const { firebase, useEmulators } = useRuntimeConfig().public
  const app = getApps().length ? getApp() : initializeApp(firebase)
  const auth = getAuth(app)
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })

  if (useEmulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }

  services = { app, auth, db }
  return services
}
