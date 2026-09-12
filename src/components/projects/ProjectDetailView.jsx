import React, { useCallback, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import LoadErrorState from '../../common/LoadErrorState'
import OperationErrorState from '../../common/OperationErrorState'
import useModalDialog from '../../common/useModalDialog'
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
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [hasLoadedDetails, setHasLoadedDetails] = useState(false)
  const [operationError, setOperationError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState('')
  const latestDetailRequestRef = useRef(0)
  const mutationOwnerRef = useRef(null)
  const mutationPending = Boolean(pendingAction)

  const claimMutation = (action) => {
    if (mutationOwnerRef.current) return null
    mutationOwnerRef.current = action
    setPendingAction(action)
    return action
  }

  const releaseMutation = (owner) => {
    if (mutationOwnerRef.current !== owner) return
    mutationOwnerRef.current = null
    setPendingAction(null)
  }

  const closeProject = () => {
    if (mutationOwnerRef.current) return
    onClose()
  }

  const openTaskForm = () => {
    if (mutationOwnerRef.current) return
    setOperationError('')
    setShowTaskForm(true)
  }

  const detailDialogRef = useModalDialog({ onEscape: closeProject })

  const loadProjectDetails = useCallback(async () => {
    const requestId = latestDetailRequestRef.current + 1
    latestDetailRequestRef.current = requestId
    setDetailsLoading(true)

    try {
      setDetailLoadError(false)
      const [updatedProject, projectStats] = await Promise.all([
        projectService.getProject(initialProject.id),
        projectService.getProjectStats(initialProject.id)
      ])

      if (requestId !== latestDetailRequestRef.current) return true

      setProject(updatedProject)
      setStats(projectStats)
      setHasLoadedDetails(true)
      return true
    } catch (error) {
      if (requestId !== latestDetailRequestRef.current) return true
      console.error('Error loading project details:', error)
      setDetailLoadError(true)
      return false
    } finally {
      if (requestId === latestDetailRequestRef.current) {
        setDetailsLoading(false)
      }
    }
  }, [initialProject.id])

  useEffect(() => {
    loadProjectDetails()
  }, [loadProjectDetails])

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
    const owner = claimMutation('add-task')
    if (!owner) return
    const acceptedTaskData = { ...taskData }

    setOperationError('')
    try {
      await projectService.createTask(project.id, acceptedTaskData)
      setShowTaskForm(false)
      await refreshAfterWrite(
        'The task was saved, but the latest project details could not be reloaded. Try refreshing the project before making another change.'
      )
    } catch (error) {
      console.error('Error adding task:', error)
      setOperationError('We couldn’t add this task. Your task form is still open so you can review it and try again.')
    } finally {
      releaseMutation(owner)
    }
  }

  const handleUpdateTask = async (taskId, updates) => {
    const owner = claimMutation(`update-task:${taskId}`)
    if (!owner) return
    const acceptedUpdates = { ...updates }

    setOperationError('')
    try {
      await projectService.updateTask(taskId, acceptedUpdates)
      await refreshAfterWrite(
        'The task update was saved, but the latest project details could not be reloaded. Refresh the project before making another change.'
      )
    } catch (error) {
      console.error('Error updating task:', error)
      setOperationError('We couldn’t update this task. The previous saved task data is still in place.')
    } finally {
      releaseMutation(owner)
    }
  }

  const handleCompleteTask = async (taskId) => {
    const owner = claimMutation(`complete-task:${taskId}`)
    if (!owner) return

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
    } finally {
      releaseMutation(owner)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (mutationOwnerRef.current) return
    if (!window.confirm('Delete this task and all its subtasks?')) return
    const owner = claimMutation(`delete-task:${taskId}`)
    if (!owner) return

    setOperationError('')
    try {
      await projectService.deleteTask(taskId)
      await refreshAfterWrite(
        'The task was deleted, but the latest project details could not be reloaded. Refresh the project before making another change.'
      )
    } catch (error) {
      console.error('Error deleting task:', error)
      setOperationError('We couldn’t delete this task. It remains in the project.')
    } finally {
      releaseMutation(owner)
    }
  }

  const handleAddSubtask = async (taskId, title) => {
    const owner = claimMutation(`add-subtask:${taskId}`)
    if (!owner) return false

    setOperationError('')
    try {
      await projectService.createSubtask(taskId, { title })
      await refreshAfterWrite(
        'The subtask was saved, but the latest project details could not be reloaded. Refresh the project before making another change.'
      )
      return true
    } catch (error) {
      console.error('Error adding subtask:', error)
      return false
    } finally {
      releaseMutation(owner)
    }
  }

  const handleDeleteSubtask = async (subtaskId) => {
    const owner = claimMutation(`delete-subtask:${subtaskId}`)
    if (!owner) return false

    setOperationError('')
    try {
      await projectService.deleteSubtask(subtaskId)
      await refreshAfterWrite(
        'The subtask was deleted, but the latest project details could not be reloaded. Refresh the project before making another change.'
      )
      return true
    } catch (error) {
      console.error('Error deleting subtask:', error)
      return false
    } finally {
      releaseMutation(owner)
    }
  }

  const handleToggleSubtask = async (subtask) => {
    const completing = !subtask.is_completed
    const owner = claimMutation(`${completing ? 'complete' : 'uncomplete'}-subtask:${subtask.id}`)
    if (!owner) return false
    const acceptedSubtaskId = subtask.id

    setOperationError('')
    try {
      if (completing) {
        await projectService.completeSubtask(acceptedSubtaskId)
      } else {
        await projectService.uncompleteSubtask(acceptedSubtaskId)
      }

      const refreshed = await refreshAfterWrite(
        completing
          ? 'The subtask may have been completed, but the latest project details could not be confirmed. Refresh the project before relying on its completion state.'
          : 'The subtask may have been marked incomplete, but the latest project details could not be confirmed. Refresh the project before relying on its completion state.'
      )
      if (!refreshed) return true

      if (completing) {
        setCelebrationMessage('Each small step you do is a quick win! ⭐')
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }
      return true
    } catch (error) {
      console.error('Error toggling subtask:', error)
      return false
    } finally {
      releaseMutation(owner)
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
        ref={detailDialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-detail-title"
        aria-hidden={showTaskForm ? 'true' : undefined}
        aria-busy={detailsLoading || mutationPending}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {detailsLoading && (
          <p role="status" aria-live="polite" className="sr-only">
            {hasLoadedDetails ? 'Refreshing project details...' : 'Loading project details...'}
          </p>
        )}
        {mutationPending && (
          <p role="status" aria-live="polite" className="sr-only">
            Updating project tasks...
          </p>
        )}

        <div className={`bg-gradient-to-r ${colorClasses[project.color]} p-6 text-white`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-4xl" aria-hidden="true">{project.icon}</span>
              <div className="flex-1">
                <h2 id="project-detail-title" className="text-2xl font-bold mb-2">{project.title}</h2>
                {project.description && (
                  <p className="text-white text-opacity-90">{project.description}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={closeProject}
              disabled={mutationPending}
              aria-label="Close project details"
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {stats && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span id="project-overall-progress-label">Overall Progress</span>
                <span className="font-bold">{stats.completion_percentage}% Complete</span>
              </div>
              <div
                role="progressbar"
                aria-labelledby="project-overall-progress-label"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(stats.completion_percentage)}
                className="w-full bg-white bg-opacity-30 rounded-full h-3 overflow-hidden"
              >
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
                  <SafeIcon icon={FiClock} className="w-4 h-4" aria-hidden="true" />
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
                <SafeIcon icon={FiTarget} className="w-5 h-5 text-blue-600" aria-hidden="true" />
                <h3 className="font-medium text-blue-900">Project Goal</h3>
              </div>
              <p className="text-blue-800">{project.goal}</p>
            </div>
          )}

          {project.target_date && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiCalendar} className="w-5 h-5 text-purple-600" aria-hidden="true" />
                <span className="font-medium text-purple-900">Target Date:</span>
                <span className="text-purple-800">{new Date(project.target_date).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          <div className="mb-4">
            <button
              type="button"
              disabled={mutationPending}
              onClick={openTaskForm}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" aria-hidden="true" />
              Add Task
            </button>
          </div>

          {pendingTasks.length > 0 && (
            <div className="mb-6">
              <h3 id="project-pending-tasks-heading" className="text-lg font-medium text-slate-900 mb-3 flex items-center gap-2">
                <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-blue-600" aria-hidden="true" />
                To Do ({pendingTasks.length})
              </h3>
              <div role="list" aria-labelledby="project-pending-tasks-heading" className="space-y-3">
                {pendingTasks.map((task, index) => (
                  <div role="listitem" key={task.id}>
                    <TaskItem
                      task={task}
                      index={index}
                      pending={mutationPending}
                      onComplete={() => handleCompleteTask(task.id)}
                      onDelete={() => handleDeleteTask(task.id)}
                      onUpdate={(updates) => handleUpdateTask(task.id, updates)}
                      onAddSubtask={handleAddSubtask}
                      onDeleteSubtask={handleDeleteSubtask}
                      onToggleSubtask={handleToggleSubtask}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <h3 id="project-completed-tasks-heading" className="text-lg font-medium text-slate-900 mb-3 flex items-center gap-2">
                <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-green-600" aria-hidden="true" />
                Completed ({completedTasks.length})
              </h3>
              <div role="list" aria-labelledby="project-completed-tasks-heading" className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    role="listitem"
                    className="p-3 bg-green-50 border border-green-200 rounded-lg opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <SafeIcon
                        icon={FiCheckCircle}
                        className="w-5 h-5 text-green-600 flex-shrink-0"
                        aria-hidden="true"
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
                <SafeIcon icon={FiPlus} className="w-8 h-8 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks yet</h3>
              <p className="text-slate-600 mb-4">Break this project down into smaller, manageable tasks</p>
              <button
                type="button"
                disabled={mutationPending}
                onClick={openTaskForm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
              if (mutationOwnerRef.current) return
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