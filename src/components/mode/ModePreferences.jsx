import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { useMode } from '../../contexts/ModeContext'

const { 
  FiX, FiSave, FiEye, FiEyeOff, FiZap, FiBell, 
  FiMonitor, FiSun, FiMoon 
} = FiIcons

const ModePreferences = ({ modeId, onClose }) => {
  const { getModePreferences, updateModePreferences, allModes } = useMode()
  const mode = allModes.find(m => m.id === modeId)
  const [preferences, setPreferences] = useState(getModePreferences(modeId))

  useEffect(() => {
    setPreferences(getModePreferences(modeId))
  }, [modeId])

  const handleChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    updateModePreferences(modeId, preferences)
    onClose()
  }

  if (!mode) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${mode.gradient} p-6 text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{mode.icon}</div>
              <div>
                <h2 className="text-2xl font-bold">{mode.label} Mode Preferences</h2>
                <p className="text-white text-opacity-90 text-sm mt-1">
                  Customize your {mode.label.toLowerCase()} experience
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiMonitor} className="w-4 h-4" />
                <span>Visual Theme</span>
              </div>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'default', label: 'Default', icon: FiSun },
                { value: 'calm', label: 'Calm', icon: FiMoon },
                { value: 'minimal', label: 'Minimal', icon: FiEye }
              ].map(theme => (
                <button
                  key={theme.value}
                  onClick={() => handleChange('theme', theme.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${preferences.theme === theme.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                    }
                  `}
                >
                  <SafeIcon icon={theme.icon} className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                  <div className="text-sm font-medium text-slate-900">
                    {theme.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiEye} className="w-4 h-4" />
                <span>View Density</span>
              </div>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'detailed', label: 'Detailed', desc: 'Show all information' },
                { value: 'minimal', label: 'Minimal', desc: 'Essential info only' }
              ].map(view => (
                <button
                  key={view.value}
                  onClick={() => handleChange('viewMode', view.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-left
                    ${preferences.viewMode === view.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                    }
                  `}
                >
                  <div className="font-medium text-slate-900 mb-1">
                    {view.label}
                  </div>
                  <div className="text-xs text-slate-600">
                    {view.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Default Sort Order
            </label>
            <select
              value={preferences.sortBy}
              onChange={(e) => handleChange('sortBy', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="priority">Priority</option>
              <option value="due_date">Due Date</option>
              <option value="created">Recently Added</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4">
            {/* Animations */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiZap} className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    Show Animations
                  </div>
                  <div className="text-xs text-slate-600">
                    Enable smooth transitions and effects
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleChange('showAnimations', !preferences.showAnimations)}
                className={`
                  w-12 h-6 rounded-full transition-colors
                  ${preferences.showAnimations ? 'bg-green-500' : 'bg-slate-300'}
                `}
              >
                <div className={`
                  w-5 h-5 bg-white rounded-full shadow-md transition-transform
                  ${preferences.showAnimations ? 'translate-x-6' : 'translate-x-0.5'}
                `} />
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiBell} className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    Mode Notifications
                  </div>
                  <div className="text-xs text-slate-600">
                    Get reminders for this mode
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleChange('showNotifications', !preferences.showNotifications)}
                className={`
                  w-12 h-6 rounded-full transition-colors
                  ${preferences.showNotifications ? 'bg-green-500' : 'bg-slate-300'}
                `}
              >
                <div className={`
                  w-5 h-5 bg-white rounded-full shadow-md transition-transform
                  ${preferences.showNotifications ? 'translate-x-6' : 'translate-x-0.5'}
                `} />
              </button>
            </div>

            {/* Hide Completed */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiEyeOff} className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    Hide Completed Tasks
                  </div>
                  <div className="text-xs text-slate-600">
                    Automatically hide finished items
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleChange('hideCompleted', !preferences.hideCompleted)}
                className={`
                  w-12 h-6 rounded-full transition-colors
                  ${preferences.hideCompleted ? 'bg-green-500' : 'bg-slate-300'}
                `}
              >
                <div className={`
                  w-5 h-5 bg-white rounded-full shadow-md transition-transform
                  ${preferences.hideCompleted ? 'translate-x-6' : 'translate-x-0.5'}
                `} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <SafeIcon icon={FiSave} className="w-4 h-4" />
              Save Preferences
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ModePreferences