import React, { useCallback, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import LoadErrorState from '../../common/LoadErrorState'
import OperationErrorState from '../../common/OperationErrorState'
import { taskService } from '../../services/taskService'
import { getUserPreferences } from '../../domain/preferences/repository'
import { adhdPriorityService } from '../../services/adhdPriorityService'
import { useMode } from '../../contexts/ModeContext'
import { useAuth } from '../../contexts/AuthContext'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'
import TaskLoadAnalysis from './TaskLoadAnalysis'
import RecommendedTasks from './RecommendedTasks'
import TemplateLibrary from '../templates/TemplateLibrary'

const { FiPlus, FiFilter, FiBookOpen } = FiIcons

const sortTasks = (items, sortType) => {
  switch (sortType) {
    case 'priority':
      return [...items].sort((a, b) => b.priorityScore - a.priorityScore)
    case 'due_date':
      return [...items].sort((a, b) => {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date) - new Date(b.due_date)
      })
    case 'created':
      return [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    case 'alphabetical':
      return [...items].sort((a, b) => a.title.localeCompare(b.title))
    default:
      return items
  }
}

const TaskList = () => {
  const { user } = useAuth()
  const { currentMode, filterByMode, getModePreferences } = useMode()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [operationError, setOperationError] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('priority')
  const [preferences, setPreferences] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [recommendedTasks, setRecommendedTasks] = useState([])

  const modePrefs = getModePreferences(currentMode.id)

  useEffect(() => {
    setSortBy(modePrefs.sortBy || 'priority')
  }, [currentMode.id, modePrefs.sortBy])

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const prefs = await getUserPreferences(user)
      setPreferences(prefs)
      return true
    } catch (error) {
      console.error('Error loading preferences:', error)
      setLoadError('preferences')
      setLoading(false)
      return false
    }
  }, [user])

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const taskFilter = {
        status: filter === 'completed' ? 'completed' : 'active',
        timeframe: filter,
        ...(currentMode.id !== 'all' ? { mode: currentMode.id } : {})
      }

      const data = await taskService.getTasks(taskFilter)
      const filteredData = filterByMode(data, 'task')
      const prioritizedTasks = adhdPriorityService.prioritizeTasks(filteredData, preferences)

      let displayTasks = prioritizedTasks
      if (modePrefs.hideCompleted) {
        displayTasks = displayTasks.filter(t => !t.completed)
      }

      const sorted = sortTasks(displayTasks, sortBy)
      setTasks(sorted)
      setAnalysis(adhdPriorityService.analyzeTaskLoad(filteredData, preferences))
      setRecommendedTasks(adhdPriorityService.getRecommendedTasks(filteredData, preferences, 3))
      return true
    } catch (error) {
      console.error('Error loading tasks:', error)
      setLoadError('tasks')
      return false
    } finally {
      setLoading(false)
    }
  }, [currentMode.id, filter, filterByMode, modePrefs.hideCompleted, preferences, sortBy])

  useEffect(() => {
    if (user) loadPreferences()
  }, [loadPreferences, user])

  useEffect(() => {
    if (preferences) {
      loadTasks()
    }
  }, [loadTasks, preferences])

  const retryLoad = () => {
    setOperationError(null)
    if (preferences) {
      loadTasks()
    } else {
      loadPreferences()
    }
  }

  const handleCreateTask = async (taskData) => {
    if (pendingAction) return
    setOperationError(null)
    setPendingAction('create')

    try {
      const taskWithMode = {
        ...taskData,
        mode: currentMode.id !== 'all' ? currentMode.id : null,
        tags: taskData.tags || []
      }

      await taskService.createTask(taskWithMode)
      setShowForm(false)
      const refreshed = await loadTasks()
      if (!refreshed) {
        setOperationError('The task was created, but the task list could not refresh. Reload Tasks before creating it again.')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      setOperationError('We couldn’t create that task. The task form is still open and your entries have not been discarded.')
    } finally {
      setPendingAction(null)
    }
  }

  const handleApplyTemplate = async (template, type) => {
    if (type !== 'task' || pendingAction) return

    setOperationError(null)
    setPendingAction('template')
    try {
      const taskData = {
        title: template.title,
        description: template.description,
        estimated_duration: template.estimated_duration,
        is_essential: template.is_essential,
        mode: currentMode.id !== 'all' ? currentMode.id : null
      }

      await taskService.createTask(taskData)
      setShowTemplates(false)
      const refreshed = await loadTasks()
      if (!refreshed) {
        setOperationError('The template task was created, but the task list could not refresh. Do not apply the template again until Tasks has reloaded.')
      }
    } catch (error) {
      console.error('Error applying template:', error)
      setOperationError('We couldn’t create a task from that template. The template library is still open so you can try again.')
    } finally {
      setPendingAction(null)
    }
  }

  const handleCompleteTask = async (id) => {
    if (pendingAction) return

    setOperationError(null)
    setPendingAction(`complete:${id}`)
    try {
      await taskService.completeTask(id)
      const refreshed = await loadTasks()
      if (!refreshed) {
        setOperationError('The task was completed, but the task list could not refresh. Reload Tasks before acting on it again.')
      }
    } catch (error) {
      console.error('Error completing task:', error)
      setOperationError('We couldn’t complete that task. It has not been confirmed as completed and remains safe to retry.')
    } finally {
      setPendingAction(null)
    }
  }

  const handleDeleteTask = async (id) => {
    if (pendingAction) return
    if (!window.confirm('Delete this task? This action cannot be undone.')) return

    setOperationError(null)
    setPendingAction(`delete:${id}`)
    try {
      await taskService.deleteTask(id)
      const refreshed = await loadTasks()
      if (!refreshed) {
        setOperationError('The task was deleted, but the task list could not refresh. Reload Tasks before trying to delete it again.')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      setOperationError('We couldn’t delete that task. It has not been confirmed as deleted and remains in your task data.')
    } finally {
      setPendingAction(null)
    }
  }

  const filters = [
    { key: 'all', label: 'All Tasks' },
    { key: 'today', label: 'Due Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'overdue', label: 'Needs attention' },
    { key: 'completed', label: 'Completed' }
  ]

  const sortOptions = [
    { key: 'priority', label: 'Priority' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'created', label: 'Recently Added' },
    { key: 'alphabetical', label: 'A-Z' }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="p-6">
        <LoadErrorState
          title={loadError === 'preferences' ? 'We couldn’t load your task preferences' : 'We couldn’t load your tasks'}
          message="Your task data has not been cleared. Check your connection and try again."
          onRetry={retryLoad}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {currentMode.id !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${currentMode.gradient} text-white rounded-lg p-4`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentMode.icon}</span>
            <div>
              <div className="font-medium">Viewing {currentMode.label} Tasks</div>
              <div className="text-xs text-white text-opacity-90">Showing only {currentMode.label.toLowerCase()}-related tasks</div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium text-slate-900">Tasks</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setOperationError(null); setShowTemplates(true) }}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiBookOpen} className="w-4 h-4" />
            <span>Templates</span>
          </button>
          <button
            type="button"
            onClick={() => { setOperationError(null); setShowForm(true) }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      <OperationErrorState message={operationError} onDismiss={() => setOperationError(null)} />
      <TaskLoadAnalysis analysis={analysis} />

      {recommendedTasks.length > 0 && modePrefs.viewMode === 'detailed' && (
        <RecommendedTasks
          tasks={recommendedTasks}
          onTaskClick={(task) => {
            const element = document.getElementById(`task-${task.id}`)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              element.focus({ preventScroll: true })
            }
          }}
        />
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div role="group" aria-label="Filter tasks by timeframe" className="flex items-center space-x-2">
          <SafeIcon icon={FiFilter} className="w-5 h-5 text-slate-600" />
          {filters.map((filterOption) => (
            <button
              type="button"
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              aria-pressed={filter === filterOption.key}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${filter === filterOption.key ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="task-sort" className="text-sm text-slate-600">Sort by:</label>
          <select
            id="task-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {sortOptions.map((option) => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <p className="text-slate-600 mb-4">
              {currentMode.id !== 'all' ? `No ${currentMode.label.toLowerCase()} tasks found` : 'No tasks found'}
            </p>
            <div className="flex gap-3 justify-center">
              <button type="button" onClick={() => setShowForm(true)} className="text-blue-600 hover:text-blue-700">Create your first task</button>
              <span className="text-slate-400">or</span>
              <button type="button" onClick={() => setShowTemplates(true)} className="text-purple-600 hover:text-purple-700">Browse templates</button>
            </div>
          </div>
        ) : (
          tasks.map((task, index) => (
            <motion.div
              key={task.id}
              id={`task-${task.id}`}
              role="group"
              aria-label={`Task: ${task.title}`}
              tabIndex={-1}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <TaskCard
                task={task}
                onComplete={() => handleCompleteTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
                showPriority={sortBy === 'priority'}
                pending={pendingAction?.endsWith(`:${task.id}`)}
              />
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <TaskForm
            onSave={handleCreateTask}
            onCancel={() => setShowForm(false)}
            saving={pendingAction === 'create'}
          />
        )}

        {showTemplates && (
          <TemplateLibrary
            onApplyTemplate={handleApplyTemplate}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default TaskList
