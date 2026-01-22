// Onboarding Service
// Manages user onboarding flow and saves preferences

const ONBOARDING_STORAGE_KEY = 'adhd_lifeos_onboarding'

// Helper to get current user ID
const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('adhd_lifeos_current_user'))
    return user?.id || null
  } catch {
    return null
  }
}

// Get stored onboarding data
const getStoredOnboarding = () => {
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Set stored onboarding data
const setStoredOnboarding = (data) => {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data))
}

export const onboardingService = {
  // Check if user has completed onboarding
  hasCompletedOnboarding() {
    const userId = getCurrentUserId()
    if (!userId) return false
    
    const allOnboarding = getStoredOnboarding()
    const userOnboarding = allOnboarding[userId]
    
    return userOnboarding?.progress?.isComplete || false
  },

  // Get user's onboarding data
  getOnboardingData() {
    const userId = getCurrentUserId()
    if (!userId) return null
    
    const allOnboarding = getStoredOnboarding()
    return allOnboarding[userId] || this.getDefaultOnboardingData()
  },

  // Get default onboarding data
  getDefaultOnboardingData() {
    return {
      selectedRoles: [],
      customRoles: [],
      enabledModules: ['tasks', 'routines'], // Default enabled
      uiStyle: 'visual',
      preferences: {
        showEncouragement: true,
        enableSoundEffects: false,
        useTimers: true,
        breakReminders: true,
        celebrateSmallWins: true
      },
      progress: {
        currentStep: 1,
        totalSteps: 4,
        completedSteps: [],
        isComplete: false
      }
    }
  },

  // Save onboarding progress
  saveProgress(data) {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('No user logged in')
    
    const allOnboarding = getStoredOnboarding()
    allOnboarding[userId] = {
      ...allOnboarding[userId],
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    setStoredOnboarding(allOnboarding)
    return allOnboarding[userId]
  },

  // Complete onboarding
  completeOnboarding(finalData) {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('No user logged in')
    
    const allOnboarding = getStoredOnboarding()
    allOnboarding[userId] = {
      ...allOnboarding[userId],
      ...finalData,
      progress: {
        ...finalData.progress,
        isComplete: true
      },
      completedAt: new Date().toISOString()
    }
    
    setStoredOnboarding(allOnboarding)
    
    // Apply preferences to user account
    this.applyPreferences(allOnboarding[userId])
    
    return allOnboarding[userId]
  },

  // Apply onboarding preferences to user account
  applyPreferences(onboardingData) {
    const userId = getCurrentUserId()
    if (!userId) return
    
    // Store preferences for app-wide use
    const prefsKey = 'adhd_lifeos_app_preferences'
    const existingPrefs = JSON.parse(localStorage.getItem(prefsKey) || '{}')
    
    existingPrefs[userId] = {
      roles: onboardingData.selectedRoles,
      customRoles: onboardingData.customRoles,
      enabledModules: onboardingData.enabledModules,
      uiStyle: onboardingData.uiStyle,
      adhdPreferences: onboardingData.preferences,
      appliedAt: new Date().toISOString()
    }
    
    localStorage.setItem(prefsKey, JSON.stringify(existingPrefs))
  },

  // Get user's applied preferences
  getUserPreferences() {
    const userId = getCurrentUserId()
    if (!userId) return null
    
    const prefsKey = 'adhd_lifeos_app_preferences'
    const allPrefs = JSON.parse(localStorage.getItem(prefsKey) || '{}')
    
    return allPrefs[userId] || null
  },

  // Reset onboarding (for re-running)
  resetOnboarding() {
    const userId = getCurrentUserId()
    if (!userId) return
    
    const allOnboarding = getStoredOnboarding()
    delete allOnboarding[userId]
    setStoredOnboarding(allOnboarding)
  },

  // Skip onboarding (use defaults)
  skipOnboarding() {
    const defaultData = this.getDefaultOnboardingData()
    return this.completeOnboarding({
      ...defaultData,
      skippedSteps: ['all']
    })
  }
}