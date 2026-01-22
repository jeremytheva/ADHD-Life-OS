import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { 
  FiRefreshCw, 
  FiEdit2, 
  FiTrash2, 
  FiClock, 
  FiToggleLeft, 
  FiToggleRight,
  FiPlay,
  FiBarChart2
} = FiIcons

const RoutineCard = ({ routine, onEdit, onDelete, onStart, onViewStats }) => {
  const getRepeatPatternLabel = (pattern) => {
    switch (pattern) {
      case 'daily':
        return 'Daily'
      case 'weekdays':
        return 'Weekdays'
      case 'weekends':
        return 'Weekends'
      default:
        return 'Custom'
    }
  }

  const totalDuration = routine.routine_steps?.reduce(
    (sum, step) => sum + (step.duration_minutes || 0),
    0
  ) || 0

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-lg border border-slate-200 p-6 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <SafeIcon icon={FiRefreshCw} className="w-6 h-6 text-purple-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-slate-900">{routine.name}</h3>
            {routine.description && (
              <p className="text-slate-600 mt-1">{routine.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <SafeIcon
            icon={routine.is_active ? FiToggleRight : FiToggleLeft}
            className={`w-6 h-6 ${
              routine.is_active ? 'text-green-600' : 'text-slate-400'
            }`}
          />
          <button
            onClick={onEdit}
            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <SafeIcon icon={FiEdit2} className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
          >
            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Routine Info */}
      <div className="flex items-center space-x-4 text-sm text-slate-500 mb-4">
        <span>{getRepeatPatternLabel(routine.repeat_pattern)}</span>
        {totalDuration > 0 && (
          <div className="flex items-center space-x-1">
            <SafeIcon icon={FiClock} className="w-4 h-4" />
            <span>{totalDuration} min total</span>
          </div>
        )}
      </div>

      {/* Steps */}
      {routine.routine_steps && routine.routine_steps.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-slate-700">
            Steps ({routine.routine_steps.length}):
          </h4>
          <div className="space-y-1">
            {routine.routine_steps.slice(0, 3).map((step, index) => (
              <div
                key={step.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-600">
                  {index + 1}. {step.name}
                </span>
                {step.duration_minutes && (
                  <span className="text-slate-500">{step.duration_minutes} min</span>
                )}
              </div>
            ))}
            {routine.routine_steps.length > 3 && (
              <p className="text-xs text-slate-500">
                + {routine.routine_steps.length - 3} more steps
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-slate-200">
        <button
          onClick={onViewStats}
          className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
        >
          <SafeIcon icon={FiBarChart2} className="w-4 h-4" />
          <span>Stats</span>
        </button>
        <button
          onClick={onStart}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          <SafeIcon icon={FiPlay} className="w-4 h-4" />
          <span>Start</span>
        </button>
      </div>
    </motion.div>
  )
}

export default RoutineCard