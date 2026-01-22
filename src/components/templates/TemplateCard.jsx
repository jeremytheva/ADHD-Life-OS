import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiRefreshCw, FiCheckSquare, FiEye, FiPlus, FiCheck, FiClock, FiEdit3, FiChevronDown } = FiIcons

const TemplateCard = ({ 
  template, 
  type, 
  viewMode, 
  onDirectApply,
  onEditBeforeApply,
  onPreview, 
  isApplied,
  index 
}) => {
  const [showApplyMenu, setShowApplyMenu] = useState(false)
  const isRoutine = type === 'routine'
  
  const getCategoryColor = (category) => {
    const colors = {
      morning: 'bg-amber-100 text-amber-700',
      evening: 'bg-indigo-100 text-indigo-700',
      work: 'bg-blue-100 text-blue-700',
      household: 'bg-green-100 text-green-700',
      health: 'bg-red-100 text-red-700',
      food: 'bg-orange-100 text-orange-700',
      planning: 'bg-purple-100 text-purple-700',
      finance: 'bg-emerald-100 text-emerald-700',
      productivity: 'bg-cyan-100 text-cyan-700',
      organization: 'bg-teal-100 text-teal-700',
      social: 'bg-pink-100 text-pink-700',
      'mental-health': 'bg-violet-100 text-violet-700',
      maintenance: 'bg-slate-100 text-slate-700'
    }
    return colors[category] || 'bg-slate-100 text-slate-700'
  }

  const totalDuration = isRoutine
    ? template.steps?.reduce((sum, step) => sum + step.duration_minutes, 0)
    : template.estimated_duration

  const ApplyDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setShowApplyMenu(!showApplyMenu)}
        disabled={isApplied}
        className={`
          px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
          ${isApplied
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        <SafeIcon icon={isApplied ? FiCheck : FiPlus} className="w-4 h-4" />
        <span>{isApplied ? 'Applied' : 'Apply'}</span>
        {!isApplied && <SafeIcon icon={FiChevronDown} className="w-3 h-3" />}
      </button>

      {showApplyMenu && !isApplied && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowApplyMenu(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20"
          >
            <button
              onClick={() => {
                onDirectApply()
                setShowApplyMenu(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span>Apply Directly</span>
            </button>
            <button
              onClick={() => {
                onEditBeforeApply()
                setShowApplyMenu(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
            >
              <SafeIcon icon={FiEdit3} className="w-4 h-4" />
              <span>Edit Before Applying</span>
            </button>
          </motion.div>
        </>
      )}
    </div>
  )

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`
              p-2 rounded-lg
              ${isRoutine ? 'bg-purple-100' : 'bg-green-100'}
            `}>
              <SafeIcon 
                icon={isRoutine ? FiRefreshCw : FiCheckSquare} 
                className={`w-5 h-5 ${isRoutine ? 'text-purple-600' : 'text-green-600'}`}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-slate-900">
                  {isRoutine ? template.name : template.title}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(template.category)}`}>
                  {template.category}
                </span>
                {isApplied && (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <SafeIcon icon={FiCheck} className="w-3 h-3" />
                    Applied
                  </span>
                )}
              </div>
              
              <p className="text-sm text-slate-600 mb-2">{template.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {isRoutine && (
                  <span>{template.steps?.length || 0} steps</span>
                )}
                <div className="flex items-center gap-1">
                  <SafeIcon icon={FiClock} className="w-3 h-3" />
                  <span>{totalDuration} min</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs text-slate-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPreview}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Preview"
            >
              <SafeIcon icon={FiEye} className="w-4 h-4" />
            </button>
            <ApplyDropdown />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`
          p-2 rounded-lg
          ${isRoutine ? 'bg-purple-100' : 'bg-green-100'}
        `}>
          <SafeIcon 
            icon={isRoutine ? FiRefreshCw : FiCheckSquare} 
            className={`w-5 h-5 ${isRoutine ? 'text-purple-600' : 'text-green-600'}`}
          />
        </div>
        
        {isApplied && (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <SafeIcon icon={FiCheck} className="w-3 h-3" />
            Applied
          </span>
        )}
      </div>

      <h4 className="font-medium text-slate-900 mb-1">
        {isRoutine ? template.name : template.title}
      </h4>

      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
        {template.description}
      </p>

      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(template.category)}`}>
          {template.category}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
        {isRoutine && (
          <span>{template.steps?.length || 0} steps</span>
        )}
        <div className="flex items-center gap-1">
          <SafeIcon icon={FiClock} className="w-3 h-3" />
          <span>{totalDuration} min</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onPreview}
          className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <SafeIcon icon={FiEye} className="w-4 h-4" />
          Preview
        </button>
        <div className="flex-1">
          <ApplyDropdown />
        </div>
      </div>
    </motion.div>
  )
}

export default TemplateCard