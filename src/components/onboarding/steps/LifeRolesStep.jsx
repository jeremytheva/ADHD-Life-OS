import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../../common/SafeIcon'

const { FiBriefcase, FiHome, FiHeart, FiBook, FiUsers, FiEdit3, FiPlus, FiCheck, FiX } = FiIcons

const LIFE_ROLES = [
  {
    id: 'work',
    label: 'Working Professional',
    description: 'Managing career, projects, and workplace tasks',
    icon: FiBriefcase,
    color: 'blue'
  },
  {
    id: 'home',
    label: 'Home Manager',
    description: 'Handling household chores, maintenance, and organization',
    icon: FiHome,
    color: 'green'
  },
  {
    id: 'parent',
    label: 'Parent/Caregiver',
    description: 'Caring for children or family members',
    icon: FiHeart,
    color: 'pink'
  },
  {
    id: 'student',
    label: 'Student/Learner',
    description: 'Managing studies, homework, and academic goals',
    icon: FiBook,
    color: 'purple'
  },
  {
    id: 'caregiver',
    label: 'Caregiver',
    description: 'Supporting elderly parents or loved ones with special needs',
    icon: FiUsers,
    color: 'amber'
  },
  {
    id: 'creative',
    label: 'Creative/Hobbyist',
    description: 'Pursuing creative projects, hobbies, and passions',
    icon: FiEdit3,
    color: 'indigo'
  }
]

const LifeRolesStep = ({ onNext, onBack, currentData }) => {
  const [selectedRoles, setSelectedRoles] = useState(currentData.selectedRoles || [])
  const [customRoles, setCustomRoles] = useState(currentData.customRoles || [])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customRoleInput, setCustomRoleInput] = useState('')

  const toggleRole = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId)
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    )
  }

  const addCustomRole = () => {
    if (customRoleInput.trim()) {
      setCustomRoles(prev => [...prev, customRoleInput.trim()])
      setCustomRoleInput('')
      setShowCustomInput(false)
    }
  }

  const removeCustomRole = (index) => {
    setCustomRoles(prev => prev.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    onNext({
      selectedRoles,
      customRoles
    })
  }

  const getColorClasses = (color, isSelected) => {
    const colors = {
      blue: isSelected 
        ? 'bg-blue-500 border-blue-600 text-white' 
        : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: isSelected 
        ? 'bg-green-500 border-green-600 text-white' 
        : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      pink: isSelected 
        ? 'bg-pink-500 border-pink-600 text-white' 
        : 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100',
      purple: isSelected 
        ? 'bg-purple-500 border-purple-600 text-white' 
        : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      amber: isSelected 
        ? 'bg-amber-500 border-amber-600 text-white' 
        : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
      indigo: isSelected 
        ? 'bg-indigo-500 border-indigo-600 text-white' 
        : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          Tell us about the roles you play in your life 🌟
        </h2>
        <p className="text-lg text-slate-600">
          We'll tailor Life-OS to support each one. Select all that apply—
          <span className="font-medium text-purple-600"> there's no limit!</span>
        </p>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LIFE_ROLES.map((role, index) => {
          const isSelected = selectedRoles.includes(role.id)
          
          return (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toggleRole(role.id)}
              className={`
                relative p-6 rounded-xl border-2 transition-all text-left
                ${getColorClasses(role.color, isSelected)}
                ${isSelected ? 'shadow-lg transform scale-105' : 'shadow-md hover:shadow-lg'}
              `}
            >
              {/* Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <SafeIcon icon={FiCheck} className="w-5 h-5 text-white" />
                </motion.div>
              )}

              <div className="flex items-start gap-4">
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'bg-white bg-opacity-20' : 'bg-white'}
                `}>
                  <SafeIcon 
                    icon={role.icon} 
                    className={`w-6 h-6 ${isSelected ? 'text-white' : `text-${role.color}-600`}`}
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">
                    {role.label}
                  </h3>
                  <p className={`text-sm ${isSelected ? 'text-white text-opacity-90' : 'text-slate-600'}`}>
                    {role.description}
                  </p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Custom Roles Section */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900">
            Don't see your role? Add your own! ✨
          </h3>
          {!showCustomInput && (
            <button
              onClick={() => setShowCustomInput(true)}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span>Add Custom Role</span>
            </button>
          )}
        </div>

        {/* Custom Role Input */}
        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex gap-2 mb-4"
          >
            <input
              type="text"
              value={customRoleInput}
              onChange={(e) => setCustomRoleInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomRole()}
              placeholder="e.g., Volunteer, Athlete, Musician..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <button
              onClick={addCustomRole}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false)
                setCustomRoleInput('')
              }}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {/* Custom Roles List */}
        {customRoles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customRoles.map((role, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-4 py-2 bg-purple-500 text-white rounded-full flex items-center gap-2 shadow-md"
              >
                <span>{role}</span>
                <button
                  onClick={() => removeCustomRole(index)}
                  className="hover:bg-purple-600 rounded-full p-1 transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Encouragement */}
      {(selectedRoles.length > 0 || customRoles.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200"
        >
          <p className="text-green-800 text-center font-medium">
            🎉 Great choices! You're doing awesome! 
            {selectedRoles.length + customRoles.length > 2 && 
              " Wow, you wear many hats—that's incredible!"
            }
          </p>
        </motion.div>
      )}

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
          disabled={selectedRoles.length === 0 && customRoles.length === 0}
          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>

      {/* Helper Text */}
      <p className="text-center text-sm text-slate-500">
        💡 Tip: You can always update your roles later in Settings
      </p>
    </div>
  )
}

export default LifeRolesStep