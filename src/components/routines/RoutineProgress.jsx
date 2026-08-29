import React, { useCallback, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import LoadErrorState from '../../common/LoadErrorState'
import OperationErrorState from '../../common/OperationErrorState'
import useModalDialog from '../../common/useModalDialog'
import { routineProgressService } from '../../services/routineProgressService'

const { FiCheck, FiSkipForward, FiX, FiClock, FiAlertCircle } = FiIcons

const RoutineProgress = ({ routine, onClose, onComplete }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [operationError, setOperationError] = useState('')
  const [actionPending, setActionPending] = useState(false)
  const [currentStep, setCurrentStep] = useState(null)
  const [stepStartTime, setStepStartTime] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const completionAttemptedRef = useRef(false)
  const routineRef = useRef(routine)
  routineRef.current = routine

  const routineId = routine.id
  const routineSteps = routine.routine_steps
  const currentStepIndex = session?.current_step_index
  const hasSession = Boolean(session)
  const isFinishingSession = currentStepIndex != null && currentStepIndex >= routineSteps.length
  const hasCurrentStep = Boolean(currentStep)
  const dialogTitleId = `routine-progress-title-${routineId}`

  const initializeSession = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(false)
      setOperationError('')
      completionAttemptedRef.current = false

      const activeRoutine = routineRef.current
      let activeSession = await routineProgressService.getActiveSession(routineId)
      if (!activeSession) {
        activeSession = await routineProgressService.startRoutine(routineId, activeRoutine)
      }
      setSession(activeSession)
    } catch (error) {
      console.error('Error initializing session:', error)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [routineId])

  const handleCompleteRoutine = useCallback(async () => {
    if (!session || actionPending) return

    setActionPending(true)
    setOperationError('')
    try {
      await routineProgressService.completeRoutine(session.id)
      if (onComplete) onComplete()
      onClose()
    } catch (error) {
      console.error('Error completing routine:', error)
      setOperationError('All steps are recorded, but we couldn’t save the routine as finished. Your session remains open; try finishing again.')
    } finally {
      setActionPending(false)
    }
  }, [actionPending, onClose, onComplete, session])

  const handleCancel = useCallback(async () => {
    if (!session || actionPending) return
    if (!window.confirm('Are you sure you want to cancel this routine?')) return

    setActionPending(true)
    setOperationError('')
    try {
      await routineProgressService.cancelRoutine(session.id)
      onClose()
    } catch (error) {
      console.error('Error canceling routine:', error)
      setOperationError('We couldn’t cancel this routine session. It remains active, so you can keep working or try cancelling again.')
    } finally {
      setActionPending(false)
    }
  }, [actionPending, onClose, session])

  const handleEscape = useCallback(() => {
    if (loading || actionPending) return

    if (loadError || !session) {
      onClose()
      return
    }

    void handleCancel()
  }, [actionPending, handleCancel, loadError, loading, onClose, session])

  const dialogRef = useModalDialog({ onEscape: handleEscape })

  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  useEffect(() => {
    if (currentStepIndex == null) return

    if (currentStepIndex < routineSteps.length) {
      setCurrentStep(routineSteps[currentStepIndex])
      setStepStartTime(Date.now())
      setElapsedSeconds(0)
      completionAttemptedRef.current = false
      return
    }

    setCurrentStep(null)
  }, [currentStepIndex, routineSteps])

  useEffect(() => {
    if (!isFinishingSession || !hasSession || actionPending || completionAttemptedRef.current) return

    completionAttemptedRef.current = true
    void handleCompleteRoutine()
  }, [actionPending, handleCompleteRoutine, hasSession, isFinishingSession])

  useEffect(() => {
    if (!hasCurrentStep || !stepStartTime) return undefined

    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - stepStartTime) / 1000))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [hasCurrentStep, stepStartTime])

  const handleCompleteStep = async () => {
    if (actionPending) return

    setActionPending(true)
    setOperationError('')
    try {
      const updatedSession = await routineProgressService.completeStep(
        session.id,
        session.current_step_index,
        currentStep.id
      )
      setSession(updatedSession)
    } catch (error) {
      console.error('Error completing step:', error)
      setOperationError('We couldn’t save this step as completed. It has not been advanced, so you can safely try again.')
    } finally {
      setActionPending(false)
    }
  }

  const handleSkipStep = async () => {
    if (actionPending) return

    setActionPending(true)
    setOperationError('')
    try {
      const updatedSession = await routineProgressService.skipStep(
        session.id,
        session.current_step_index,
        currentStep.id
      )
      setSession(updatedSession)
    } catch (error) {
      console.error('Error skipping step:', error)
      setOperationError('We couldn’t save this step as skipped. The routine has not advanced, so you can safely try again.')
    } finally {
      setActionPending(false)
    }
  }

  const calculateProgress = () => {
    if (!session?.total_steps) return 0
    return (session.current_step_index / session.total_steps) * 100
  }

  const getElapsedTime = () => {
    const minutes = Math.floor(elapsedSeconds / 60)
    const seconds = elapsedSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const renderActiveStep = () => {
    if (!session || !currentStep) {
      return (
        <div className="p-8 text-center" role="status">
          <p className="text-slate-600">Preparing the next routine step…</p>
        </div>
      )
    }

    const progress = calculateProgress()
    const totalSteps = session.total_steps

    return (
      <>
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{routine.name}</h3>
              <p className="text-purple-100">
                Step {session.current_step_index + 1} of {totalSteps}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              disabled={actionPending}
              aria-label="Cancel routine session"
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          <div
            className="w-full bg-purple-700 rounded-full h-3 overflow-hidden"
            role="progressbar"
            aria-label="Routine progress"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.round(progress)}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>

        <div className="p-8">
          <OperationErrorState message={operationError} onDismiss={() => setOperationError('')} />

          <AnimatePresence mode="wait">
            <motion.div
              key={session.current_step_index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 mt-4"
            >
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">
                    {session.current_step_index + 1}
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 text-center">
                {currentStep.name}
              </h3>

              {currentStep.description && (
                <p className="text-slate-600 text-center">{currentStep.description}</p>
              )}

              <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                {currentStep.duration_minutes && (
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiClock} className="w-4 h-4" />
                    <span>{currentStep.duration_minutes} min</span>
                  </div>
                )}
                {currentStep.is_essential && (
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-600 font-medium">Essential</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-600 mb-1">Time Elapsed</p>
                <p className="text-3xl font-bold text-slate-900">{getElapsedTime()}</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSkipStep}
                  disabled={actionPending}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <SafeIcon icon={FiSkipForward} className="w-5 h-5" />
                  <span>{actionPending ? 'Saving…' : 'Skip'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCompleteStep}
                  disabled={actionPending}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <SafeIcon icon={FiCheck} className="w-5 h-5" />
                  <span>{actionPending ? 'Saving…' : 'Complete'}</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-3">All Steps</h4>
            <div className="space-y-2">
              {routineSteps.map((step, index) => {
                const isCompleted = session.completed_steps.some(
                  completed => completed.step_index === index
                )
                const isCurrent = session.current_step_index === index
                const isSkipped = session.completed_steps.find(
                  completed => completed.step_index === index && completed.skipped
                )

                return (
                  <div
                    key={step.id}
                    className={`
                      flex items-center gap-3 p-2 rounded-lg transition-colors
                      ${isCurrent ? 'bg-purple-50 border border-purple-200' : ''}
                      ${isCompleted && !isCurrent ? 'opacity-50' : ''}
                    `}
                  >
                    <div
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                        ${isCompleted
                          ? isSkipped
                            ? 'bg-slate-300 text-white'
                            : 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                        }
                      `}
                    >
                      {isCompleted ? (
                        isSkipped ? (
                          <SafeIcon icon={FiSkipForward} className="w-3 h-3" />
                        ) : (
                          <SafeIcon icon={FiCheck} className="w-3 h-3" />
                        )
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm flex-1 ${isCurrent ? 'font-medium text-purple-900' : 'text-slate-700'}`}>
                      {step.name}
                    </span>
                    {step.duration_minutes && (
                      <span className="text-xs text-slate-500">{step.duration_minutes}m</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-busy={loading || actionPending}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 id={dialogTitleId} className="sr-only">{routine.name} routine session</h2>

        {loading ? (
          <div className="p-8 text-center" role="status">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading routine...</p>
          </div>
        ) : loadError || !session ? (
          <div className="p-6 space-y-4">
            <LoadErrorState
              title="We couldn’t start this routine"
              message="No progress was changed. Try loading the routine session again."
              onRetry={initializeSession}
            />
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        ) : isFinishingSession ? (
          <div className="p-6 w-full max-w-lg mx-auto space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Finishing {routine.name}</h3>
            {actionPending && <p className="text-slate-600" role="status">Saving your completed routine…</p>}
            <OperationErrorState message={operationError} onDismiss={() => setOperationError('')} />
            {!actionPending && operationError && (
              <button
                type="button"
                onClick={handleCompleteRoutine}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Try finishing again
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
              disabled={actionPending}
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel session
            </button>
          </div>
        ) : (
          renderActiveStep()
        )}
      </motion.div>
    </div>
  )
}

export default RoutineProgress
