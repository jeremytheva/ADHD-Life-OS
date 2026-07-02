import { safeRead, safeWrite } from './storageService'

const CURRENT_USER_KEY = 'adhd_lifeos_current_user'

export const getCurrentUser = () => {
  const user = safeRead(CURRENT_USER_KEY, null)
  return user && typeof user === 'object' ? user : null
}

export const getCurrentUserId = () => {
  return getCurrentUser()?.id || null
}

export const setCurrentUser = (user) => {
  return safeWrite(CURRENT_USER_KEY, user)
}
