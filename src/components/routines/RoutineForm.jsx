import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import useModalDialog from '../../common/useModalDialog'

const { FiX, FiPlus, FiTrash2 } = FiIcons

const RoutineForm = ({ routine = null, onSave, onCancel }) => {
  const nameInputRef = useRef(null)
  const addStepButtonRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const dialogRef = useModalDialog({
    onEscape: saving ? null : onCancel,
    initialFocusRef: nameInputRef
  })
  const [formData, setFormData] = useState({
    name: routine?.name || '',
    description: routine?.description || '',
    repeat_pattern: routine?.repeat_pattern || 'daily',
    is_active: routine?.is_active ?? true
  })

  const [steps, setSteps] = useState(
    routine?.routine_steps || [{ name: '', duration_minutes: 30, order_index: 0 }]
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return

    setSaving(true)
    try {
      await onSave({ ...formData, steps })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleStepChange = (index, field, value) => {
    setSteps(prev => prev.map((step, i) =>
      i === index ? { ...step, [field]: value, order_index: i } : step
    ))
  }

  const addStep = () => {
    if (saving) return
    setSteps(prev => [...prev, {
      name: '',
      duration_minutes: 30,
      order_index: prev.length
    }])
  }

  const removeStep = (index) => {
    if (saving) return
    setSteps(prev => prev.filter((_, i) => i !== index))
    addStepButtonRef.current?.focus()
  }

  const title = routine ? 'Edit Routine' : 'New Routine'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="routine-form-title"
        aria-busy={saving ? 'true' : 'false'}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 id="routine-form-title" className="text-lg font-medium text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label={`Close ${title}`}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SafeIcon icon={FiX} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6" aria-busy={saving ? 'true' : 'false'}>
          <div className="space-y-4">
            <div>
              <label htmlFor="routine-name" className="block text-sm font-medium text-slate-700 mb-2">
                Name *
              </label>
              <input
                ref={nameInputRef}
                id="routine-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="routine-description" className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                id="routine-description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="routine-repeat-pattern" className="block text-sm font-medium text-slate-700 mb-2">
                Repeat Pattern
              </label>
              <select
                id="routine-repeat-pattern"
                value={formData.repeat_pattern}
                onChange={(e) => handleChange('repeat_pattern', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-slate-700">
                Active routine
              </label>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-slate-700">Steps</h3>
              <button
                ref={addStepButtonRef}
                type="button"
                onClick={addStep}
                disabled={saving}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-md">
                  <span className="text-sm text-slate-500 w-6">{index + 1}.</span>

                  <input
                    type="text"
                    aria-label={`Step ${index + 1} name`}
                    placeholder="Step name"
                    value={step.name}
                    onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  <input
                    type="number"
                    aria-label={`Step ${index + 1} duration in minutes`}
                    placeholder="Minutes"
                    value={step.duration_minutes}
                    onChange={(e) => handleStepChange(index, 'duration_minutes', parseInt(e.target.value))}
                    min="1"
                    className="w-20 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      disabled={saving}
                      aria-label={`Remove step ${index + 1}`}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 bg-slate-100 text-slate-700 py-2 px-4 rounded-md hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              aria-busy={saving ? 'true' : 'false'}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : routine ? 'Update' : 'Create'}
            </button>
          </div>
          <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {saving ? 'Saving routine...' : ''}
          </span>
        </form>
      </motion.div>
    </div>
  )
}

export default RoutineForm