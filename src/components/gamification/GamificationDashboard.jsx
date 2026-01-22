import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { gamificationService } from '../../services/gamificationService'

const { FiTrendingUp, FiAward, FiZap, FiTarget, FiStar, FiX } = FiIcons

const GamificationDashboard = ({ onClose, compact = false }) => {
  const [stats, setStats] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    const userStats = gamificationService.getUserStats()
    const allAchievements = gamificationService.getAllAchievements()
    const levelProgress = gamificationService.getLevelProgress()

    setStats({ ...userStats, ...levelProgress })
    setAchievements(allAchievements)
  }

  if (!stats) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    )
  }

  const earnedAchievements = achievements.filter(a => a.earned)
  const lockedAchievements = achievements.filter(a => !a.earned)

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-4"
      >
        <div className="grid grid-cols-4 gap-3">
          {/* Level */}
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.level}
            </div>
            <div className="text-xs text-slate-600">Level</div>
          </div>

          {/* Points */}
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.points}
            </div>
            <div className="text-xs text-slate-600">Points</div>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
              {stats.current_streak}
              <span className="text-lg">🔥</span>
            </div>
            <div className="text-xs text-slate-600">Day Streak</div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {earnedAchievements.length}
            </div>
            <div className="text-xs text-slate-600">Badges</div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Level {stats.level}</span>
            <span>{stats.xp} / {stats.xp_to_next_level} XP</span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiAward} className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Your Progress</h2>
                <p className="text-purple-100">Level {stats.level} • {stats.points} Points</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          {/* Level Progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Level Progress</span>
              <span>{stats.xp} / {stats.xp_to_next_level} XP</span>
            </div>
            <div className="w-full bg-purple-700 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {['overview', 'achievements', 'stats'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                selectedTab === tab
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Level</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600">{stats.level}</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <SafeIcon icon={FiStar} className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">Points</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-600">{stats.points}</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🔥</span>
                    <span className="text-sm font-medium text-orange-900">Streak</span>
                  </div>
                  <div className="text-3xl font-bold text-orange-600">{stats.current_streak}</div>
                  <div className="text-xs text-orange-700 mt-1">
                    Best: {stats.longest_streak} days
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <SafeIcon icon={FiAward} className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Badges</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {earnedAchievements.length}
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    of {achievements.length}
                  </div>
                </div>
              </div>

              {/* Streak Message */}
              {stats.current_streak > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border-2 border-orange-200"
                >
                  <p className="text-orange-900 text-center font-medium">
                    {gamificationService.getStreakMessage(stats.current_streak)}
                  </p>
                </motion.div>
              )}

              {/* Recent Achievements */}
              {earnedAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">
                    Recent Achievements
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {earnedAchievements.slice(-6).reverse().map(achievement => (
                      <motion.div
                        key={achievement.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-300"
                      >
                        <div className="text-3xl mb-2 text-center">{achievement.icon}</div>
                        <div className="text-sm font-medium text-slate-900 text-center mb-1">
                          {achievement.name}
                        </div>
                        <div className="text-xs text-slate-600 text-center">
                          +{achievement.points} points
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'achievements' && (
            <div className="space-y-6">
              {/* Earned Achievements */}
              {earnedAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">
                    Earned ({earnedAchievements.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {earnedAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-300"
                      >
                        <div className="text-4xl mb-3 text-center">{achievement.icon}</div>
                        <div className="text-center">
                          <div className="font-medium text-slate-900 mb-1">
                            {achievement.name}
                          </div>
                          <div className="text-xs text-slate-600 mb-2">
                            {achievement.description}
                          </div>
                          <div className="text-xs text-yellow-700 font-medium">
                            +{achievement.points} points
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked Achievements */}
              {lockedAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">
                    Locked ({lockedAchievements.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {lockedAchievements.map((achievement, index) => {
                      const progress = gamificationService.getAchievementProgress(achievement.id)
                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200 opacity-60"
                        >
                          <div className="text-4xl mb-3 text-center grayscale">
                            {achievement.icon}
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-slate-900 mb-1">
                              {achievement.name}
                            </div>
                            <div className="text-xs text-slate-600 mb-2">
                              {achievement.description}
                            </div>
                            {progress && (
                              <div className="mb-2">
                                <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                                  <div
                                    className="bg-slate-400 h-1.5 rounded-full"
                                    style={{ width: `${progress.progress}%` }}
                                  />
                                </div>
                                <div className="text-xs text-slate-500">
                                  {progress.current} / {progress.target}
                                </div>
                              </div>
                            )}
                            <div className="text-xs text-slate-500">
                              +{achievement.points} points
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'stats' && (
            <div className="space-y-6">
              {/* Lifetime Stats */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">
                  Lifetime Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {stats.total_tasks_completed}
                    </div>
                    <div className="text-sm text-blue-900">Tasks Completed</div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {stats.total_subtasks_completed}
                    </div>
                    <div className="text-sm text-purple-900">Subtasks Completed</div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {stats.total_projects_completed}
                    </div>
                    <div className="text-sm text-green-900">Projects Completed</div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {stats.longest_streak}
                    </div>
                    <div className="text-sm text-orange-900">Longest Streak</div>
                  </div>
                </div>
              </div>

              {/* Today's Progress */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">
                  Today's Activity
                </h3>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-900">
                      Tasks Completed Today
                    </span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {stats.daily_task_count}
                    </span>
                  </div>
                  {stats.daily_task_count >= 3 && (
                    <p className="text-sm text-indigo-700">
                      🎉 Great job! You're having a productive day!
                    </p>
                  )}
                </div>
              </div>

              {/* Motivational Message */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200 text-center">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-purple-900 font-medium mb-2">
                  Keep up the amazing work!
                </p>
                <p className="text-purple-700 text-sm">
                  Every task completed is a step forward. You're doing great! 💪
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default GamificationDashboard