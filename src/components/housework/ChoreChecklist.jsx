import React, { useCallback, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import LoadErrorState from '../../common/LoadErrorState'
import OperationErrorState from '../../common/OperationErrorState'
import { houseworkService } from '../../services/houseworkService'
import { format, isToday, isPast, parseISO } from 'date-fns'

const {
  FiHome,
  FiCheck,
  FiClock,
  FiChevronRight,
  FiSun,
  FiMoon,
  FiRefreshCw
} = FiIcons

const ChoreChecklist = ({ onSelectTask, mode = 'home' }) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [operationError, setOperationError] = useState(null)
  const [filter, setFilter] = useState('today')
  const [stats, setStats] = useState(null)

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(false)
      const filters = {}
      if (filter === 'today') filters.dueToday = true
      const data = await houseworkService.getHouseworkTasks(filters)
      setTasks(data)
    } catch (error) {
      console.error('Error loading housework tasks:', error)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [filter])

  const loadStats = useCallback(async () => {
    try {
      const statsData = await houseworkService.getHouseworkStats(7)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading stats:', error)
      setStats(null)
    }
  }, [])

  useEffect(() => {
    loadTasks()
    loadStats()
  }, [loadStats, loadTasks])

  const retryLoad = () => {
    setOperationError(null)
    loadTasks()
    loadStats()
  }

  const handleCompleteTask = async (taskId) => {
    setOperationError(null)
    try {
      await houseworkService.completeHouseworkTask(taskId, [])
      await loadTasks()
      await loadStats()
    } catch (error) {
      console.error('Error completing task:', error)
      setOperationError('We couldn’t mark that chore complete. It remains on your chore list and you can try again.')
    }
  }

  const handleSnoozeTask = async (taskId) => {
    setOperationError(null)
    try {
      await houseworkService.snoozeTask(taskId)
      await loadTasks()
    } catch (error) {
      console.error('Error snoozing task:', error)
      setOperationError('We couldn’t move that chore to tomorrow. Its current due date has not been changed.')
    }
  }

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

  if (loading) {
    return (
      <div
        className="bg-white rounded-lg border border-slate-200 p-8 text-center"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-busy="true"
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"
          aria-hidden="true"
        ></div>
        <p className="text-slate-600">Loading your chores...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <LoadErrorState
        title="We couldn’t load your chores"
        message="Your chore list has not been cleared. Check your connection and try again."
        onRetry={retryLoad}
      />
    )
  }

  const todayTasks = tasks.filter((task) => {
    const dueDate = parseISO(task.next_due_date)
    return isToday(dueDate) || isPast(dueDate)
  })

  const upcomingTasks = tasks.filter((task) => {
    const dueDate = parseISO(task.next_due_date)
    return !isToday(dueDate) && !isPast(dueDate)
  })

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiHome} className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Home Chores</h2>
              <p className="text-sm text-slate-600">Keep your space comfortable</p>
            </div>
          </div>
          <button onClick={retryLoad} className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors" aria-label="Refresh chores">
            <SafeIcon icon={FiRefreshCw} className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 text-center"><div className="text-2xl font-bold text-purple-600">{stats.upcoming_today}</div><div className="text-xs text-slate-600">Ready now</div></div>
            <div className="bg-white rounded-lg p-3 text-center"><div className="text-2xl font-bold text-green-600">{stats.total_completions}</div><div className="text-xs text-slate-600">This week</div></div>
            <div className="bg-white rounded-lg p-3 text-center"><div className="text-2xl font-bold text-blue-600">{stats.active_tasks}</div><div className="text-xs text-slate-600">Active</div></div>
          </div>
        )}
      </div>

      <OperationErrorState message={operationError} onDismiss={() => setOperationError(null)} />

      <div className="flex gap-2" role="group" aria-label="Filter chores">
        {['today', 'all'].map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => { setOperationError(null); setFilter(value) }}
            aria-pressed={filter === value}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === value ? 'bg-purple-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            {value === 'today' ? 'Ready Now' : 'All Chores'}
          </button>
        ))}
      </div>

      {todayTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-3 flex items-center gap-2"><SafeIcon icon={FiSun} className="w-5 h-5 text-amber-500" aria-hidden="true" />Ready to Do ({todayTasks.length})</h3>
          <div className="space-y-2">
            {todayTasks.map((task, index) => (
              <motion.div key={task.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button onClick={() => handleCompleteTask(task.id)} className="mt-1 p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" aria-label={`Complete ${task.title}`}><SafeIcon icon={FiCheck} className="w-5 h-5" aria-hidden="true" /></button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1"><span className="text-xl">{getRoomIcon(task.room)}</span><h4 className="font-medium text-slate-900">{task.title}</h4></div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="flex items-center gap-1"><SafeIcon icon={FiClock} className="w-4 h-4" aria-hidden="true" /><span>{task.estimated_duration} min</span></div>
                        <span className="text-slate-400">•</span><span className="capitalize">{task.room.replace('_', ' ')}</span>
                      </div>
                      {task.checklist?.length > 0 && <div className="mt-2 text-xs text-slate-500">{task.checklist.length} steps</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleSnoozeTask(task.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Move to tomorrow" aria-label={`Move ${task.title} to tomorrow`}><SafeIcon icon={FiMoon} className="w-4 h-4" aria-hidden="true" /></button>
                    <button onClick={() => onSelectTask && onSelectTask(task)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" aria-label={`Open ${task.title}`}><SafeIcon icon={FiChevronRight} className="w-5 h-5" aria-hidden="true" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {filter === 'all' && upcomingTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-3 flex items-center gap-2"><SafeIcon icon={FiMoon} className="w-5 h-5 text-slate-400" aria-hidden="true" />Upcoming ({upcomingTasks.length})</h3>
          <div className="space-y-2">
            {upcomingTasks.map((task, index) => (
              <motion.div key={task.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-lg border border-slate-200 p-4 opacity-75">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><span className="text-xl">{getRoomIcon(task.room)}</span><div><h4 className="font-medium text-slate-900">{task.title}</h4><div className="text-sm text-slate-600">Due {format(parseISO(task.next_due_date), 'MMM d')}</div></div></div>
                  <button onClick={() => onSelectTask && onSelectTask(task)} className="p-2 text-slate-400 hover:text-purple-600 transition-colors" aria-label={`Open ${task.title}`}><SafeIcon icon={FiChevronRight} className="w-5 h-5" aria-hidden="true" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><SafeIcon icon={FiCheck} className="w-8 h-8 text-green-600" aria-hidden="true" /></div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">All caught up!</h3>
          <p className="text-slate-600">No chores due right now. Great job keeping your space tidy! ✨</p>
        </div>
      )}
    </div>
  )
}

export default ChoreChecklist