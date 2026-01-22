import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiAlertCircle, FiAlertTriangle, FiInfo } = FiIcons

const PriorityBadge = ({ level, score, urgencyReason }) => {
  const configs = {
    critical: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      icon: FiAlertCircle,
      label: 'Critical'
    },
    high: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-300',
      icon: FiAlertTriangle,
      label: 'High'
    },
    medium: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-300',
      icon: FiInfo,
      label: 'Medium'
    },
    low: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-300',
      icon: FiInfo,
      label: 'Low'
    }
  }

  const config = configs[level] || configs.low

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border} text-xs font-medium`}
      title={`Priority Score: ${score}/100 - ${urgencyReason}`}
    >
      <SafeIcon icon={config.icon} className="w-3 h-3" />
      <span>{config.label}</span>
      <span className="opacity-75">({score})</span>
    </motion.div>
  )
}

export default PriorityBadge