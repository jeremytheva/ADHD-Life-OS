export const createAuthSessionController = ({ auth, isActive, updateState, clearAuthState, logError = console.error }) => {
  let verificationId = 0
  let verificationStarted = false

  const verifySession = async () => {
    const currentVerificationId = ++verificationId
    updateState({ status: 'initializing', error: null })

    try {
      const user = await auth.getCurrentUser()
      if (!isActive() || currentVerificationId !== verificationId) return null

      updateState({ user, status: user ? 'authenticated' : 'anonymous' })
      return user
    } catch (error) {
      if (!isActive() || currentVerificationId !== verificationId) return null

      clearAuthState()
      if (auth.isUnauthorizedError(error)) {
        updateState({ status: 'anonymous' })
        return null
      }

      logError('Error checking auth state:', error)
      updateState({ error, status: 'error' })
      return null
    }
  }

  return {
    verifySession,
    startVerification: () => {
      if (verificationStarted) return
      verificationStarted = true
      return verifySession()
    },
    handleAuthStateChange: (_event, session) => {
      verificationId += 1
      const user = session?.user ?? null
      updateState({ user, error: null, status: user ? 'authenticated' : 'anonymous' })
    }
  }
}
