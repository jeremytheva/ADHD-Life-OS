import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import PriorityBadge from './PriorityBadge'

const { FiZap, FiClock } = FiIcons

const RecommendedTasks = ({ tasks, onTaskClick }) => {
  if (!tasks || tasks.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <SafeIcon icon={FiZap} className="w-5 h-5 text-blue-600" />
        <h3 className="text-sm font-medium text-blue-900">Recommended Right Now</h3>
      </div>

      <div className="space-y-2">
        {tasks.map((task, index) => (
          <motion.button
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onTaskClick && onTaskClick(task)}
            className="w-full text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-slate-900 flex-1">{task.title}</h4>
              <PriorityBadge 
                level={task.priorityLevel} 
                score={task.priorityScore}
                urgencyReason={task.urgencyReason}
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <SafeIcon icon={FiClock} className="w-3 h-3" />
                <span>{task.estimated_duration || 60} min</span>
              </div>
              <span>•</span>
              <span>{task.urgencyReason}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-3 text-xs text-blue-700 bg-blue-100 rounded px-3 py-2">
        💡 These tasks are optimal for your current time and energy level
      </div>
    </motion.div>
  )
}

export default RecommendedTasks