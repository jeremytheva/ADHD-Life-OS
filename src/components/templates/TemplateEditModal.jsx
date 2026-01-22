import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiX, FiSave, FiPlus, FiTrash2, FiRefreshCw, FiCheckSquare } = FiIcons

const TemplateEditModal = ({ template, onClose, onSave }) => {
  const isRoutine = template.type === 'routine'
  
  const [formData, setFormData] = useState(() => {
    if (isRoutine) {
      return {
        name: template.name,
        description: template.description,
        repeat_pattern: template.repeat_pattern,
        is_active: template.is_active,
        steps: template.steps?.map(step => ({ ...step })) || []
      }
    } else {
      return {
        title: template.title,
        description: template.description,
        estimated_duration: template.estimated_duration,
        is_essential: template.is_essential
      }
    }
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleStepChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }))
  }

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          name: '',
          duration_minutes: 30,
          order_index: prev.steps.length,
          is_essential: false
        }
      ]
    }))
  }

  const removeStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((step, i) => ({
        ...step,
        order_index: i
      }))
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData, template.type)
  }

  const totalDuration = isRoutine
    ? formData.steps?.reduce((sum, step) => sum + (step.duration_minutes || 0), 0)
    : formData.estimated_duration

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start gap-4 flex-1">
            <div className={`
              p-3 rounded-lg
              ${isRoutine ? 'bg-purple-100' : 'bg-green-100'}
            `}>
              <SafeIcon 
                icon={isRoutine ? FiRefreshCw : FiCheckSquare} 
                className={`w-6 h-6 ${isRoutine ? 'text-purple-600' : 'text-green-600'}`}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Edit Template Before Applying
              </h3>
              <p className="text-sm text-slate-600">
                Customize this template to fit your needs. Changes won't affect the master template.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded"></div>
                Basic Information
              </h4>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {isRoutine ? 'Routine Name' : 'Task Title'} *
                </label>
                <input
                  type="text"
                  value={isRoutine ? formData.name : formData.title}
                  onChange={(e) => handleChange(isRoutine ? 'name' : 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isRoutine ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Repeat Pattern
                    </label>
                    <select
                      value={formData.repeat_pattern}
                      onChange={(e) => handleChange('repeat_pattern', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Estimated Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.estimated_duration}
                      onChange={(e) => handleChange('estimated_duration', parseInt(e.target.value))}
                      min="5"
                      step="5"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_essential"
                      checked={formData.is_essential}
                      onChange={(e) => handleChange('is_essential', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor="is_essential" className="ml-2 text-sm text-slate-700">
                      Mark as essential
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Routine Steps */}
            {isRoutine && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <div className="w-1 h-4 bg-purple-600 rounded"></div>
                    Routine Steps ({formData.steps?.length || 0})
                  </h4>
                  <button
                    type="button"
                    onClick={addStep}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                    Add Step
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.steps?.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-sm font-medium text-slate-600 flex-shrink-0 border border-slate-300">
                        {index + 1}
                      </div>

                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          placeholder="Step name"
                          value={step.name}
                          onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />

                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <input
                              type="number"
                              placeholder="Duration (min)"
                              value={step.duration_minutes}
                              onChange={(e) => handleStepChange(index, 'duration_minutes', parseInt(e.target.value))}
                              min="1"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`step-essential-${index}`}
                              checked={step.is_essential || false}
                              onChange={(e) => handleStepChange(index, 'is_essential', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            />
                            <label htmlFor={`step-essential-${index}`} className="ml-2 text-sm text-slate-700 whitespace-nowrap">
                              Essential
                            </label>
                          </div>
                        </div>
                      </div>

                      {formData.steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {formData.steps?.length === 0 && (
                  <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="mb-2">No steps added yet</p>
                    <button
                      type="button"
                      onClick={addStep}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Add your first step
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Total Duration: <span className="font-medium">{totalDuration} minutes</span></p>
                {isRoutine && (
                  <p>• Steps: <span className="font-medium">{formData.steps?.length || 0}</span></p>
                )}
                <p>• Category: <span className="font-medium">{template.category}</span></p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                Apply Template
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default TemplateEditModal