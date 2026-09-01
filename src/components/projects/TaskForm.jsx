import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import useModalDialog from '../../common/useModalDialog'

const { FiX, FiSave } = FiIcons

const TaskForm = ({ projectId, task = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    estimated_duration: task?.estimated_duration || 30,
    is_essential: task?.is_essential || false
  })
  const [saving, setSaving] = useState(false)
  const titleInputRef = useRef(null)
  const dialogRef = useModalDialog({
    onEscape: saving ? null : onCancel,
    initialFocusRef: titleInputRef
  })
  const titleId = `project-task-title-${projectId}`

  const handleChange = (field, value) => {
    if (saving) return
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return

    setSaving(true)
    try {
      await onSave(formData)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-task-form-title"
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-md"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 id="project-task-form-title" className="text-lg font-bold text-slate-900">
            {task ? 'Edit Task' : 'Add Task'}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Close task form"
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SafeIcon icon={FiX} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" aria-busy={saving ? 'true' : 'false'}>
          <fieldset disabled={saving} className="space-y-4">
            <div>
              <label htmlFor={titleId} className="block text-sm font-medium text-slate-700 mb-2">
                Task Title *
              </label>
              <input
                ref={titleInputRef}
                id={titleId}
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Update resume"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label htmlFor="project-task-description" className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                id="project-task-description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                placeholder="Add details about this task..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="project-task-duration" className="block text-sm font-medium text-slate-700 mb-2">
                Estimated Time (minutes)
              </label>
              <input
                id="project-task-duration"
                type="number"
                value={formData.estimated_duration}
                onChange={(e) =>
                  handleChange('estimated_duration', parseInt(e.target.value))
                }
                min="5"
                step="5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_essential"
                checked={formData.is_essential}
                onChange={(e) => handleChange('is_essential', e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
              />
              <label htmlFor="is_essential" className="ml-2 text-sm text-slate-700">
                Mark as essential
              </label>
            </div>
          </fieldset>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              aria-busy={saving ? 'true' : 'false'}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SafeIcon icon={FiSave} className="w-4 h-4" aria-hidden="true" />
              {saving ? 'Saving...' : `${task ? 'Update' : 'Add'} Task`}
            </button>
          </div>
          <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {saving ? 'Saving project task...' : ''}
          </span>
        </form>
      </motion.div>
    </div>
  )
}

export default TaskForm
