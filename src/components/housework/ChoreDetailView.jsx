import React, { useEffect, useId, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import OperationErrorState from '../../common/OperationErrorState'
import useModalDialog from '../../common/useModalDialog'
import { houseworkService } from '../../services/houseworkService'
import { format, parseISO } from 'date-fns'

const { FiX, FiCheck, FiClock, FiPackage, FiList, FiCalendar, FiTrendingUp } = FiIcons

const ChoreDetailView = ({ task, onClose, onComplete }) => {
  const [checklistState, setChecklistState] = useState(
    task.checklist?.reduce((acc, item, index) => ({ ...acc, [index]: false }), {}) || {}
  )
  const [showCelebration, setShowCelebration] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [operationError, setOperationError] = useState(null)
  const closeTimerRef = useRef(null)
  const titleId = useId()
  const closeLocked = completing || showCelebration
  const dialogRef = useModalDialog({ onEscape: closeLocked ? undefined : onClose })

  useEffect(() => () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
  }, [])

  useEffect(() => {
    if (showCelebration) dialogRef.current?.focus()
  }, [dialogRef, showCelebration])

  const handleToggleChecklistItem = (index) => {
    if (closeLocked) return
    setChecklistState(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const handleComplete = async () => {
    if (closeLocked) return
    setOperationError(null)
    setCompleting(true)

    const completedItems = Object.entries(checklistState)
      .filter(([, isComplete]) => isComplete)
      .map(([index]) => task.checklist[parseInt(index, 10)])

    try {
      await houseworkService.completeHouseworkTask(task.id, completedItems)
    } catch (error) {
      console.error('Error completing task:', error)
      setOperationError('We couldn’t confirm this chore as complete. Your checked steps are still here, and the chore remains open so you can try again.')
      setCompleting(false)
      return
    }

    setCompleting(false)
    setShowCelebration(true)
    closeTimerRef.current = window.setTimeout(() => {
      if (onComplete) onComplete()
      onClose()
    }, 1200)
  }

  const completedCount = Object.values(checklistState).filter(Boolean).length
  const totalCount = task.checklist?.length || 0
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const getRoomIcon = (room) => ({ kitchen: '🍳', bathroom: '🚿', bedroom: '🛏️', living_room: '🛋️', general: '🏠' }[room] || '🏠')
  const getFrequencyLabel = (frequency) => ({ daily: 'Daily', every_2_days: 'Every 2 Days', twice_weekly: 'Twice Weekly', weekly: 'Weekly', biweekly: 'Every 2 Weeks', monthly: 'Monthly', quarterly: 'Quarterly', seasonal: 'Seasonal' }[frequency] || frequency)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={completing ? 'true' : 'false'}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative"
      >
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-4xl">{getRoomIcon(task.room)}</span>
              <div className="flex-1"><h2 id={titleId} className="text-2xl font-bold mb-2">{task.title}</h2>{task.description && <p className="text-purple-100">{task.description}</p>}</div>
            </div>
            <button type="button" onClick={onClose} disabled={closeLocked} aria-label="Close chore details" className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50"><SafeIcon icon={FiX} className="w-6 h-6" /></button>
          </div>
          {totalCount > 0 && <div><div className="flex items-center justify-between text-sm mb-2"><span>Progress</span><span>{completedCount} of {totalCount} steps</span></div><div className="w-full bg-purple-700 rounded-full h-3 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} className="h-full bg-white rounded-full" /></div></div>}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <OperationErrorState message={operationError} onDismiss={() => setOperationError(null)} />
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4"><div className="flex items-center gap-2 text-slate-600 mb-1"><SafeIcon icon={FiClock} className="w-4 h-4" /><span className="text-sm font-medium">Duration</span></div><div className="text-2xl font-bold text-slate-900">{task.estimated_duration} min</div>{(task.prep_time > 0 || task.cleanup_time > 0) && <div className="text-xs text-slate-600 mt-1">{task.prep_time > 0 && `+${task.prep_time}m prep`}{task.prep_time > 0 && task.cleanup_time > 0 && ', '}{task.cleanup_time > 0 && `+${task.cleanup_time}m cleanup`}</div>}</div>
            <div className="bg-slate-50 rounded-lg p-4"><div className="flex items-center gap-2 text-slate-600 mb-1"><SafeIcon icon={FiCalendar} className="w-4 h-4" /><span className="text-sm font-medium">Frequency</span></div><div className="text-lg font-bold text-slate-900">{getFrequencyLabel(task.frequency)}</div><div className="text-xs text-slate-600 mt-1">Due {format(parseISO(task.next_due_date), 'MMM d')}</div></div>
          </div>

          {task.required_items?.length > 0 && <div className="mb-6"><div className="flex items-center gap-2 mb-3"><SafeIcon icon={FiPackage} className="w-5 h-5 text-slate-600" /><h3 className="font-medium text-slate-900">What You'll Need</h3></div><div className="flex flex-wrap gap-2">{task.required_items.map((item, index) => <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{item}</span>)}</div></div>}

          {task.checklist?.length > 0 && <div><div className="flex items-center gap-2 mb-3"><SafeIcon icon={FiList} className="w-5 h-5 text-slate-600" /><h3 className="font-medium text-slate-900">Steps</h3></div><div className="space-y-2">{task.checklist.map((item, index) => <motion.button type="button" key={index} onClick={() => handleToggleChecklistItem(index)} disabled={closeLocked} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} aria-pressed={Boolean(checklistState[index])} className={`w-full text-left p-4 rounded-lg border-2 transition-all disabled:cursor-not-allowed ${checklistState[index] ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200 hover:border-purple-300'}`}><div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${checklistState[index] ? 'bg-green-500' : 'bg-slate-200'}`}>{checklistState[index] && <SafeIcon icon={FiCheck} className="w-4 h-4 text-white" />}</div><div className="flex items-center gap-2 flex-1"><span className="text-slate-400 font-medium">{index + 1}.</span><span className={checklistState[index] ? 'text-green-900 line-through' : 'text-slate-900'}>{item}</span></div></div></motion.button>)}</div></div>}

          {task.completion_count > 0 && <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200"><div className="flex items-center gap-2 mb-2"><SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-purple-600" /><span className="text-sm font-medium text-purple-900">Your Progress</span></div><p className="text-sm text-purple-800">You've completed this {task.completion_count} time{task.completion_count !== 1 ? 's' : ''}! {task.last_completed && <> Last done {format(parseISO(task.last_completed), 'MMM d')}.</>}</p></div>}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50"><button type="button" onClick={handleComplete} disabled={closeLocked} className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">{completing ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Confirming completion...</> : <><SafeIcon icon={FiCheck} className="w-5 h-5" />Mark as Complete</>}</button></div>

        <AnimatePresence>{showCelebration && <motion.div role="status" aria-live="polite" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 z-10"><div className="text-center"><motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-8xl mb-4">✨</motion.div><h3 className="text-3xl font-bold text-purple-600 mb-2">Great job!</h3><p className="text-slate-600">Completion confirmed.</p></div></motion.div>}</AnimatePresence>
      </motion.div>
    </div>
  )
}

export default ChoreDetailView
