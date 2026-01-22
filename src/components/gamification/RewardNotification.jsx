import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiStar, FiAward, FiTrendingUp } = FiIcons

const RewardNotification = ({ reward, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!reward) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      className="fixed top-20 right-6 z-[70] max-w-sm"
    >
      {/* Level Up Notification */}
      {reward.leveled_up && (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-4 rounded-lg shadow-2xl mb-3">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.3, 1.3, 1.3, 1]
              }}
              transition={{ duration: 0.6 }}
              className="text-4xl"
            >
              🎉
            </motion.div>
            <div className="flex-1">
              <div className="text-lg font-bold mb-1">Level Up!</div>
              <div className="text-purple-100">
                You reached Level {reward.level}!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points Notification */}
      <div className="bg-white rounded-lg shadow-2xl border-2 border-yellow-300 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-3">
          <div className="flex items-center gap-2">
            <SafeIcon icon={FiStar} className="w-5 h-5 text-white" />
            <span className="text-white font-bold">
              +{reward.points_awarded} Points!
            </span>
          </div>
        </div>
        <div className="p-4">
          <p className="text-slate-700 mb-2">{reward.reason}</p>
          
          {/* Streak Bonus */}
          {reward.streak > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <span>🔥</span>
              <span>{reward.streak}-day streak bonus!</span>
            </div>
          )}

          {/* Progress to Next Level */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Level {reward.level}</span>
              <span>{reward.xp} / {reward.xp_to_next_level} XP</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(reward.xp / reward.xp_to_next_level) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* New Achievements */}
      {reward.new_achievements && reward.new_achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 space-y-2"
        >
          {reward.new_achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-300 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="text-3xl"
                >
                  {achievement.icon}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <SafeIcon icon={FiAward} className="w-4 h-4 text-yellow-600" />
                    <span className="font-bold text-slate-900">
                      Achievement Unlocked!
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    {achievement.name}
                  </div>
                  <div className="text-xs text-slate-600">
                    {achievement.description}
                  </div>
                  <div className="text-xs text-yellow-700 font-medium mt-1">
                    +{achievement.points} bonus points
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

const RewardNotificationContainer = ({ rewards, onDismiss }) => {
  return (
    <AnimatePresence>
      {rewards.map((reward, index) => (
        <RewardNotification
          key={`reward-${index}`}
          reward={reward}
          onClose={() => onDismiss(index)}
        />
      ))}
    </AnimatePresence>
  )
}

export default RewardNotificationContainer