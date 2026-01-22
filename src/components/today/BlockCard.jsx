import React from 'react'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiCheck, FiClock, FiCalendar, FiRefreshCw } = FiIcons

const BlockCard = ({ block, onComplete }) => {
  const startTime = format(parseISO(block.start_at), 'h:mm a')
  const endTime = format(parseISO(block.end_at), 'h:mm a')

  const getBlockIcon = () => {
    switch (block.ref_type) {
      case 'task':
        return FiCheck
      case 'routine_step':
        return FiRefreshCw
      case 'event':
        return FiCalendar
      default:
        return FiClock
    }
  }

  const getBlockColor = () => {
    if (block.is_essential) {
      return 'border-blue-200 bg-blue-50'
    }
    
    switch (block.ref_type) {
      case 'task':
        return 'border-green-200 bg-green-50'
      case 'routine_step':
        return 'border-purple-200 bg-purple-50'
      case 'event':
        return 'border-orange-200 bg-orange-50'
      default:
        return 'border-slate-200 bg-slate-50'
    }
  }

  const handleComplete = () => {
    if (block.ref_type === 'task' && onComplete) {
      onComplete(block.id, block.ref_id)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`
        border rounded-lg p-4 ${getBlockColor()}
        transition-all duration-200
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={getBlockIcon()} className="w-5 h-5 text-slate-600" />
          <div>
            <h3 className="font-medium text-slate-900">{block.label}</h3>
            <p className="text-sm text-slate-600">
              {startTime} - {endTime}
            </p>
          </div>
        </div>
        
        {block.ref_type === 'task' && (
          <button
            onClick={handleComplete}
            className="p-2 text-slate-600 hover:text-green-600 transition-colors"
          >
            <SafeIcon icon={FiCheck} className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default BlockCard