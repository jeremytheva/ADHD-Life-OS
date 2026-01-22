import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../../common/SafeIcon'

const { 
  FiCheckSquare, 
  FiRefreshCw, 
  FiHome, 
  FiCalendar, 
  FiTrendingUp,
  FiInbox,
  FiToggleLeft,
  FiToggleRight,
  FiInfo
} = FiIcons

const MODULES = [
  {
    id: 'tasks',
    name: 'Tasks',
    description: 'Manage your to-dos with ADHD-friendly prioritization',
    icon: FiCheckSquare,
    benefits: [
      'Smart task recommendations',
      'Dopamine path suggestions',
      'No-shame overdue handling'
    ],
    isCore: true,
    color: 'green'
  },
  {
    id: 'routines',
    name: 'Routines',
    description: 'Build consistent daily and weekly routines',
    icon: FiRefreshCw,
    benefits: [
      'Step-by-step guidance',
      'Progress tracking',
      'Flexible scheduling'
    ],
    isCore: true,
    color: 'purple'
  },
  {
    id: 'housework',
    name: 'Housework',
    description: 'Keep your space tidy without overwhelm',
    icon: FiHome,
    benefits: [
      'Pre-built task templates',
      'Balanced weekly load',
      'Celebration feedback'
    ],
    isCore: false,
    color: 'blue'
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Visual daily schedule with time blocking',
    icon: FiCalendar,
    benefits: [
      'Auto-scheduled tasks',
      'Color-coded blocks',
      'Buffer time included'
    ],
    isCore: false,
    color: 'indigo'
  },
  {
    id: 'habits',
    name: 'Habit Tracking',
    description: 'Build positive habits one day at a time',
    icon: FiTrendingUp,
    benefits: [
      'Streak tracking',
      'Visual progress',
      'Gentle reminders'
    ],
    isCore: false,
    color: 'amber',
    comingSoon: true
  },
  {
    id: 'inbox',
    name: 'Brain Inbox',
    description: 'Capture thoughts and ideas before they disappear',
    icon: FiInbox,
    benefits: [
      'Quick capture',
      'Process later',
      'Reduce mental load'
    ],
    isCore: false,
    color: 'pink',
    comingSoon: true
  }
]

const ModulesStep = ({ onNext, onBack, currentData }) => {
  const [enabledModules, setEnabledModules] = useState(
    currentData.enabledModules || ['tasks', 'routines']
  )

  const toggleModule = (moduleId) => {
    const module = MODULES.find(m => m.id === moduleId)
    
    // Can't disable core modules
    if (module.isCore) return
    
    setEnabledModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const handleNext = () => {
    onNext({ enabledModules })
  }

  const getColorClasses = (color, isEnabled) => {
    const colors = {
      green: isEnabled ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white',
      purple: isEnabled ? 'border-purple-400 bg-purple-50' : 'border-slate-200 bg-white',
      blue: isEnabled ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white',
      indigo: isEnabled ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white',
      amber: isEnabled ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white',
      pink: isEnabled ? 'border-pink-400 bg-pink-50' : 'border-slate-200 bg-white'
    }
    return colors[color] || colors.green
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          Choose your tools 🛠️
        </h2>
        <p className="text-lg text-slate-600">
          Enable the modules that fit your needs. Don't worry—
          <span className="font-medium text-purple-600"> you can always change this later!</span>
        </p>
      </div>

      {/* Core Modules (Always Enabled) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold text-slate-900">Core Modules</h3>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            Always Enabled
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULES.filter(m => m.isCore).map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-6 rounded-xl border-2 transition-all
                ${getColorClasses(module.color, true)}
                shadow-md
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-${module.color}-500 rounded-lg flex items-center justify-center`}>
                    <SafeIcon icon={module.icon} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{module.name}</h4>
                  </div>
                </div>
                <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                </div>
              </div>
              
              <p className="text-slate-700 mb-3">{module.description}</p>
              
              <ul className="space-y-1">
                {module.benefits.map((benefit, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Optional Modules */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold text-slate-900">Optional Modules</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            Toggle On/Off
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULES.filter(m => !m.isCore).map((module, index) => {
            const isEnabled = enabledModules.includes(module.id)
            
            return (
              <motion.button
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 2) * 0.1 }}
                onClick={() => !module.comingSoon && toggleModule(module.id)}
                disabled={module.comingSoon}
                className={`
                  p-6 rounded-xl border-2 transition-all text-left
                  ${getColorClasses(module.color, isEnabled)}
                  ${module.comingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'}
                  ${isEnabled ? 'shadow-md' : 'hover:border-purple-300'}
                `}
              >
                {module.comingSoon && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      Coming Soon
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-${module.color}-500 rounded-lg flex items-center justify-center`}>
                      <SafeIcon icon={module.icon} className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{module.name}</h4>
                    </div>
                  </div>
                  
                  {!module.comingSoon && (
                    <motion.div
                      animate={{
                        backgroundColor: isEnabled ? '#10b981' : '#cbd5e1'
                      }}
                      className="w-12 h-6 rounded-full flex items-center px-1"
                    >
                      <motion.div
                        animate={{
                          x: isEnabled ? 20 : 0
                        }}
                        className="w-5 h-5 bg-white rounded-full shadow-sm"
                      />
                    </motion.div>
                  )}
                </div>
                
                <p className="text-slate-700 mb-3">{module.description}</p>
                
                <ul className="space-y-1">
                  {module.benefits.map((benefit, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                      <span className={isEnabled ? 'text-green-500' : 'text-slate-400'}>✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-start gap-3">
        <SafeIcon icon={FiInfo} className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">💡 Helpful Tip</p>
          <p>
            Start with just a few modules and add more as you get comfortable. 
            Less is often more when you're building new habits!
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-6">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

export default ModulesStep