import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../../common/SafeIcon'

const { FiHeart, FiStar, FiZap, FiSmile } = FiIcons

const WelcomeStep = ({ onNext }) => {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <SafeIcon icon={FiHeart} className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Welcome to Your ADHD Life-OS! 🎉
        </h1>
        
        <p className="text-xl text-slate-700 leading-relaxed">
          We're so glad you're here. This isn't just another productivity app—
          <span className="font-semibold text-purple-600"> it's designed specifically for how your brain works</span>.
        </p>
      </motion.div>

      {/* Key Messages */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <SafeIcon icon={FiStar} className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                ADHD is Not a Flaw
              </h3>
              <p className="text-slate-700">
                Your brain is wired differently, and that's perfectly okay. 
                This system celebrates your strengths and supports your challenges—
                no judgment, just support.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <SafeIcon icon={FiZap} className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Built for Your Success
              </h3>
              <p className="text-slate-700">
                Every feature is designed to work <em>with</em> your ADHD, not against it. 
                We focus on dopamine-friendly design, gentle reminders, and celebrating 
                every small win.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <SafeIcon icon={FiSmile} className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Treat Yourself with Kindness
              </h3>
              <p className="text-slate-700">
                This is a shame-free zone. Missed a task? That's okay. 
                Forgot a routine? We'll help you try again tomorrow. 
                Progress over perfection, always.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Setup Promise */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-50 rounded-xl p-6 border border-slate-200"
      >
        <p className="text-slate-700 mb-4">
          <strong>Let's set this up together!</strong> In the next few steps, 
          we'll customize Life-OS to fit your unique life. You can always change 
          these settings later—nothing is permanent.
        </p>
        <p className="text-sm text-slate-600">
          This will only take 2-3 minutes. Ready? 🚀
        </p>
      </motion.div>

      {/* Action Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={() => onNext({})}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Let's Get Started! →
        </button>
      </motion.div>
    </div>
  )
}

export default WelcomeStep