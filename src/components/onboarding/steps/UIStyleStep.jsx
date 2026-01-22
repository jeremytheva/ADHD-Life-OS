import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../../common/SafeIcon'

const { FiLayout, FiList, FiTarget, FiCheck } = FiIcons

const UI_STYLES = [
  {
    id: 'visual',
    name: 'Visual & Engaging',
    description: 'Rich colors, clear icons, and visual progress tracking. Great for maintaining interest.',
    icon: FiLayout,
    color: 'purple',
    features: ['Color-coded categories', 'Progress bars', 'Emoji support']
  },
  {
    id: 'minimal',
    name: 'Clean & Minimal',
    description: 'Reduced noise and distractions. Just the essentials to help you focus.',
    icon: FiList,
    color: 'slate',
    features: ['Simple lists', 'Monochrome accents', 'Low visual noise']
  },
  {
    id: 'gamified',
    name: 'Gamified',
    description: 'Turn life into a game. Earn XP, streaks, and rewards for completing tasks.',
    icon: FiTarget,
    color: 'orange',
    features: ['XP & Levels', 'Streak tracking', 'Celebration animations']
  }
]

const UIStyleStep = ({ onNext, onBack, currentData }) => {
  const [selectedStyle, setSelectedStyle] = useState(currentData.uiStyle || 'visual')

  const handleNext = () => {
    onNext({ uiStyle: selectedStyle })
  }

  const getColorClasses = (color, isSelected) => {
    const colors = {
      purple: isSelected 
        ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200' 
        : 'bg-white border-slate-200 hover:border-purple-300',
      slate: isSelected 
        ? 'bg-slate-50 border-slate-600 ring-2 ring-slate-200' 
        : 'bg-white border-slate-200 hover:border-slate-400',
      orange: isSelected 
        ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-200' 
        : 'bg-white border-slate-200 hover:border-orange-300'
    }
    return colors[color] || colors.purple
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          Pick the style that feels right 🎨
        </h2>
        <p className="text-lg text-slate-600">
          There's no wrong answer! Choose the interface that makes your brain happy.
          <span className="font-medium text-purple-600"> You can switch anytime.</span>
        </p>
      </div>

      {/* Style Selection */}
      <div className="grid grid-cols-1 gap-4">
        {UI_STYLES.map((style, index) => {
          const isSelected = selectedStyle === style.id
          
          return (
            <motion.button
              key={style.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedStyle(style.id)}
              className={`
                p-6 rounded-xl border-2 transition-all text-left relative overflow-hidden
                ${getColorClasses(style.color, isSelected)}
              `}
            >
              <div className="flex items-start gap-4 z-10 relative">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                  ${isSelected ? `bg-${style.color}-500 text-white` : 'bg-slate-100 text-slate-500'}
                `}>
                  <SafeIcon icon={style.icon} className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-lg font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                      {style.name}
                    </h3>
                    {isSelected && (
                      <div className="bg-green-500 text-white p-1 rounded-full">
                        <SafeIcon icon={FiCheck} className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-slate-600 mb-3">
                    {style.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {style.features.map((feature, i) => (
                      <span 
                        key={i}
                        className={`text-xs px-2 py-1 rounded-full ${
                          isSelected 
                            ? 'bg-white bg-opacity-60 text-slate-700 border border-slate-200' 
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Preview Box (Conceptual) */}
      <div className="bg-slate-50 rounded-xl p-6 border-2 border-dashed border-slate-300 text-center">
        <p className="text-slate-500 text-sm italic">
          "I chose {UI_STYLES.find(s => s.id === selectedStyle)?.name} because it feels 
          {selectedStyle === 'visual' ? ' fun and stimulating!' : 
           selectedStyle === 'minimal' ? ' calm and focused.' : 
           ' motivating and rewarding!'} Great choice!"
        </p>
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

export default UIStyleStep