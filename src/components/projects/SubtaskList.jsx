import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import OperationErrorState from '../../common/OperationErrorState'
import { projectService } from '../../services/projectService'

const { FiCheck, FiPlus, FiTrash2, FiClock } = FiIcons

const SubtaskList = ({
  taskId,
  subtasks,
  onCompleteSubtask,
  showInput,
  onShowInput,
  onHideInput
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [operationError, setOperationError] = useState('')

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return

    setOperationError('')
    try {
      setAdding(true)
      await projectService.createSubtask(taskId, {
        title: newSubtaskTitle.trim()
      })
      setNewSubtaskTitle('')
      if (onHideInput) onHideInput()
      // Parent will reload
    } catch (error) {
      console.error('Error adding subtask:', error)
      setOperationError('We couldn’t confirm that subtask was added. Your subtask title is still here so you can review the list and try again.')
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteSubtask = async (subtaskId) => {
    setOperationError('')
    try {
      await projectService.deleteSubtask(subtaskId)
      // Parent will reload
    } catch (error) {
      console.error('Error deleting subtask:', error)
      setOperationError('We couldn’t confirm that subtask was deleted. It is still shown in the list so you can review the current state before trying again.')
    }
  }

  const handleToggleSubtask = async (subtask) => {
    setOperationError('')
    try {
      if (subtask.is_completed) {
        await projectService.uncompleteSubtask(subtask.id)
      } else {
        await projectService.completeSubtask(subtask.id)
        if (onCompleteSubtask) {
          onCompleteSubtask(subtask.id)
        }
      }
      // Parent will reload
    } catch (error) {
      console.error('Error toggling subtask:', error)
      setOperationError('We couldn’t confirm that subtask’s completion change. Its previous state is still shown here so you can review it and try again.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-slate-200 bg-slate-50 p-4"
    >
      <OperationErrorState message={operationError} onDismiss={() => setOperationError('')} />

      {/* Subtask List */}
      {subtasks.length > 0 && (
        <ul className="space-y-2 mb-3 mt-3" aria-label="Subtasks">
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
                aria-label={`${subtask.is_completed ? 'Mark incomplete' : 'Mark complete'}: ${subtask.title}`}
                aria-pressed={subtask.is_completed}
                className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${
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
                aria-label={`Delete subtask: ${subtask.title}`}
                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" aria-hidden="true" />
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Add Subtask Input */}
      {showInput && (
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
            aria-label="New subtask title"
            placeholder="Enter subtask title..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            autoFocus
            disabled={adding}
          />
          <button
            type="button"
            onClick={handleAddSubtask}
            disabled={!newSubtaskTitle.trim() || adding}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" aria-hidden="true" />
            Add
          </button>
        </div>
      )}

      {/* Add More Button */}
      {!showInput && subtasks.length > 0 && (
        <button
          type="button"
          onClick={() => {
            if (onShowInput) onShowInput()
          }}
          className="w-full px-3 py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" aria-hidden="true" />
          Add Another Subtask
        </button>
      )}
    </motion.div>
  )
}

export default SubtaskList
