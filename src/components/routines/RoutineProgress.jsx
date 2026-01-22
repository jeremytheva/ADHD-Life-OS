import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { routineProgressService } from '../../services/routineProgressService'

const { FiPlay, FiCheck, FiSkipForward, FiX, FiClock, FiAlertCircle } = FiIcons

const RoutineProgress = ({ routine, onClose, onComplete }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(null)
  const [stepStartTime, setStepStartTime] = useState(null)

  useEffect(() => {
    initializeSession()
  }, [routine])

  useEffect(() => {
    if (session && session.current_step_index < routine.routine_steps.length) {
      setCurrentStep(routine.routine_steps[session.current_step_index])
      setStepStartTime(Date.now())
    } else if (session && session.current_step_index >= routine.routine_steps.length) {
      handleCompleteRoutine()
    }
  }, [session?.current_step_index])

  const initializeSession = async () => {
    try {
      setLoading(true)
      
      // Check for existing active session
      let activeSession = await routineProgressService.getActiveSession(routine.id)
      
      if (!activeSession) {
        // Start new session
        activeSession = await routineProgressService.startRoutine(routine.id, routine)
      }
      
      setSession(activeSession)
    } catch (error) {
      console.error('Error initializing session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteStep = async () => {
    try {
      const updatedSession = await routineProgressService.completeStep(
        session.id,
        session.current_step_index,
        currentStep.id
      )
      setSession(updatedSession)
    } catch (error) {
      console.error('Error completing step:', error)
    }
  }

  const handleSkipStep = async () => {
    try {
      const updatedSession = await routineProgressService.skipStep(
        session.id,
        session.current_step_index,
        currentStep.id
      )
      setSession(updatedSession)
    } catch (error) {
      console.error('Error skipping step:', error)
    }
  }

  const handleCompleteRoutine = async () => {
    try {
      await routineProgressService.completeRoutine(session.id)
      if (onComplete) {
        onComplete()
      }
      onClose()
    } catch (error) {
      console.error('Error completing routine:', error)
    }
  }

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this routine?')) {
      try {
        await routineProgressService.cancelRoutine(session.id)
        onClose()
      } catch (error) {
        console.error('Error canceling routine:', error)
      }
    }
  }

  const calculateProgress = () => {
    if (!session) return 0
    return (session.current_step_index / session.total_steps) * 100
  }

  const getElapsedTime = () => {
    if (!stepStartTime) return '0:00'
    const elapsed = Math.floor((Date.now() - stepStartTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading routine...</p>
        </div>
      </div>
    )
  }

  if (!session || !currentStep) return null

  const progress = calculateProgress()
  const completedSteps = session.completed_steps.length
  const totalSteps = session.total_steps

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{routine.name}</h2>
              <p className="text-purple-100">
                Step {session.current_step_index + 1} of {totalSteps}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-purple-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={session.current_step_index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Step Number Badge */}
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">
                    {session.current_step_index + 1}
                  </span>
                </div>
              </div>

              {/* Step Name */}
              <h3 className="text-2xl font-bold text-slate-900 text-center">
                {currentStep.name}
              </h3>

              {/* Step Description */}
              {currentStep.description && (
                <p className="text-slate-600 text-center">
                  {currentStep.description}
                </p>
              )}

              {/* Step Info */}
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

              {/* Timer Display */}
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-600 mb-1">Time Elapsed</p>
                <p className="text-3xl font-bold text-slate-900">
                  {getElapsedTime()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSkipStep}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <SafeIcon icon={FiSkipForward} className="w-5 h-5" />
                  <span>Skip</span>
                </button>
                <button
                  onClick={handleCompleteStep}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <SafeIcon icon={FiCheck} className="w-5 h-5" />
                  <span>Complete</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Steps Overview */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-3">
              All Steps
            </h4>
            <div className="space-y-2">
              {routine.routine_steps.map((step, index) => {
                const isCompleted = session.completed_steps.some(
                  s => s.step_index === index
                )
                const isCurrent = session.current_step_index === index
                const isSkipped = session.completed_steps.find(
                  s => s.step_index === index && s.skipped
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
                    <span
                      className={`
                        text-sm flex-1
                        ${isCurrent ? 'font-medium text-purple-900' : 'text-slate-700'}
                      `}
                    >
                      {step.name}
                    </span>
                    {step.duration_minutes && (
                      <span className="text-xs text-slate-500">
                        {step.duration_minutes}m
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default RoutineProgress