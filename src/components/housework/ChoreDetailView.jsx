import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { houseworkService } from '../../services/houseworkService'
import { format, parseISO } from 'date-fns'

const { 
  FiX, 
  FiCheck, 
  FiClock, 
  FiPackage, 
  FiList,
  FiStar,
  FiCalendar,
  FiTrendingUp
} = FiIcons

const ChoreDetailView = ({ task, onClose, onComplete }) => {
  const [checklistState, setChecklistState] = useState(
    task.checklist?.reduce((acc, item, index) => {
      acc[index] = false
      return acc
    }, {}) || {}
  )
  const [showCelebration, setShowCelebration] = useState(false)
  const [completing, setCompleting] = useState(false)

  const handleToggleChecklistItem = (index) => {
    setChecklistState(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const handleComplete = async () => {
    try {
      setCompleting(true)
      
      // Get completed checklist items
      const completedItems = Object.entries(checklistState)
        .filter(([_, isComplete]) => isComplete)
        .map(([index]) => task.checklist[parseInt(index)])

      await houseworkService.completeHouseworkTask(task.id, completedItems)
      
      // Show celebration
      setShowCelebration(true)
      setTimeout(() => {
        if (onComplete) {
          onComplete()
        }
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error completing task:', error)
    } finally {
      setCompleting(false)
    }
  }

  const completedCount = Object.values(checklistState).filter(Boolean).length
  const totalCount = task.checklist?.length || 0
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const getRoomIcon = (room) => {
    const icons = {
      kitchen: '🍳',
      bathroom: '🚿',
      bedroom: '🛏️',
      living_room: '🛋️',
      general: '🏠'
    }
    return icons[room] || '🏠'
  }

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      every_2_days: 'Every 2 Days',
      twice_weekly: 'Twice Weekly',
      weekly: 'Weekly',
      biweekly: 'Every 2 Weeks',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      seasonal: 'Seasonal'
    }
    return labels[frequency] || frequency
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-4xl">{getRoomIcon(task.room)}</span>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
                {task.description && (
                  <p className="text-purple-100">{task.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{completedCount} of {totalCount} steps</span>
              </div>
              <div className="w-full bg-purple-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Task Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <SafeIcon icon={FiClock} className="w-4 h-4" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {task.estimated_duration} min
              </div>
              {(task.prep_time > 0 || task.cleanup_time > 0) && (
                <div className="text-xs text-slate-600 mt-1">
                  {task.prep_time > 0 && `+${task.prep_time}m prep`}
                  {task.prep_time > 0 && task.cleanup_time > 0 && ', '}
                  {task.cleanup_time > 0 && `+${task.cleanup_time}m cleanup`}
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                <span className="text-sm font-medium">Frequency</span>
              </div>
              <div className="text-lg font-bold text-slate-900">
                {getFrequencyLabel(task.frequency)}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Due {format(parseISO(task.next_due_date), 'MMM d')}
              </div>
            </div>
          </div>

          {/* Required Items */}
          {task.required_items && task.required_items.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <SafeIcon icon={FiPackage} className="w-5 h-5 text-slate-600" />
                <h3 className="font-medium text-slate-900">What You'll Need</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.required_items.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Checklist */}
          {task.checklist && task.checklist.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <SafeIcon icon={FiList} className="w-5 h-5 text-slate-600" />
                <h3 className="font-medium text-slate-900">Steps</h3>
              </div>
              <div className="space-y-2">
                {task.checklist.map((item, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleToggleChecklistItem(index)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${checklistState[index]
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-slate-200 hover:border-purple-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                          ${checklistState[index]
                            ? 'bg-green-500'
                            : 'bg-slate-200'
                          }
                        `}
                      >
                        {checklistState[index] && (
                          <SafeIcon icon={FiCheck} className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-slate-400 font-medium">
                          {index + 1}.
                        </span>
                        <span
                          className={`
                            ${checklistState[index]
                              ? 'text-green-900 line-through'
                              : 'text-slate-900'
                            }
                          `}
                        >
                          {item}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Completion Stats */}
          {task.completion_count > 0 && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Your Progress
                </span>
              </div>
              <p className="text-sm text-purple-800">
                You've completed this {task.completion_count} time{task.completion_count !== 1 ? 's' : ''}! 
                {task.last_completed && (
                  <> Last done {format(parseISO(task.last_completed), 'MMM d')}.</>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleComplete}
            disabled={completing}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {completing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Completing...
              </>
            ) : (
              <>
                <SafeIcon icon={FiCheck} className="w-5 h-5" />
                Mark as Complete
              </>
            )}
          </button>
        </div>

        {/* Celebration Animation */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 z-10"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-8xl mb-4"
                >
                  ✨
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-purple-600 mb-2"
                >
                  Great job!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-600"
                >
                  Your space is looking better already! 🏠
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default ChoreDetailView