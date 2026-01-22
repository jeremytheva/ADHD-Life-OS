import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { taskService } from '../../services/taskService'
import { userService } from '../../services/userService'
import { PrioritizationEngine } from '../../services/prioritizationEngine'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'
import TaskLoadAnalysis from './TaskLoadAnalysis'
import RecommendedTasks from './RecommendedTasks'
import TemplateLibrary from '../templates/TemplateLibrary'

const { FiPlus, FiFilter, FiTrendingUp, FiBookOpen } = FiIcons

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('priority')
  const [preferences, setPreferences] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [recommendedTasks, setRecommendedTasks] = useState([])

  useEffect(() => {
    loadPreferences()
  }, [])

  useEffect(() => {
    if (preferences) {
      loadTasks()
    }
  }, [filter, preferences])

  const loadPreferences = async () => {
    try {
      const prefs = await userService.getPreferences()
      setPreferences(prefs)
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }

  const loadTasks = async () => {
    try {
      setLoading(true)
      const filters = {}

      if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0]
        filters.due_date = today
      }

      const data = await taskService.getTasks(filters)
      
      const engine = new PrioritizationEngine(preferences)
      const prioritizedTasks = engine.prioritizeTasks(data)
      
      const sorted = sortTasks(prioritizedTasks, sortBy)
      
      setTasks(sorted)
      
      const taskAnalysis = engine.analyzeTaskLoad(data)
      setAnalysis(taskAnalysis)
      
      const recommended = engine.getRecommendedTasks(data, 3)
      setRecommendedTasks(recommended)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortTasks = (tasks, sortType) => {
    switch (sortType) {
      case 'priority':
        return [...tasks].sort((a, b) => b.priorityScore - a.priorityScore)
      case 'due_date':
        return [...tasks].sort((a, b) => {
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date) - new Date(b.due_date)
        })
      case 'duration':
        return [...tasks].sort((a, b) => 
          (a.estimated_duration || 60) - (b.estimated_duration || 60)
        )
      default:
        return tasks
    }
  }

  const handleCreateTask = async (taskData) => {
    try {
      await taskService.createTask(taskData)
      setShowForm(false)
      loadTasks()
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleApplyTemplate = async (template, type) => {
    if (type !== 'task') return

    try {
      const taskData = {
        title: template.title,
        description: template.description,
        estimated_duration: template.estimated_duration,
        is_essential: template.is_essential
      }

      await taskService.createTask(taskData)
      loadTasks()
    } catch (error) {
      console.error('Error applying template:', error)
    }
  }

  const handleCompleteTask = async (id) => {
    try {
      await taskService.completeTask(id)
      loadTasks()
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const handleDeleteTask = async (id) => {
    try {
      await taskService.deleteTask(id)
      loadTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const filters = [
    { key: 'all', label: 'All Tasks' },
    { key: 'today', label: 'Due Today' },
    { key: 'upcoming', label: 'Upcoming' }
  ]

  const sortOptions = [
    { key: 'priority', label: 'Priority', icon: FiTrendingUp },
    { key: 'due_date', label: 'Due Date', icon: FiFilter },
    { key: 'duration', label: 'Duration', icon: FiFilter }
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-600">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium text-slate-900">Tasks</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiBookOpen} className="w-4 h-4" />
            <span>Templates</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      <TaskLoadAnalysis analysis={analysis} />

      {recommendedTasks.length > 0 && (
        <RecommendedTasks 
          tasks={recommendedTasks}
          onTaskClick={(task) => {
            const element = document.getElementById(`task-${task.id}`)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              element.classList.add('ring-2', 'ring-blue-400')
              setTimeout(() => {
                element.classList.remove('ring-2', 'ring-blue-400')
              }, 2000)
            }
          }}
        />
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiFilter} className="w-5 h-5 text-slate-600" />
          {filters.map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`
                px-3 py-2 rounded-md text-sm transition-colors
                ${filter === filterOption.key 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-100'}
              `}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <span className="text-sm text-slate-600">Sort by:</span>
          {sortOptions.map(option => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key)}
              className={`
                px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-1
                ${sortBy === option.key 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-100'}
              `}
            >
              <SafeIcon icon={option.icon} className="w-4 h-4" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <p className="text-slate-600 mb-4">No tasks found</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                Create your first task
              </button>
              <span className="text-slate-400">or</span>
              <button
                onClick={() => setShowTemplates(true)}
                className="text-purple-600 hover:text-purple-700"
              >
                Browse templates
              </button>
            </div>
          </div>
        ) : (
          tasks.map((task, index) => (
            <motion.div
              key={task.id}
              id={`task-${task.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TaskCard
                task={task}
                onComplete={() => handleCompleteTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
                showPriority={sortBy === 'priority'}
              />
            </motion.div>
          ))
        )}
      </div>

      {showForm && (
        <TaskForm
          onSave={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showTemplates && (
        <TemplateLibrary
          onApplyTemplate={handleApplyTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  )
}

export default TaskList