import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { 
  FiZap, 
  FiClock, 
  FiMapPin, 
  FiPackage,
  FiHeart,
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp
} = FiIcons

const TaskMetadataForm = ({ metadata = {}, onChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = (field, value) => {
    onChange({ ...metadata, [field]: value })
  }

  const handleArrayChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean)
    onChange({ ...metadata, [field]: items })
  }

  return (
    <div className="space-y-4">
      {/* Basic Metadata */}
      <div className="space-y-4">
        {/* Energy Required */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <SafeIcon icon={FiZap} className="w-4 h-4 inline mr-1" />
            Energy Required
          </label>
          <div className="flex gap-2">
            {['low', 'medium', 'high'].map(level => (
              <button
                key={level}
                type="button"
                onClick={() => handleChange('energy_required', level)}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm transition-colors
                  ${metadata.energy_required === level
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }
                `}
              >
                {level === 'low' && '🔋 Low'}
                {level === 'medium' && '⚡ Medium'}
                {level === 'high' && '🚀 High'}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            How much energy will this take?
          </p>
        </div>

        {/* Time Required */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <SafeIcon icon={FiClock} className="w-4 h-4 inline mr-1" />
            Time Required (minutes)
          </label>
          <input
            type="number"
            value={metadata.time_required || ''}
            onChange={(e) => handleChange('time_required', parseInt(e.target.value) || null)}
            placeholder="e.g., 30"
            min="1"
            step="5"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Interest Level */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <SafeIcon icon={FiHeart} className="w-4 h-4 inline mr-1" />
            Interest Level
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                type="button"
                onClick={() => handleChange('interest_level', level)}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm transition-colors
                  ${metadata.interest_level === level
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }
                `}
              >
                {'❤️'.repeat(level)}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            How interested are you in this task?
          </p>
        </div>
      </div>

      {/* Advanced Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <span className="text-sm font-medium text-slate-700">
          Advanced Options
        </span>
        <SafeIcon 
          icon={showAdvanced ? FiChevronUp : FiChevronDown} 
          className="w-4 h-4 text-slate-600" 
        />
      </button>

      {/* Advanced Metadata */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 pt-2"
        >
          {/* Aversiveness */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 inline mr-1" />
              Aversiveness (How much you dread it)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleChange('aversiveness', level)}
                  className={`
                    flex-1 px-3 py-2 rounded-lg text-sm transition-colors
                    ${metadata.aversiveness === level
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }
                  `}
                >
                  {'😓'.repeat(level)}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              No shame! This helps us suggest the right time.
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <SafeIcon icon={FiMapPin} className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={metadata.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., home, office, café"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Where do you need to be to do this?
            </p>
          </div>

          {/* Available Items */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <SafeIcon icon={FiPackage} className="w-4 h-4 inline mr-1" />
              Required Items
            </label>
            <input
              type="text"
              value={metadata.available_items?.join(', ') || ''}
              onChange={(e) => handleArrayChange('available_items', e.target.value)}
              placeholder="e.g., laptop, phone, headphones"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Separate items with commas
            </p>
          </div>
        </motion.div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> The more details you add, the better our recommendations!
          But don't stress - you can always add these later.
        </p>
      </div>
    </div>
  )
}

export default TaskMetadataForm