const isStorageAvailable = () => {
  return typeof localStorage !== 'undefined'
}

export const safeRead = (key, fallback = null) => {
  if (!isStorageAvailable()) return fallback

  try {
    const stored = localStorage.getItem(key)
    if (stored === null) return fallback

    return JSON.parse(stored)
  } catch {
    return fallback
  }
}

export const safeWrite = (key, value) => {
  if (!isStorageAvailable()) return false

  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const getUserScopedCollection = (collectionKey, userId) => {
  if (!userId) return []

  const items = safeRead(collectionKey, [])
  if (!Array.isArray(items)) return []

  return items.filter((item) => item?.user_id === userId)
}

export const setUserScopedCollection = (collectionKey, userId, items) => {
  if (!userId || !Array.isArray(items)) return false

  const existingItems = safeRead(collectionKey, [])
  const existingCollection = Array.isArray(existingItems) ? existingItems : []
  const otherUsersItems = existingCollection.filter(
    (item) => item?.user_id !== userId
  )

  return safeWrite(collectionKey, [...otherUsersItems, ...items])
}