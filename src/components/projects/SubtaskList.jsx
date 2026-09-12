import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import OperationErrorState from '../../common/OperationErrorState'

const { FiCheck, FiPlus, FiTrash2, FiClock } = FiIcons

const SubtaskList = ({
  taskId,
  subtasks,
  pending = false,
  onAddSubtask,
  onDeleteSubtask,
  onToggleSubtask,
  showInput,
  onShowInput,
  onHideInput
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [localPendingAction, setLocalPendingAction] = useState(null)
  const [operationError, setOperationError] = useState('')
  const mutationOwnerRef = useRef(null)
  const mutationPending = pending || Boolean(localPendingAction)

  const claimMutation = (action) => {
    if (mutationOwnerRef.current || pending) return null
    const owner = { action }
    mutationOwnerRef.current = owner
    setLocalPendingAction(action)
    return owner
  }

  const releaseMutation = (owner) => {
    if (mutationOwnerRef.current !== owner) return
    mutationOwnerRef.current = null
    setLocalPendingAction(null)
  }

  const handleTitleChange = (value) => {
    if (mutationOwnerRef.current || pending) return
    setNewSubtaskTitle(value)
  }

  const handleShowInput = () => {
    if (mutationOwnerRef.current || pending) return
    if (onShowInput) onShowInput()
  }

  const handleAddSubtask = async () => {
    const acceptedTitle = newSubtaskTitle.trim()
    if (!acceptedTitle || !onAddSubtask) return
    const owner = claimMutation(`add:${taskId}`)
    if (!owner) return

    setOperationError('')
    try {
      const saved = await onAddSubtask(taskId, acceptedTitle)
      if (!saved) {
        setOperationError('We couldn’t confirm that subtask was added. Your subtask title is still here so you can review the list and try again.')
        return
      }

      setNewSubtaskTitle('')
      if (onHideInput) onHideInput()
    } finally {
      releaseMutation(owner)
    }
  }

  const handleDeleteSubtask = async (subtaskId) => {
    if (!onDeleteSubtask) return
    const owner = claimMutation(`delete:${subtaskId}`)
    if (!owner) return

    setOperationError('')
    try {
      const deleted = await onDeleteSubtask(subtaskId)
      if (!deleted) {
        setOperationError('We couldn’t confirm that subtask was deleted. It is still shown in the list so you can review the current state before trying again.')
      }
    } finally {
      releaseMutation(owner)
    }
  }

  const handleToggleSubtask = async (subtask) => {
    if (!onToggleSubtask) return
    const owner = claimMutation(`toggle:${subtask.id}`)
    if (!owner) return

    setOperationError('')
    try {
      const updated = await onToggleSubtask(subtask)
      if (!updated) {
        setOperationError('We couldn’t confirm that subtask’s completion change. Its previous state is still shown here so you can review it and try again.')
      }
    } finally {
      releaseMutation(owner)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      aria-busy={mutationPending}
      className="border-t border-slate-200 bg-slate-50 p-4"
    >
      {operationError && (
        <div className="mb-3">
          <OperationErrorState message={operationError} onDismiss={() => setOperationError('')} />
        </div>
      )}

      {/* Subtask List */}
      {subtasks.length > 0 && (
        <ul className="space-y-2 mb-3" aria-label="Subtasks">
          {subtasks.map((subtask, index) => (
            <motion.li
              key={subtask.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                subtask.is_completed
                  ? 'bg-green-100 border border-green-300'
                  : 'bg-white border border-slate-200 hover:border-purple-300'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggleSubtask(subtask)}
                disabled={mutationPending}
                aria-label={`${subtask.is_completed ? 'Mark incomplete' : 'Mark complete'}: ${subtask.title}`}
                aria-pressed={subtask.is_completed}
                className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  subtask.is_completed
                    ? 'bg-green-500'
                    : 'bg-slate-200 hover:bg-purple-200'
                }`}
              >
                {subtask.is_completed && (
                  <SafeIcon icon={FiCheck} className="w-3 h-3 text-white" aria-hidden="true" />
                )}
              </button>

              <div className="flex-1">
                <span
                  className={`text-sm ${
                    subtask.is_completed
                      ? 'text-green-900 line-through'
                      : 'text-slate-900'
                  }`}
                >
                  {subtask.title}
                </span>
                {subtask.estimated_duration && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <SafeIcon icon={FiClock} className="w-3 h-3" aria-hidden="true" />
                    <span>{subtask.estimated_duration} min</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDeleteSubtask(subtask.id)}
                disabled={mutationPending}
                aria-label={`Delete subtask: ${subtask.title}`}
                className="p-1 text-slate-400 hover:text-red-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" aria-hidden="true" />
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Add Subtask Input */}
      {showInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
            aria-label="New subtask title"
            placeholder="Enter subtask title..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            autoFocus
            disabled={mutationPending}
          />
          <button
            type="button"
            onClick={handleAddSubtask}
            disabled={!newSubtaskTitle.trim() || mutationPending}
            aria-busy={localPendingAction?.startsWith('add:') || undefined}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" aria-hidden="true" />
            {localPendingAction?.startsWith('add:') ? 'Adding…' : 'Add'}
          </button>
        </div>
      )}

      {/* Add More Button */}
      {!showInput && subtasks.length > 0 && (
        <button
          type="button"
          disabled={mutationPending}
          onClick={handleShowInput}
          className="w-full px-3 py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" aria-hidden="true" />
          Add Another Subtask
        </button>
      )}

      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {localPendingAction ? 'Updating subtasks...' : ''}
      </span>
    </motion.div>
  )
}

export default SubtaskList
