import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiGift, FiX } = FiIcons

const AdaptiveRewardSuggestion = ({ reward, onClose, onClaim }) => {
  if (!reward) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed top-20 right-6 z-[70] max-w-sm"
    >
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg shadow-2xl border-2 border-yellow-300 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiGift} className="w-5 h-5" />
              <span className="font-bold">Reward Time!</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <SafeIcon icon={FiX} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-amber-900 font-medium mb-4">{reward.message}</p>

          {/* Suggested Rewards */}
          {reward.suggestions && reward.suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-amber-700 mb-2">Suggested rewards:</p>
              {reward.suggestions.map((suggestion, index) => (
                suggestion && (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onClaim && onClaim(suggestion)}
                    className="w-full p-3 bg-white rounded-lg border-2 border-yellow-300 hover:border-yellow-400 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{suggestion.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{suggestion.name}</div>
                        <div className="text-xs text-slate-600">{suggestion.description}</div>
                      </div>
                      <div className="text-yellow-600 font-bold text-sm">
                        💰 {suggestion.cost}
                      </div>
                    </div>
                  </motion.button>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const AdaptiveRewardContainer = ({ rewards, onDismiss, onClaim }) => {
  return (
    <AnimatePresence>
      {rewards.map((reward, index) => (
        <AdaptiveRewardSuggestion
          key={`reward-${index}`}
          reward={reward}
          onClose={() => onDismiss(index)}
          onClaim={(suggestion) => {
            onClaim(suggestion)
            onDismiss(index)
          }}
        />
      ))}
    </AnimatePresence>
  )
}

export default AdaptiveRewardContainer