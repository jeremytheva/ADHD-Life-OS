import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../../common/SafeIcon'

const { FiToggleLeft, FiToggleRight, FiVolume2, FiVolumeX, FiClock, FiSmile, FiAward } = FiIcons

const PreferencesStep = ({ onNext, onBack, currentData }) => {
  const [preferences, setPreferences] = useState(
    currentData.preferences || {
      showEncouragement: true,
      enableSoundEffects: false,
      useTimers: true,
      breakReminders: true,
      celebrateSmallWins: true
    }
  )

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleNext = () => {
    onNext({ preferences })
  }

  const PreferenceItem = ({ id, label, description, icon: Icon, value }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-purple-200 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${value ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
          <SafeIcon icon={Icon} className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-medium text-slate-900">{label}</h4>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <button
        onClick={() => togglePreference(id)}
        className="text-2xl focus:outline-none transition-colors"
      >
        <SafeIcon 
          icon={value ? FiToggleRight : FiToggleLeft} 
          className={`w-10 h-10 ${value ? 'text-purple-600' : 'text-slate-300'}`} 
        />
      </button>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          Fine-tune your experience ⚙️
        </h2>
        <p className="text-lg text-slate-600">
          Small adjustments can make a big difference. Configure these ADHD-friendly settings.
        </p>
      </div>

      {/* Preferences List */}
      <div className="space-y-3">
        <PreferenceItem
          id="showEncouragement"
          label="Encouraging Messages"
          description="Show gentle, positive messages throughout the day"
          icon={FiSmile}
          value={preferences.showEncouragement}
        />
        
        <PreferenceItem
          id="celebrateSmallWins"
          label="Celebrate Small Wins"
          description="Confetti and praise when completing tasks"
          icon={FiAward}
          value={preferences.celebrateSmallWins}
        />

        <PreferenceItem
          id="useTimers"
          label="Task Timers"
          description="Show timers during tasks to help with time blindness"
          icon={FiClock}
          value={preferences.useTimers}
        />

        <PreferenceItem
          id="enableSoundEffects"
          label="Sound Effects"
          description="Play satisfying sounds on completion (can be disabled)"
          icon={preferences.enableSoundEffects ? FiVolume2 : FiVolumeX}
          value={preferences.enableSoundEffects}
        />
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
        <p className="text-sm text-purple-800 text-center">
          ✨ "Celebration" and "Encouragement" are highly recommended for dopamine boosting!
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
          Complete Setup →
        </button>
      </div>
    </div>
  )
}

export default PreferencesStep