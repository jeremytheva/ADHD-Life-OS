import React from 'react'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import PriorityBadge from './PriorityBadge'

const { FiCheck, FiClock, FiTrash2, FiAlertCircle } = FiIcons

const TaskCard = ({ task, onComplete, onDelete, showPriority = false }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()
  const isDueToday = task.due_date && format(new Date(task.due_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`
        bg-white rounded-lg border p-4 transition-all duration-200
        ${isOverdue ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}
        ${isDueToday ? 'border-blue-300 bg-blue-50' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={onComplete}
            className="p-1 text-slate-400 hover:text-green-600 transition-colors mt-1"
          >
            <SafeIcon icon={FiCheck} className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <div className="flex items-start gap-2 mb-1">
              <h3 className="font-medium text-slate-900 flex-1">{task.title}</h3>
              {showPriority && task.priorityScore && (
                <PriorityBadge 
                  level={task.priorityLevel} 
                  score={task.priorityScore}
                  urgencyReason={task.urgencyReason}
                />
              )}
            </div>

            {task.description && (
              <p className="text-sm text-slate-600 mb-2">{task.description}</p>
            )}

            <div className="flex items-center space-x-4 text-sm text-slate-500">
              {task.estimated_duration && (
                <div className="flex items-center space-x-1">
                  <SafeIcon icon={FiClock} className="w-4 h-4" />
                  <span>{task.estimated_duration} min</span>
                </div>
              )}

              {task.due_date && (
                <div className="flex items-center space-x-1">
                  <SafeIcon 
                    icon={isOverdue ? FiAlertCircle : FiClock} 
                    className={`w-4 h-4 ${isOverdue ? 'text-amber-600' : ''}`} 
                  />
                  <span className={isOverdue ? 'text-amber-600 font-medium' : ''}>
                    Due {format(parseISO(task.due_date), 'MMM d')}
                  </span>
                </div>
              )}

              {task.is_essential && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  Essential
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
        >
          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default TaskCard