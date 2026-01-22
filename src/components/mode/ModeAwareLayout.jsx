import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMode } from '../../contexts/ModeContext'

const ModeAwareLayout = ({ children, showModeBanner = true }) => {
  const { currentMode, getModePreferences } = useMode()
  const preferences = getModePreferences(currentMode.id)

  const themeClasses = {
    default: 'bg-slate-50',
    calm: 'bg-blue-50',
    minimal: 'bg-white'
  }

  return (
    <div className={`min-h-screen transition-colors ${themeClasses[preferences.theme]}`}>
      {/* Mode Banner (optional) */}
      <AnimatePresence>
        {showModeBanner && currentMode.id !== 'all' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`bg-gradient-to-r ${currentMode.gradient} text-white`}
          >
            <div className="max-w-7xl mx-auto px-6 py-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentMode.icon}</span>
                <div>
                  <div className="font-medium">
                    {currentMode.label} Mode
                  </div>
                  <div className="text-xs text-white text-opacity-90">
                    Showing only {currentMode.label.toLowerCase()}-related items
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`
        ${preferences.viewMode === 'minimal' ? 'max-w-4xl' : 'max-w-7xl'}
        mx-auto
        transition-all
      `}>
        {children}
      </div>
    </div>
  )
}

export default ModeAwareLayout