import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import LoadErrorState from '../../common/LoadErrorState'
import OperationErrorState from '../../common/OperationErrorState'
import { projectService } from '../../services/projectService'
import TaskItem from './TaskItem'
import TaskForm from './TaskForm'
import CelebrationModal from '../common/CelebrationModal'

const {
  FiX,
  FiPlus,
  FiTarget,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle
} = FiIcons

const ProjectDetailView = ({ project: initialProject, onClose, onUpdate }) => {
  const [project, setProject] = useState(initialProject)
  const [stats, setStats] = useState(null)
  const [detailLoadError, setDetailLoadError] = useState(false)
  const [operationError, setOperationError] = useState('')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState('')

  useEffect(() => {
    loadProjectDetails()
  }, [initialProject.id])

  const loadProjectDetails = async () => {
    try {
      setDetailLoadError(false)
      const [updatedProject, projectStats] = await Promise.all([
        projectService.getProject(initialProject.id),
        projectService.getProjectStats(initialProject.id)
      ])
      setProject(updatedProject)
      setStats(projectStats)
      return true
    } catch (error) {
      console.error('Error loading project details:', error)
      setDetailLoadError(true)
      return false
    }
  }

  const refreshAfterWrite = async (partialSuccessMessage) => {
    const refreshed = await loadProjectDetails()
    if (!refreshed) {
      setOperationError(partialSuccessMessage)
      return false
    }
    if (onUpdate) onUpdate()
    return true
  }

  const handleAddTask = async (taskData) => {
    setOperationError('')
    try {
      await projectService.createTask(project.id, taskData)
      setShowTaskForm(false)
      await refreshAfterWrite(
        'The task was saved, but the latest project details could not be reloaded. Try refreshing the project before making another change.'
      )
    } catch (error) {
      console.error('Error adding task:', error)
      setOperationError('We couldn’t add this task. Your task form is still open so you can review it and try again.')
    }
  }

  const handleUpdateTask = async (taskId, updates) => {
    setOperationError('')
    try {
      await projectService.updateTask(taskId, updates)
      await refreshAfterWrite(
        'The task update was saved, but the latest project details could not be reloaded. Refresh the project before making another change.'
      )
    } catch (error) {
      console.error('Error updating task:', error)
      setOperationError('We couldn’t update this task. The previous saved task data is still in place.')
    }
  }

  const handleCompleteTask = async (taskId) => {
    setOperationError('')
    try {
      await projectService.completeTask(taskId)
      const refreshed = await refreshAfterWrite(
        'The task may have been completed, but the latest project details could not be confirmed. Refresh the project before relying on its completion state.'
      )
      if (!refreshed) return

      setCelebrationMessage('Nice work on that step! 🎉')
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    } catch (error) {
      console.error('Error completing task:', error)
      setOperationError('We couldn’t complete this task. It has not been confirmed as completed.')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task and all its subtasks?')) return

    setOperationError('')
    try {
      await projectService.deleteTask(taskId)
      await refreshAfterWrite(
        'The task was deleted, but the latest project details could not be reloaded. Refresh the project before making another change.'
      )
    } catch (error) {
      console.error('Error deleting task:', error)
      setOperationError('We couldn’t delete this task. It remains in the project.')
    }
  }

  const handleCompleteSubtask = async (subtaskId) => {
    setOperationError('')
    try {
      await projectService.completeSubtask(subtaskId)
      const refreshed = await refreshAfterWrite(
        'The subtask may have been completed, but the latest project details could not be confirmed. Refresh the project before relying on its completion state.'
      )
      if (!refreshed) return

      setCelebrationMessage('Each small step you do is a quick win! ⭐')
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    } catch (error) {
      console.error('Error completing subtask:', error)
      setOperationError('We couldn’t complete this subtask. It has not been confirmed as completed.')
    }
  }

  const colorClasses = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
    pink: 'from-pink-400 to-pink-600',
    yellow: 'from-yellow-400 to-yellow-600',
    red: 'from-red-400 to-red-600',
    teal: 'from-teal-400 to-teal-600'
  }

  const pendingTasks = project.tasks?.filter(t => t.status !== 'completed') || []
  const completedTasks = project.tasks?.filter(t => t.status === 'completed') || []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className={`bg-gradient-to-r ${colorClasses[project.color]} p-6 text-white`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-4xl">{project.icon}</span>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
                {project.description && (
                  <p className="text-white text-opacity-90">{project.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close project details"
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          {stats && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span className="font-bold">{stats.completion_percentage}% Complete</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completion_percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        {stats && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{stats.total_tasks}</div>
                <div className="text-xs text-slate-600">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed_tasks}</div>
                <div className="text-xs text-slate-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total_subtasks}</div>
                <div className="text-xs text-slate-600">Subtasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.completed_subtasks}</div>
                <div className="text-xs text-slate-600">Done</div>
              </div>
            </div>

            {stats.estimated_time_remaining > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <SafeIcon icon={FiClock} className="w-4 h-4" />
                  <span>~{Math.round(stats.estimated_time_remaining / 60)} hours remaining</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {detailLoadError && (
            <div className="mb-4">
              <LoadErrorState
                title="We couldn’t refresh this project"
                message="The project shown below may be out of date. Try again before making decisions based on its task status."
                onRetry={loadProjectDetails}
              />
            </div>
          )}

          <OperationErrorState
            message={operationError}
            onDismiss={() => setOperationError('')}
          />

          {project.goal && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <SafeIcon icon={FiTarget} className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Project Goal</h3>
              </div>
              <p className="text-blue-800">{project.goal}</p>
            </div>
          )}

          {project.target_date && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiCalendar} className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Target Date:</span>
                <span className="text-purple-800">{new Date(project.target_date).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          <div className="mb-4">
            <button
              onClick={() => {
                setOperationError('')
                setShowTaskForm(true)
              }}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
              Add Task
            </button>
          </div>

          {pendingTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-900 mb-3 flex items-center gap-2">
                <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-blue-600" />
                To Do ({pendingTasks.length})
              </h3>
              <div className="space-y-3">
                {pendingTasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    onComplete={() => handleCompleteTask(task.id)}
                    onDelete={() => handleDeleteTask(task.id)}
                    onUpdate={(updates) => handleUpdateTask(task.id, updates)}
                    onCompleteSubtask={handleCompleteSubtask}
                  />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-3 flex items-center gap-2">
                <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-green-600" />
                Completed ({completedTasks.length})
              </h3>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <SafeIcon
                        icon={FiCheckCircle}
                        className="w-5 h-5 text-green-600 flex-shrink-0"
                      />
                      <span className="text-slate-700 line-through">{task.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingTasks.length === 0 && completedTasks.length === 0 && !detailLoadError && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiPlus} className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks yet</h3>
              <p className="text-slate-600 mb-4">Break this project down into smaller, manageable tasks</p>
              <button
                onClick={() => setShowTaskForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Task
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showTaskForm && (
          <TaskForm
            projectId={project.id}
            task={editingTask}
            onSave={handleAddTask}
            onCancel={() => {
              setShowTaskForm(false)
              setEditingTask(null)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCelebration && (
          <CelebrationModal message={celebrationMessage} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProjectDetailView
