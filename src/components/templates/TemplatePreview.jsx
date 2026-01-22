import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiX, FiRefreshCw, FiCheckSquare, FiClock, FiTag, FiPlus, FiEdit3 } = FiIcons

const TemplatePreview = ({ template, onClose, onDirectApply, onEditBeforeApply }) => {
  const isRoutine = template.type === 'routine'

  const totalDuration = isRoutine
    ? template.steps?.reduce((sum, step) => sum + step.duration_minutes, 0)
    : template.estimated_duration

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200">
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
                {isRoutine ? template.name : template.title}
              </h3>
              <p className="text-slate-600">{template.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiTag} className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700 font-medium">
                {template.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <SafeIcon icon={FiClock} className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">
                {totalDuration} minutes total
              </span>
            </div>

            {template.repeat_pattern && (
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiRefreshCw} className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-700 capitalize">
                  {template.repeat_pattern}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Routine Steps */}
          {isRoutine && template.steps && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Steps ({template.steps.length})
              </h4>
              <div className="space-y-2">
                {template.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full text-sm font-medium text-slate-600 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {step.name}
                          </p>
                          {step.description && (
                            <p className="text-xs text-slate-600 mt-1">
                              {step.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-slate-500">
                            {step.duration_minutes} min
                          </span>
                          {step.is_essential && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                              Essential
                            </span>
                          )}
                        </div>
                      </div>
                      {step.preferred_time && (
                        <p className="text-xs text-slate-500 mt-1">
                          Preferred time: {step.preferred_time}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Task Details */}
          {!isRoutine && (
            <div className="space-y-4">
              {template.is_essential && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <SafeIcon icon={FiCheckSquare} className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    This is an essential task
                  </span>
                </div>
              )}

              {template.recurrence && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Recommended frequency:</span>{' '}
                    {template.recurrence}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEditBeforeApply}
              className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <SafeIcon icon={FiEdit3} className="w-4 h-4" />
              Edit First
            </button>
            <button
              onClick={onDirectApply}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              Apply Now
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TemplatePreview