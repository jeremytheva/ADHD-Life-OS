import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { taskRecommender } from '../../services/taskRecommender'
import { taskService } from '../../services/taskService'

const { 
  FiZap, 
  FiTarget, 
  FiCoffee,
  FiSliders,
  FiMapPin,
  FiPackage,
  FiHeart,
  FiClock,
  FiChevronRight,
  FiX
} = FiIcons

const TaskSelector = ({ onSelectTask }) => {
  const [tasks, setTasks] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [userState, setUserState] = useState({
    current_energy: 'medium',
    available_time: 30,
    current_location: '',
    mood: 'neutral'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPath, setSelectedPath] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasksAndRecommendations()
  }, [userState, selectedPath])

  const loadTasksAndRecommendations = async () => {
    try {
      setLoading(true)
      const allTasks = await taskService.getTasks()
      setTasks(allTasks)

      // Get recommendations based on selected path
      let recs = []
      if (selectedPath === 'all') {
        recs = taskRecommender.getRecommendations(allTasks, userState)
      } else {
        recs = taskRecommender.getPathRecommendations(
          allTasks, 
          selectedPath, 
          userState, 
          3
        )
      }

      setRecommendations(recs)
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUserState = (field, value) => {
    setUserState(prev => ({ ...prev, [field]: value }))
  }

  const getPathIcon = (path) => {
    switch (path) {
      case 'quick_win': return FiZap
      case 'momentum': return FiTarget
      case 'brave_frog': return FiCoffee
      default: return FiZap
    }
  }

  const getPathColor = (path) => {
    switch (path) {
      case 'quick_win': return 'from-yellow-400 to-orange-500'
      case 'momentum': return 'from-blue-400 to-indigo-500'
      case 'brave_frog': return 'from-purple-400 to-pink-500'
      default: return 'from-slate-400 to-slate-500'
    }
  }

  const getPathBadgeColor = (path) => {
    switch (path) {
      case 'quick_win': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'momentum': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'brave_frog': return 'bg-purple-100 text-purple-700 border-purple-300'
      default: return 'bg-slate-100 text-slate-700 border-slate-300'
    }
  }

  const pathOptions = [
    { 
      value: 'all', 
      label: 'Smart Mix', 
      icon: FiSliders,
      description: 'Best tasks across all paths' 
    },
    { 
      value: 'quick_win', 
      label: 'Quick Wins', 
      icon: FiZap,
      description: 'Fast & easy dopamine hits' 
    },
    { 
      value: 'momentum', 
      label: 'Momentum', 
      icon: FiTarget,
      description: 'Build productive flow' 
    },
    { 
      value: 'brave_frog', 
      label: 'Brave Frog', 
      icon: FiCoffee,
      description: 'Tackle the tough stuff' 
    }
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Finding your perfect next task...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Path Selection */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">What should I do next?</h2>
            <p className="text-sm text-slate-600 mt-1">
              Smart recommendations based on your current state
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              p-2 rounded-lg transition-colors
              ${showFilters 
                ? 'bg-purple-600 text-white' 
                : 'text-purple-600 hover:bg-purple-100'
              }
            `}
          >
            <SafeIcon icon={FiSliders} className="w-5 h-5" />
          </button>
        </div>

        {/* Path Selection Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {pathOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedPath(option.value)}
              className={`
                p-3 rounded-lg text-left transition-all
                ${selectedPath === option.value
                  ? 'bg-white shadow-md border-2 border-purple-300'
                  : 'bg-white bg-opacity-50 border border-slate-200 hover:bg-white'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <SafeIcon 
                  icon={option.icon} 
                  className={`w-4 h-4 ${
                    selectedPath === option.value ? 'text-purple-600' : 'text-slate-600'
                  }`} 
                />
                <span className={`text-sm font-medium ${
                  selectedPath === option.value ? 'text-purple-900' : 'text-slate-700'
                }`}>
                  {option.label}
                </span>
              </div>
              <p className="text-xs text-slate-600">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* User State Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">Your Current State</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Energy Level */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <SafeIcon icon={FiZap} className="w-4 h-4 inline mr-1" />
                  Energy Level
                </label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(level => (
                    <button
                      key={level}
                      onClick={() => handleUpdateUserState('current_energy', level)}
                      className={`
                        flex-1 px-3 py-2 rounded-lg text-sm transition-colors
                        ${userState.current_energy === level
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }
                      `}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Time */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <SafeIcon icon={FiClock} className="w-4 h-4 inline mr-1" />
                  Available Time
                </label>
                <div className="flex gap-2">
                  {[15, 30, 60, 90].map(time => (
                    <button
                      key={time}
                      onClick={() => handleUpdateUserState('available_time', time)}
                      className={`
                        flex-1 px-3 py-2 rounded-lg text-sm transition-colors
                        ${userState.available_time === time
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }
                      `}
                    >
                      {time}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <SafeIcon icon={FiMapPin} className="w-4 h-4 inline mr-1" />
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={userState.current_location}
                  onChange={(e) => handleUpdateUserState('current_location', e.target.value)}
                  placeholder="e.g., home, office, café"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <SafeIcon icon={FiHeart} className="w-4 h-4 inline mr-1" />
                  Mood
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'motivated', emoji: '🚀' },
                    { value: 'neutral', emoji: '😊' },
                    { value: 'struggling', emoji: '😓' }
                  ].map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => handleUpdateUserState('mood', mood.value)}
                      className={`
                        flex-1 px-3 py-2 rounded-lg text-sm transition-colors
                        ${userState.mood === mood.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }
                      `}
                    >
                      <span className="mr-1">{mood.emoji}</span>
                      {mood.value.charAt(0).toUpperCase() + mood.value.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-slate-900">
            Recommended for You
          </h3>
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg border-2 border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Path Badge Ribbon */}
              <div className={`bg-gradient-to-r ${getPathColor(rec.path)} px-4 py-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <SafeIcon icon={getPathIcon(rec.path)} className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {rec.path === 'quick_win' && 'Quick Win'}
                      {rec.path === 'momentum' && 'Momentum Builder'}
                      {rec.path === 'brave_frog' && 'Brave Frog'}
                    </span>
                  </div>
                  <div className="text-white text-sm">
                    Score: {rec.score}
                  </div>
                </div>
              </div>

              {/* Task Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-slate-900 mb-1">
                      {rec.task.title}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      {rec.reason}
                    </p>
                    {rec.task.description && (
                      <p className="text-sm text-slate-500">
                        {rec.task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Task Metadata */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {rec.task.priority_metadata?.time_required && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs flex items-center gap-1">
                      <SafeIcon icon={FiClock} className="w-3 h-3" />
                      {rec.task.priority_metadata.time_required}m
                    </span>
                  )}
                  {rec.task.priority_metadata?.energy_required && (
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs flex items-center gap-1">
                      <SafeIcon icon={FiZap} className="w-3 h-3" />
                      {rec.task.priority_metadata.energy_required} energy
                    </span>
                  )}
                  {rec.task.priority_metadata?.location && (
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs flex items-center gap-1">
                      <SafeIcon icon={FiMapPin} className="w-3 h-3" />
                      {rec.task.priority_metadata.location}
                    </span>
                  )}
                  {rec.task.is_essential && (
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                      Essential
                    </span>
                  )}
                </div>

                {/* Confidence Indicator */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Match Confidence</span>
                    <span>{Math.round(rec.confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${rec.confidence * 100}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onSelectTask && onSelectTask(rec.task)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Start This Task</span>
                  <SafeIcon icon={FiChevronRight} className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiTarget} className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No recommendations right now
          </h3>
          <p className="text-slate-600">
            Try adjusting your filters or adding more tasks with priority metadata
          </p>
        </div>
      )}
    </div>
  )
}

export default TaskSelector