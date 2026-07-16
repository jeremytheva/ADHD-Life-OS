// Authentication state is intentionally memory-only. The NoCodeBackend session
// cookie is authoritative, and no identity or domain data is persisted locally.
let currentUserCache = null
const normalizeUser = (user) => (user && typeof user === 'object' ? user : null)
export const getCurrentUser = () => currentUserCache
export const getCurrentUserId = () => getCurrentUser()?.id || null
export const setCurrentUser = (user) => { currentUserCache = normalizeUser(user) }
export const clearCurrentUser = () => setCurrentUser(null)
export const getDatabaseUserId = () => getCurrentUserId()
export const clearAuthenticatedUserCache = () => clearCurrentUser()
