import React from 'react'
import { motion } from 'framer-motion'
import { useMode } from '../contexts/ModeContext'
import HomeModeTaskContainer from '../components/housework/HomeModeTaskContainer'

const Housework = () => {
  const { currentMode } = useMode()

  return (
    <div className="p-6">
      {/* Mode Context Banner */}
      {currentMode.id !== 'all' && currentMode.id === 'home' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${currentMode.gradient} text-white rounded-lg p-4 mb-6`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">{currentMode.icon}</span>
            <div>
              <div className="font-medium">
                Home Mode Active
              </div>
              <div className="text-xs text-white text-opacity-90">
                Perfect time to tackle household chores!
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <HomeModeTaskContainer />
      </motion.div>
    </div>
  )
}

export default Housework