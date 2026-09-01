import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiAlertCircle, FiClock } = FiIcons

const TaskLoadAnalysis = ({ analysis }) => {
  if (!analysis) return null

  const { total, critical, high, overdue, dueToday, estimatedTime } = analysis
  const hours = Math.floor(estimatedTime / 60)
  const minutes = estimatedTime % 60
  const attentionCount = overdue + critical

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-slate-200 p-4"
      aria-labelledby="task-load-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="task-load-heading" className="text-sm font-medium text-slate-900">Task Load</h2>
          <p className="mt-1 text-sm text-slate-600">
            {total} active task{total === 1 ? '' : 's'}
            {attentionCount > 0 ? ` · ${attentionCount} need${attentionCount === 1 ? 's' : ''} attention` : ''}
          </p>
        </div>
        <details className="group">
          <summary className="cursor-pointer list-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200">
            View load details
          </summary>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">{total}</div>
                <div className="text-xs text-slate-600">Total Tasks</div>
              </div>

              {critical > 0 && (
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">{critical}</div>
                  <div className="text-xs text-red-600">Critical</div>
                </div>
              )}

              {high > 0 && (
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">{high}</div>
                  <div className="text-xs text-orange-600">High</div>
                </div>
              )}

              {overdue > 0 && (
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{overdue}</div>
                  <div className="text-xs text-red-600">Overdue</div>
                </div>
              )}

              {dueToday > 0 && (
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{dueToday}</div>
                  <div className="text-xs text-blue-600">Due Today</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiClock} className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-900 font-medium">Estimated Time</span>
              </div>
              <div className="text-sm font-bold text-blue-700">
                {hours > 0 && `${hours}h `}
                {minutes}m
              </div>
            </div>

            {(overdue > 0 || critical > 0) && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-xs text-amber-800">
                  {overdue > 0 && <div>• You have {overdue} overdue task{overdue > 1 ? 's' : ''}</div>}
                  {critical > 0 && <div>• {critical} critical task{critical > 1 ? 's' : ''} require immediate attention</div>}
                </div>
              </div>
            )}
          </div>
        </details>
      </div>
    </motion.section>
  )
}

export default TaskLoadAnalysis
