import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../../common/SafeIcon'

const { FiCheckCircle, FiArrowRight } = FiIcons

const CompletionStep = ({ onNext }) => {
  useEffect(() => {
    // Optional: Trigger confetti or sound here
  }, [])

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-8">
      {/* Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiCheckCircle} className="w-16 h-16 text-green-600" />
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          You're All Set! 🚀
        </h1>
        <p className="text-xl text-slate-700 leading-relaxed max-w-lg mx-auto">
          Your Life-OS is personalized and ready. Remember, this system is here to 
          <span className="font-semibold text-purple-600"> support you</span>, not judge you.
        </p>
      </motion.div>

      {/* Final Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-blue-50 rounded-xl p-6 border border-blue-200 max-w-lg mx-auto"
      >
        <p className="text-blue-800 font-medium mb-2">💡 One Last Thought</p>
        <p className="text-blue-700 text-sm">
          Don't try to use every feature at once. Start small, maybe with just one routine 
          or a few tasks. Consistency {'>'} Intensity.
        </p>
      </motion.div>

      {/* Launch Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="pt-4"
      >
        <button
          onClick={() => onNext({})}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
        >
          <span>Open My Dashboard</span>
          <SafeIcon icon={FiArrowRight} className="w-6 h-6" />
        </button>
      </motion.div>
    </div>
  )
}

export default CompletionStep