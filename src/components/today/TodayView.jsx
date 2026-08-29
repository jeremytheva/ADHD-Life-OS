import React, { lazy, Suspense, useCallback, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import LoadErrorState from '../../common/LoadErrorState'
import OperationErrorState from '../../common/OperationErrorState'
import { timelineService } from '../../services/timelineService'
import { taskService } from '../../services/taskService'
import { useMode } from '../../contexts/ModeContext'
import { useAuth } from '../../contexts/AuthContext'
import BlockCard from './BlockCard'
import NextActionPanel from './NextActionPanel'

const GamificationDashboard = lazy(() => import('../gamification/GamificationDashboard'))

const { FiRefreshCw, FiAward } = FiIcons
const DEFAULT_UNSCHEDULED_LIMIT = 3

const ModalLoadingFallback = () => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-40" role="status" aria-live="polite">
    <div className="rounded-lg bg-white px-5 py-4 text-sm text-slate-600 shadow-lg">Loading…</div>
  </div>
)

const TodayView = () => {
  const { user } = useAuth()
  const { currentMode, filterByMode } = useMode()
  const [timeline, setTimeline] = useState({ blocks: [], unscheduledTasks: [] })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [operationError, setOperationError] = useState(null)
  const [pendingTaskId, setPendingTaskId] = useState(null)
  const [showGamification, setShowGamification] = useState(false)
  const [showAllUnscheduled, setShowAllUnscheduled] = useState(false)

  const loadTimeline = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(false)
      const schedule = await timelineService.getTimeline(new Date(), user)
      const filteredBlocks = currentMode.id === 'all'
        ? schedule.blocks
        : schedule.blocks.filter(block => {
            if (block.is_anchor) return true
            if (block.ref_type === 'task' || block.ref_type === 'routine_step') {
              const modeTags = currentMode.tags || []
              return modeTags.some(modeTag => block.label.toLowerCase().includes(modeTag))
            }
            return true
          })
      setShowAllUnscheduled(false)
      setTimeline({
        blocks: filteredBlocks,
        unscheduledTasks: filterByMode(schedule.unscheduledTasks, 'task')
      })
      return true
    } catch (error) {
      console.error('Error loading timeline:', error)
      setLoadError(true)
      return false
    } finally {
      setLoading(false)
    }
  }, [currentMode, filterByMode, user])

  useEffect(() => { loadTimeline() }, [loadTimeline])

  const handleCompleteTask = async (blockId, taskId) => {
    if (pendingTaskId) return
    setOperationError(null)
    setPendingTaskId(taskId)
    try {
      await taskService.completeTask(taskId)
      const refreshed = await loadTimeline()
      if (!refreshed) setOperationError('The task was completed, but Today could not refresh. Reload your day before acting on the same task again.')
    } catch (error) {
      console.error('Error completing task:', error)
      setOperationError('We couldn’t complete that task. It has not been confirmed as completed and remains safe to retry.')
    } finally {
      setPendingTaskId(null)
    }
  }

  const groupBlocksByTimeOfDay = (blocks) => {
    const groups = { morning: [], midday: [], afternoon: [], evening: [] }
    blocks.forEach((block) => {
      const hour = parseISO(block.start_at).getHours()
      if (hour < 12) groups.morning.push(block)
      else if (hour < 15) groups.midday.push(block)
      else if (hour < 18) groups.afternoon.push(block)
      else groups.evening.push(block)
    })
    return groups
  }

  if (loading) return (
    <div className="p-6"><div className="bg-white rounded-lg border border-slate-200 p-8 text-center"><SafeIcon icon={FiRefreshCw} className="w-8 h-8 text-slate-400 mx-auto mb-4 animate-spin" /><p className="text-slate-600">Loading your day...</p></div></div>
  )

  if (loadError) return (
    <div className="p-6"><LoadErrorState title="We couldn’t load your day" message="Your tasks, routines, projects and chores have not been cleared. Check your connection and try again." onRetry={loadTimeline} /></div>
  )

  const groupedBlocks = groupBlocksByTimeOfDay(timeline.blocks)
  const timeGroups = [
    { name: 'Morning', key: 'morning', blocks: groupedBlocks.morning },
    { name: 'Midday', key: 'midday', blocks: groupedBlocks.midday },
    { name: 'Afternoon', key: 'afternoon', blocks: groupedBlocks.afternoon },
    { name: 'Evening', key: 'evening', blocks: groupedBlocks.evening }
  ]
  const unscheduledTaskCount = timeline.unscheduledTasks.length
  const visibleUnscheduledTasks = showAllUnscheduled
    ? timeline.unscheduledTasks
    : timeline.unscheduledTasks.slice(0, DEFAULT_UNSCHEDULED_LIMIT)
  const hiddenUnscheduledCount = Math.max(0, unscheduledTaskCount - visibleUnscheduledTasks.length)
  const hasAdditionalUnscheduledTasks = unscheduledTaskCount > DEFAULT_UNSCHEDULED_LIMIT

  return (
    <div className="p-6 space-y-6">
      {currentMode.id !== 'all' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`bg-gradient-to-r ${currentMode.gradient} text-white rounded-lg p-4`}>
          <div className="flex items-center gap-3"><span className="text-2xl">{currentMode.icon}</span><div><div className="font-medium">{currentMode.label} Mode Active</div><div className="text-xs text-white text-opacity-90">Your timeline is filtered to show {currentMode.label.toLowerCase()}-related items</div></div></div>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-medium text-slate-900">Today</h1><p className="text-slate-600">{format(new Date(), 'EEEE, MMMM d')}</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowGamification(true)} aria-label="Open rewards and progress" className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><SafeIcon icon={FiAward} className="w-5 h-5" /></button>
          <button type="button" onClick={loadTimeline} aria-label="Refresh Today" className="p-2 text-slate-600 hover:text-slate-900 transition-colors"><SafeIcon icon={FiRefreshCw} className="w-5 h-5" /></button>
        </div>
      </div>

      <OperationErrorState message={operationError} onDismiss={() => setOperationError(null)} />
      <NextActionPanel currentMode={currentMode} />

      <div className="space-y-8">
        {timeGroups.map((group) => (
          <motion.div key={group.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {group.blocks.length > 0 && <><h2 className="text-lg font-medium text-slate-900 mb-4">{group.name}</h2><div className="space-y-3">{group.blocks.map((block, index) => <BlockCard key={`${block.ref_type}-${block.ref_id}-${index}`} block={block} onComplete={handleCompleteTask} pending={block.ref_type === 'task' && pendingTaskId === block.ref_id} />)}</div></>}
          </motion.div>
        ))}
      </div>

      {unscheduledTaskCount > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-amber-50 border border-amber-200 rounded-lg p-6" aria-labelledby="unscheduled-tasks-title">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 id="unscheduled-tasks-title" className="text-lg font-medium text-amber-900">Unscheduled Tasks</h2>
            <span className="text-sm font-medium text-amber-800">{unscheduledTaskCount} total</span>
          </div>
          <ul id="today-unscheduled-task-list" className="space-y-2">
            {visibleUnscheduledTasks.map((task) => <li key={task.id} className="text-amber-800">• {task.title}</li>)}
          </ul>
          {hasAdditionalUnscheduledTasks && (
            <button
              type="button"
              onClick={() => setShowAllUnscheduled((current) => !current)}
              aria-expanded={showAllUnscheduled}
              aria-controls="today-unscheduled-task-list"
              className="mt-4 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
            >
              {showAllUnscheduled ? 'Show less' : `Show ${hiddenUnscheduledCount} more`}
            </button>
          )}
          <p className="text-sm text-amber-700 mt-4">These tasks couldn't fit in today's schedule. Consider moving some to tomorrow or adjusting their duration.</p>
        </motion.section>
      )}

      <Suspense fallback={<ModalLoadingFallback />}><AnimatePresence>{showGamification && <GamificationDashboard onClose={() => setShowGamification(false)} />}</AnimatePresence></Suspense>
    </div>
  )
}

export default TodayView
