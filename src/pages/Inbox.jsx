import React from 'react'
import { motion } from 'framer-motion'
import { useMode } from '../contexts/ModeContext'
import BrainInbox from '../components/inbox/BrainInbox'

const Inbox = () => {
  const { currentMode } = useMode()

  return (
    <div className="p-6">
      {/* Mode Context Banner */}
      {currentMode.id !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${currentMode.gradient} text-white rounded-lg p-4 mb-6`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentMode.icon}</span>
            <div>
              <div className="font-medium">
                {currentMode.label} Mode Active
              </div>
              <div className="text-xs text-white text-opacity-90">
                Capture {currentMode.label.toLowerCase()}-related thoughts and ideas
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <BrainInbox />
      </motion.div>
    </div>
  )
}

export default Inbox