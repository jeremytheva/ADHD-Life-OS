import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import useModalDialog from '../../common/useModalDialog'

const { FiX, FiSave } = FiIcons

const PROJECT_COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500' }
]

const ICONS = ['📁', '🎯', '💼', '🏠', '📚', '💪', '🎨', '🚀', '⭐', '🔥', '💡', '📦']

const ProjectForm = ({ project = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    color: project?.color || 'blue',
    icon: project?.icon || '📁',
    goal: project?.goal || '',
    target_date: project?.target_date || ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const submitOwnerRef = useRef(null)
  const titleInputRef = useRef(null)

  const handleCancel = () => {
    if (submitOwnerRef.current) return
    onCancel()
  }

  const dialogRef = useModalDialog({ onEscape: handleCancel, initialFocusRef: titleInputRef })

  const handleChange = (field, value) => {
    if (submitOwnerRef.current) return
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitOwnerRef.current) return

    const owner = Symbol('project-form-submit')
    submitOwnerRef.current = owner
    const submittedProject = { ...formData }
    setIsSaving(true)

    try {
      await onSave(submittedProject)
    } finally {
      if (submitOwnerRef.current === owner) {
        submitOwnerRef.current = null
        setIsSaving(false)
      }
    }
  }

  const dialogTitle = project ? 'Edit Project' : 'New Project'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        aria-busy={isSaving ? 'true' : 'false'}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h3 id="project-form-title" className="text-lg font-bold text-slate-900">
            {dialogTitle}
          </h3>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Close project form"
            disabled={isSaving}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SafeIcon icon={FiX} className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="project-title" className="block text-sm font-medium text-slate-700 mb-2">
              Project Title *
            </label>
            <input
              ref={titleInputRef}
              id="project-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Organize Home"
              disabled={isSaving}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              id="project-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              placeholder="What is this project about?"
              disabled={isSaving}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="project-goal" className="block text-sm font-medium text-slate-700 mb-2">
              Project Goal
            </label>
            <textarea
              id="project-goal"
              value={formData.goal}
              onChange={(e) => handleChange('goal', e.target.value)}
              rows={2}
              placeholder="What do you want to achieve?"
              disabled={isSaving}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="project-target-date" className="block text-sm font-medium text-slate-700 mb-2">
              Target Date (Optional)
            </label>
            <input
              id="project-target-date"
              type="date"
              value={formData.target_date}
              onChange={(e) => handleChange('target_date', e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <fieldset disabled={isSaving}>
            <legend className="block text-sm font-medium text-slate-700 mb-3">
              Choose Color
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleChange('color', color.value)}
                  aria-pressed={formData.color === color.value}
                  className={`p-3 rounded-lg border-2 transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    formData.color === color.value
                      ? 'border-slate-900 ring-2 ring-slate-300'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-full h-8 rounded ${color.class}`}></div>
                  <span className="text-xs text-slate-600 mt-1 block">
                    {color.label}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset disabled={isSaving}>
            <legend className="block text-sm font-medium text-slate-700 mb-3">
              Choose Icon
            </legend>
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleChange('icon', icon)}
                  aria-label={`Choose ${icon} project icon`}
                  aria-pressed={formData.icon === icon}
                  className={`p-3 rounded-lg border-2 text-2xl transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    formData.icon === icon
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              aria-busy={isSaving ? 'true' : 'false'}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SafeIcon icon={FiSave} className="w-4 h-4" aria-hidden="true" />
              {isSaving ? 'Saving…' : `${project ? 'Update' : 'Create'} Project`}
            </button>
          </div>
          <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {isSaving ? `Saving ${project ? 'project changes' : 'project'}...` : ''}
          </span>
        </form>
      </motion.div>
    </div>
  )
}

export default ProjectForm
