import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { routineProgressService } from '../../services/routineProgressService'
import { format, parseISO } from 'date-fns'

const { FiX, FiTrendingUp, FiClock, FiCalendar, FiAward, FiActivity } = FiIcons

const RoutineStats = ({ routine, onClose }) => {
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState(30)

  useEffect(() => {
    loadStats()
  }, [routine, timeframe])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [statsData, historyData] = await Promise.all([
        routineProgressService.getRoutineStats(routine.id, timeframe),
        routineProgressService.getRoutineHistory(routine.id, 10)
      ])
      setStats(statsData)
      setHistory(historyData)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Routine Statistics
            </h2>
            <p className="text-slate-600 mt-1">{routine.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        {/* Timeframe Selector */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Show data for:</span>
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setTimeframe(days)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm transition-colors
                  ${timeframe === days
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }
                `}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {stats && stats.total_completions > 0 ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-purple-700 font-medium">
                      Total Completions
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {stats.total_completions}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <SafeIcon icon={FiActivity} className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">
                      Completion Rate
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">
                    {stats.completion_rate}%
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <SafeIcon icon={FiClock} className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-700 font-medium">
                      Avg. Time
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats.average_completion_time}m
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <SafeIcon icon={FiAward} className="w-4 h-4 text-orange-600" />
                    <span className="text-xs text-orange-700 font-medium">
                      Current Streak
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-orange-900">
                    {stats.current_streak} days
                  </p>
                </div>
              </div>

              {/* Recent History */}
              {history.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <SafeIcon icon={FiCalendar} className="w-5 h-5" />
                    Recent Completions
                  </h3>
                  <div className="space-y-2">
                    {history.map((session, index) => {
                      const completedSteps = session.completed_steps.filter(s => !s.skipped).length
                      const skippedSteps = session.completed_steps.filter(s => s.skipped).length
                      const totalSteps = session.total_steps

                      return (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-900">
                              {format(parseISO(session.completed_at), 'MMM d, yyyy')}
                            </span>
                            <span className="text-xs text-slate-500">
                              {format(parseISO(session.completed_at), 'h:mm a')}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-600">
                            <span>
                              ✅ {completedSteps}/{totalSteps} steps completed
                            </span>
                            {skippedSteps > 0 && (
                              <span className="text-slate-500">
                                ⏭️ {skippedSteps} skipped
                              </span>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-2 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                            />
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Insights */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  💡 Insights
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {stats.current_streak >= 7 && (
                    <li>🔥 Amazing! You've maintained a {stats.current_streak}-day streak!</li>
                  )}
                  {stats.completion_rate >= 90 && (
                    <li>⭐ Excellent completion rate! You're very consistent.</li>
                  )}
                  {stats.total_completions >= 30 && (
                    <li>🎯 You've completed this routine {stats.total_completions} times!</li>
                  )}
                  {stats.average_completion_time < 30 && (
                    <li>⚡ You're completing this routine efficiently!</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiCalendar} className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">No data available yet</p>
              <p className="text-sm text-slate-500">
                Complete this routine to start tracking your progress
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default RoutineStats