// Onboarding progress is a per-user draft. User configuration is persisted in
// the canonical preferences repository once onboarding is completed.
import { getCurrentUser, getCurrentUserId } from './authStorage'
import { safeRead, safeWrite } from './storageService'
import { onboardingDataSchema } from '../domains/schemas'
import { getUserPreferences, updateUserPreferences } from '../domain/preferences/repository'

const ONBOARDING_STORAGE_KEY = 'adhd_lifeos_onboarding'
export const ONBOARDING_TOTAL_STEPS = 6

const defaultOnboardingData = () => ({
  selectedRoles: [],
  customRoles: [],
  enabledModules: ['tasks', 'routines'],
  uiStyle: 'visual',
  preferences: {
    showEncouragement: true,
    enableSoundEffects: false,
    useTimers: true,
    breakReminders: true,
    celebrateSmallWins: true
  },
  progress: { currentStep: 0, totalSteps: ONBOARDING_TOTAL_STEPS, completedSteps: [], isComplete: false }
})

export const normalizeOnboardingData = (data = {}) => {
  const defaults = defaultOnboardingData()
  const candidate = { ...defaults, ...data, progress: { ...defaults.progress, ...data.progress } }
  const maximumStep = candidate.progress.isComplete ? ONBOARDING_TOTAL_STEPS : ONBOARDING_TOTAL_STEPS - 1
  const requestedStep = Number(candidate.progress.currentStep)
  return {
    ...candidate,
    progress: {
      ...candidate.progress,
      currentStep: Number.isFinite(requestedStep) ? Math.min(maximumStep, Math.max(0, Math.trunc(requestedStep))) : 0,
      totalSteps: ONBOARDING_TOTAL_STEPS,
      completedSteps: [...new Set(Array.isArray(candidate.progress.completedSteps) ? candidate.progress.completedSteps : [])]
    }
  }
}

const getStoredOnboarding = () => {
  const stored = safeRead(ONBOARDING_STORAGE_KEY, {})
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {}
  return Object.fromEntries(Object.entries(stored)
    .map(([userId, data]) => [userId, normalizeOnboardingData(data)])
    .filter(([, data]) => onboardingDataSchema.safeParse(data).success))
}

const setStoredOnboarding = (data) => {
  const valid = Object.fromEntries(Object.entries(data)
    .map(([userId, value]) => [userId, normalizeOnboardingData(value)])
    .filter(([, value]) => onboardingDataSchema.safeParse(value).success))
  safeWrite(ONBOARDING_STORAGE_KEY, valid)
}

const toPreferenceUpdates = (data) => ({
  enabled_modules: data.enabledModules,
  onboarding_configuration: {
    selected_roles: data.selectedRoles,
    custom_roles: data.customRoles,
    ui_style: data.uiStyle,
    adhd_preferences: data.preferences
  }
})

export const onboardingService = {
  hasCompletedOnboarding() {
    const userId = getCurrentUserId()
    return userId ? getStoredOnboarding()[userId]?.progress?.isComplete || false : false
  },

  getOnboardingData() {
    const userId = getCurrentUserId()
    return userId ? (getStoredOnboarding()[userId] || this.getDefaultOnboardingData()) : this.getDefaultOnboardingData()
  },

  getDefaultOnboardingData() {
    return defaultOnboardingData()
  },

  saveProgress(data) {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('No user logged in')
    const allOnboarding = getStoredOnboarding()
    const record = normalizeOnboardingData({ ...allOnboarding[userId], ...data, updatedAt: new Date().toISOString() })
    const parsed = onboardingDataSchema.safeParse(record)
    if (!parsed.success) throw new Error('Invalid onboarding preferences.')
    allOnboarding[userId] = parsed.data
    setStoredOnboarding(allOnboarding)
    return parsed.data
  },

  async completeOnboarding(finalData) {
    const record = this.saveProgress({
      ...finalData,
      progress: { ...finalData.progress, currentStep: ONBOARDING_TOTAL_STEPS, isComplete: true },
      completedAt: new Date().toISOString()
    })
    await this.applyPreferences(record)
    return record
  },

  async applyPreferences(onboardingData) {
    const user = getCurrentUser()
    if (!user) throw new Error('No user logged in')
    return updateUserPreferences(user, toPreferenceUpdates(onboardingData))
  },

  async getAppliedOnboardingPreferences() {
    const user = getCurrentUser()
    if (!user) return null
    return getUserPreferences(user)
  },

  resetOnboarding() {
    const userId = getCurrentUserId()
    if (!userId) return
    const allOnboarding = getStoredOnboarding()
    delete allOnboarding[userId]
    setStoredOnboarding(allOnboarding)
  },

  async skipOnboarding() {
    return this.completeOnboarding({ ...this.getDefaultOnboardingData(), skippedSteps: ['all'] })
  }
}
