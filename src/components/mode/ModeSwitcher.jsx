import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { useMode, MODES } from '../../contexts/ModeContext'

const { FiChevronDown, FiSettings, FiCheck } = FiIcons

const ModeSwitcher = ({ showLabel = true, size = 'default' }) => {
  const { currentMode, allModes, switchMode, getModeStats } = useMode()
  const [isOpen, setIsOpen] = useState(false)
  const [showStats, setShowStats] = useState(false)

  const stats = getModeStats()

  const handleModeSelect = (modeId) => {
    switchMode(modeId)
    setIsOpen(false)
  }

  const sizeClasses = {
    small: 'text-sm px-3 py-1.5',
    default: 'text-base px-4 py-2',
    large: 'text-lg px-5 py-3'
  }

  return (
    <div className="relative">
      {/* Current Mode Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          bg-gradient-to-r ${currentMode.gradient}
          text-white rounded-lg
          hover:shadow-lg transition-all
          flex items-center gap-2
          ${sizeClasses[size]}
        `}
      >
        <span className="text-lg">{currentMode.icon}</span>
        {showLabel && (
          <>
            <span className="font-medium">{currentMode.label}</span>
            <SafeIcon 
              icon={FiChevronDown} 
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-50"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">Switch Context</h3>
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="p-1 text-slate-600 hover:text-slate-900 rounded transition-colors"
                  >
                    <SafeIcon icon={FiSettings} className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Choose your current focus area
                </p>
              </div>

              {/* Stats (if shown) */}
              {showStats && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-blue-50 px-4 py-3 border-b border-blue-200"
                >
                  <div className="text-xs text-blue-900">
                    <div className="font-medium mb-1">Last 24 hours:</div>
                    <div className="space-y-1">
                      <div>Switches: {stats.totalSwitches}</div>
                      {stats.mostUsedMode && (
                        <div>
                          Most used: {MODES[stats.mostUsedMode.toUpperCase()]?.label}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Mode List */}
              <div className="max-h-96 overflow-y-auto">
                {allModes.map((mode, index) => {
                  const isActive = currentMode.id === mode.id
                  const usageCount = stats.modeCounts[mode.id] || 0

                  return (
                    <motion.button
                      key={mode.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleModeSelect(mode.id)}
                      className={`
                        w-full px-4 py-3 text-left
                        hover:bg-slate-50 transition-colors
                        border-b border-slate-100 last:border-b-0
                        ${isActive ? 'bg-slate-100' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-lg
                          bg-gradient-to-br ${mode.gradient}
                          flex items-center justify-center
                          text-xl
                        `}>
                          {mode.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">
                              {mode.label}
                            </span>
                            {isActive && (
                              <SafeIcon 
                                icon={FiCheck} 
                                className="w-4 h-4 text-green-600"
                              />
                            )}
                            {usageCount > 0 && (
                              <span className="text-xs text-slate-500">
                                ({usageCount}x today)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {mode.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer Tip */}
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-200">
                <p className="text-xs text-slate-600 text-center">
                  💡 Switching modes filters your view to relevant items only
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ModeSwitcher