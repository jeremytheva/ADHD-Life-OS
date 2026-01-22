/**
 * Onboarding Flow - Type Definitions
 * User preferences and configuration for personalized ADHD support
 */

export type LifeRole = 'work' | 'home' | 'parent' | 'student' | 'caregiver' | 'creative' | 'other'

export type UIStyle = 'visual' | 'minimal' | 'gamified'

export type ModuleName = 
  | 'tasks'
  | 'routines'
  | 'housework'
  | 'timeline'
  | 'calendar'
  | 'habits'
  | 'inbox'

export interface LifeRoleConfig {
  role: LifeRole
  label: string
  description: string
  icon: string
  isSelected: boolean
}

export interface ModuleConfig {
  id: ModuleName
  name: string
  description: string
  benefits: string[]
  icon: string
  isEnabled: boolean
  isPremium?: boolean
}

export interface UIStyleConfig {
  id: UIStyle
  name: string
  description: string
  preview: string
  features: string[]
}

export interface OnboardingProgress {
  currentStep: number
  totalSteps: number
  completedSteps: string[]
  isComplete: boolean
}

export interface OnboardingData {
  // Step 1: Life Roles
  selectedRoles: LifeRole[]
  customRoles?: string[]
  
  // Step 2: Enabled Modules
  enabledModules: ModuleName[]
  
  // Step 3: UI Style
  uiStyle: UIStyle
  
  // Step 4: ADHD-Specific Preferences
  preferences: {
    showEncouragement: boolean
    enableSoundEffects: boolean
    useTimers: boolean
    breakReminders: boolean
    celebrateSmallWins: boolean
  }
  
  // Progress tracking
  progress: OnboardingProgress
  
  // Completion
  completedAt?: string
  skippedSteps?: string[]
}

export interface OnboardingStepProps {
  onNext: (data: Partial<OnboardingData>) => void
  onBack: () => void
  onSkip?: () => void
  currentData: OnboardingData
  stepNumber: number
  totalSteps: number
}