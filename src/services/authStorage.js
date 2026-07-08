import { safeRemove, safeRead, safeWrite } from './storageService'

export const CURRENT_USER_KEY = 'adhd_lifeos_current_user'

let currentUserCache = null

const normalizeUser = (user) => (user && typeof user === 'object' ? user : null)

export const getCurrentUser = () => {
  currentUserCache = normalizeUser(currentUserCache) || normalizeUser(safeRead(CURRENT_USER_KEY, null))
  return currentUserCache
}

export const getCurrentUserId = () => getCurrentUser()?.id || null

export const setCurrentUser = (user) => {
  currentUserCache = normalizeUser(user)

  if (!currentUserCache) {
    return safeRemove(CURRENT_USER_KEY)
  }

  return safeWrite(CURRENT_USER_KEY, currentUserCache)
}

export const clearCurrentUser = () => setCurrentUser(null)

// Supabase rows intentionally keep using the authenticated NoCodeBackend user id
// stored above. The NoCodeBackend session is the source of truth for this app's
// identity; adding a Supabase-user mapping table would only be needed if the app
// later authenticates users with Supabase Auth directly.
export const getDatabaseUserId = () => getCurrentUserId()

export const clearAuthenticatedUserCache = () => {
  // Keep user-authored/offline mock collections intact; only clear the cached
  // authenticated-user pointer so a signed-out browser cannot resolve stale ids.
  return clearCurrentUser()
}
