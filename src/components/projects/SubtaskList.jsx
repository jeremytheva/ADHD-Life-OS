import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { projectService } from '../../services/projectService'

const { FiCheck, FiPlus, FiTrash2, FiClock } = FiIcons

const SubtaskList = ({
  taskId,
  subtasks,
  onCompleteSubtask,
  showInput,
  onHideInput
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return

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
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await projectService.deleteSubtask(subtaskId)
      // Parent will reload
    } catch (error) {
      console.error('Error deleting subtask:', error)
    }
  }

  const handleToggleSubtask = async (subtask) => {
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
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-slate-200 bg-slate-50 p-4"
    >
      {/* Subtask List */}
      {subtasks.length > 0 && (
        <div className="space-y-2 mb-3">
          {subtasks.map((subtask, index) => (
            <motion.div
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
                onClick={() => handleToggleSubtask(subtask)}
                className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  subtask.is_completed
                    ? 'bg-green-500'
                    : 'bg-slate-200 hover:bg-purple-200'
                }`}
              >
                {subtask.is_completed && (
                  <SafeIcon icon={FiCheck} className="w-3 h-3 text-white" />
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
                    <SafeIcon icon={FiClock} className="w-3 h-3" />
                    <span>{subtask.estimated_duration} min</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDeleteSubtask(subtask.id)}
                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Subtask Input */}
      {showInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
            placeholder="Enter subtask title..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            autoFocus
            disabled={adding}
          />
          <button
            onClick={handleAddSubtask}
            disabled={!newSubtaskTitle.trim() || adding}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Add
          </button>
        </div>
      )}

      {/* Add More Button */}
      {!showInput && subtasks.length > 0 && (
        <button
          onClick={() => {
            if (onHideInput) onHideInput()
            // This will trigger parent to show input
          }}
          className="w-full px-3 py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          Add Another Subtask
        </button>
      )}
    </motion.div>
  )
}

export default SubtaskList