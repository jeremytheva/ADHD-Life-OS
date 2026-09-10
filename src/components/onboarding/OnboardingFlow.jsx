import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import LoadErrorState from '../../common/LoadErrorState'
import OperationErrorState from '../../common/OperationErrorState'
import useModalDialog from '../../common/useModalDialog'
import { onboardingService } from '../../services/onboardingService'
import WelcomeStep from './steps/WelcomeStep'
import LifeRolesStep from './steps/LifeRolesStep'
import ModulesStep from './steps/ModulesStep'
import UIStyleStep from './steps/UIStyleStep'
import PreferencesStep from './steps/PreferencesStep'
import CompletionStep from './steps/CompletionStep'

const { FiX, FiChevronLeft, FiChevronRight } = FiIcons

// Keep the rendered flow as the source of truth for the number of screens a
// person sees. Persisted data is normalized by onboardingService before it is
// used here, so an older record cannot select a screen outside this flow.
const ONBOARDING_FLOW = [
  { id: 'welcome', component: WelcomeStep, title: 'Welcome!' },
  { id: 'roles', component: LifeRolesStep, title: 'Your Life Roles' },
  { id: 'modules', component: ModulesStep, title: 'Choose Your Tools' },
  { id: 'style', component: UIStyleStep, title: 'Pick Your Style' },
  { id: 'preferences', component: PreferencesStep, title: 'Fine-Tune Experience' },
  { id: 'completion', component: CompletionStep, title: 'You\'re All Set!' }
]

const OnboardingFlow = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState(onboardingService.getDefaultOnboardingData())
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [operationError, setOperationError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const totalSteps = ONBOARDING_FLOW.length
  const dialogRef = useModalDialog()
  const stepTitleRef = useRef(null)
  const previousStepRef = useRef(currentStep)
  const mountedRef = useRef(true)
  const operationPendingRef = useRef(false)

  const loadOnboardingProgress = async () => {
    setLoadError('')
    setIsLoadingProgress(true)

    try {
      const savedData = await onboardingService.getOnboardingData()
      if (!savedData) throw new Error('Onboarding progress is unavailable for the current session')
      if (!mountedRef.current) return
      setOnboardingData(savedData)
      setCurrentStep(savedData.progress.currentStep)
    } catch (error) {
      if (!mountedRef.current) return
      console.error('Error loading onboarding progress:', error)
      setLoadError('Your saved setup progress could not be loaded. Nothing has been replaced. Try again before continuing setup.')
    } finally {
      if (mountedRef.current) setIsLoadingProgress(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    loadOnboardingProgress()
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (previousStepRef.current !== currentStep) {
      stepTitleRef.current?.focus()
    }
    previousStepRef.current = currentStep
  }, [currentStep])

  const CurrentStepComponent = ONBOARDING_FLOW[currentStep].component

  const beginOperation = (action) => {
    if (operationPendingRef.current) return false
    operationPendingRef.current = true
    setPendingAction(action)
    setOperationError('')
    return true
  }

  const finishOperation = () => {
    operationPendingRef.current = false
    setPendingAction(null)
  }

  const handleNext = async (stepData) => {
    if (!beginOperation(currentStep === totalSteps - 1 ? 'complete' : 'save')) return

    const updatedData = {
      ...onboardingData,
      ...stepData,
      progress: {
        ...onboardingData.progress,
        currentStep: Math.min(currentStep + 1, totalSteps - 1),
        totalSteps,
        completedSteps: [...new Set([...onboardingData.progress.completedSteps, ONBOARDING_FLOW[currentStep].id])]
      }
    }

    try {
      if (currentStep === totalSteps - 1) {
        const completedData = await onboardingService.completeOnboarding(updatedData)
        if (onComplete) onComplete(completedData)
      } else {
        const savedData = await onboardingService.saveProgress(updatedData)
        setOnboardingData(savedData)
        setCurrentStep(currentStep + 1)
      }
    } catch (error) {
      console.error(currentStep === totalSteps - 1 ? 'Error completing onboarding:' : 'Error saving onboarding progress:', error)
      setOperationError(
        currentStep === totalSteps - 1
          ? 'We could not confirm that setup was completed. Your current setup remains on screen. Try opening your dashboard again.'
          : 'We could not confirm that this setup step was saved. You are still on this step, so you can try continuing again without re-entering your choices.'
      )
    } finally {
      finishOperation()
    }
  }

  const handleBack = () => {
    if (operationPendingRef.current) return
    setOperationError('')
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkipAll = async () => {
    if (!beginOperation('skip')) return

    try {
      const skippedData = await onboardingService.skipOnboarding()
      if (onSkip) onSkip(skippedData)
    } catch (error) {
      console.error('Error skipping onboarding:', error)
      setOperationError('We could not confirm that setup was skipped. Your setup remains open, so you can try again or continue with setup.')
    } finally {
      finishOperation()
    }
  }

  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-step-title"
        aria-busy={isLoadingProgress || pendingAction !== null}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header with Progress */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                id="onboarding-step-title"
                ref={stepTitleRef}
                tabIndex={-1}
                className="text-2xl font-bold text-slate-900"
              >
                {ONBOARDING_FLOW[currentStep].title}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {isLoadingProgress ? 'Loading saved setup progress…' : `Step ${currentStep + 1} of ${totalSteps}`}
              </p>
            </div>
            {currentStep === 0 && !isLoadingProgress && !loadError && (
              <button
                type="button"
                onClick={handleSkipAll}
                disabled={pendingAction !== null}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingAction === 'skip' ? 'Skipping…' : 'Skip Setup'}
              </button>
            )}
          </div>

          {!isLoadingProgress && !loadError && (
            <div
              className="w-full bg-slate-200 rounded-full h-2 overflow-hidden"
              role="progressbar"
              aria-label="Onboarding progress"
              aria-valuemin={1}
              aria-valuemax={totalSteps}
              aria-valuenow={currentStep + 1}
              aria-valuetext={`Step ${currentStep + 1} of ${totalSteps}`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoadingProgress ? (
            <p role="status" className="py-10 text-center text-sm text-slate-600">
              Loading your saved setup progress…
            </p>
          ) : loadError ? (
            <LoadErrorState
              title="We couldn’t load your setup progress"
              message={loadError}
              onRetry={loadOnboardingProgress}
            />
          ) : (
            <>
              <OperationErrorState message={operationError} onDismiss={() => setOperationError('')} />
              {pendingAction && (
                <p role="status" className="sr-only">
                  {pendingAction === 'skip'
                    ? 'Skipping setup…'
                    : pendingAction === 'complete'
                      ? 'Completing setup…'
                      : 'Saving setup progress…'}
                </p>
              )}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CurrentStepComponent
                    onNext={handleNext}
                    onBack={handleBack}
                    onSkip={currentStep === 0 ? handleSkipAll : undefined}
                    currentData={onboardingData}
                    stepNumber={currentStep + 1}
                    totalSteps={totalSteps}
                  />
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default OnboardingFlow
