import React, { useEffect, useRef, useState } from 'react'
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
  isApplying = false,
  index
}) => {
  const [showApplyMenu, setShowApplyMenu] = useState(false)
  const applyMenuTriggerRef = useRef(null)
  const applyMenuItemRefs = useRef([])
  const isRoutine = type === 'routine'
  const templateName = isRoutine ? template.name : template.title

  useEffect(() => {
    if (isApplying && showApplyMenu) setShowApplyMenu(false)
  }, [isApplying, showApplyMenu])

  useEffect(() => {
    if (showApplyMenu && !isApplied && !isApplying) applyMenuItemRefs.current[0]?.focus()
  }, [isApplying, showApplyMenu, isApplied])

  const closeApplyMenu = ({ restoreFocus = false } = {}) => {
    setShowApplyMenu(false)
    if (restoreFocus) requestAnimationFrame(() => applyMenuTriggerRef.current?.focus())
  }

  const handleApplyMenuKeyDown = (event) => {
    if (isApplying) return
    const items = applyMenuItemRefs.current.filter(Boolean)
    const currentIndex = items.indexOf(document.activeElement)

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeApplyMenu({ restoreFocus: true })
      return
    }

    let nextIndex = null
    if (event.key === 'ArrowDown') nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length
    if (event.key === 'ArrowUp') nextIndex = currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = items.length - 1

    if (nextIndex !== null) {
      event.preventDefault()
      items[nextIndex]?.focus()
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      morning: 'bg-amber-100 text-amber-700', evening: 'bg-indigo-100 text-indigo-700', work: 'bg-blue-100 text-blue-700', household: 'bg-green-100 text-green-700', health: 'bg-red-100 text-red-700', food: 'bg-orange-100 text-orange-700', planning: 'bg-purple-100 text-purple-700', finance: 'bg-emerald-100 text-emerald-700', productivity: 'bg-cyan-100 text-cyan-700', organization: 'bg-teal-100 text-teal-700', social: 'bg-pink-100 text-pink-700', 'mental-health': 'bg-violet-100 text-violet-700', maintenance: 'bg-slate-100 text-slate-700'
    }
    return colors[category] || 'bg-slate-100 text-slate-700'
  }

  const totalDuration = isRoutine ? template.steps?.reduce((sum, step) => sum + step.duration_minutes, 0) : template.estimated_duration

  const renderApplyDropdown = () => (
    <div className="relative">
      <button
        ref={applyMenuTriggerRef}
        type="button"
        onClick={() => setShowApplyMenu((open) => !open)}
        disabled={isApplied || isApplying}
        aria-haspopup="menu"
        aria-expanded={showApplyMenu && !isApplied && !isApplying}
        aria-label={`${isApplied ? 'Applied' : isApplying ? 'Applying' : 'Apply'} ${templateName}`}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isApplied || isApplying ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        <SafeIcon icon={isApplied ? FiCheck : FiPlus} className="w-4 h-4" aria-hidden="true" />
        <span>{isApplied ? 'Applied' : isApplying ? 'Applying…' : 'Apply'}</span>
        {!isApplied && !isApplying && <SafeIcon icon={FiChevronDown} className="w-3 h-3" aria-hidden="true" />}
      </button>

      {showApplyMenu && !isApplied && !isApplying && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => closeApplyMenu({ restoreFocus: true })} />
          <motion.div role="menu" aria-label={`Apply ${templateName}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20" onKeyDown={handleApplyMenuKeyDown}>
            <button ref={(element) => { applyMenuItemRefs.current[0] = element }} type="button" role="menuitem" onClick={() => { onDirectApply(); closeApplyMenu() }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2">
              <SafeIcon icon={FiPlus} className="w-4 h-4" aria-hidden="true" /><span>Apply Directly</span>
            </button>
            <button ref={(element) => { applyMenuItemRefs.current[1] = element }} type="button" role="menuitem" onClick={onEditBeforeApply} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2">
              <SafeIcon icon={FiEdit3} className="w-4 h-4" aria-hidden="true" /><span>Edit Before Applying</span>
            </button>
          </motion.div>
        </>
      )}
    </div>
  )

  const content = (
    <>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${isRoutine ? 'bg-purple-100' : 'bg-green-100'}`}><SafeIcon icon={isRoutine ? FiRefreshCw : FiCheckSquare} className={`w-5 h-5 ${isRoutine ? 'text-purple-600' : 'text-green-600'}`} aria-hidden="true" /></div>
        {isApplied && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center gap-1"><SafeIcon icon={FiCheck} className="w-3 h-3" aria-hidden="true" />Applied</span>}
      </div>
      <h4 className="font-medium text-slate-900 mb-1">{templateName}</h4>
      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{template.description}</p>
      <div className="flex items-center gap-2 mb-3"><span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(template.category)}`}>{template.category}</span></div>
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
        {isRoutine && <span>{template.steps?.length || 0} steps</span>}
        <div className="flex items-center gap-1"><SafeIcon icon={FiClock} className="w-3 h-3" aria-hidden="true" /><span>{totalDuration} min</span></div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onPreview} disabled={isApplying} className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"><SafeIcon icon={FiEye} className="w-4 h-4" aria-hidden="true" />Preview</button>
        <div className="flex-1">{renderApplyDropdown()}</div>
      </div>
    </>
  )

  if (viewMode === 'list') {
    return (
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${isRoutine ? 'bg-purple-100' : 'bg-green-100'}`}><SafeIcon icon={isRoutine ? FiRefreshCw : FiCheckSquare} className={`w-5 h-5 ${isRoutine ? 'text-purple-600' : 'text-green-600'}`} aria-hidden="true" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1"><h4 className="font-medium text-slate-900">{templateName}</h4><span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(template.category)}`}>{template.category}</span>{isApplied && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"><SafeIcon icon={FiCheck} className="w-3 h-3" aria-hidden="true" />Applied</span>}</div>
              <p className="text-sm text-slate-600 mb-2">{template.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">{isRoutine && <span>{template.steps?.length || 0} steps</span>}<div className="flex items-center gap-1"><SafeIcon icon={FiClock} className="w-3 h-3" aria-hidden="true" /><span>{totalDuration} min</span></div><div className="flex flex-wrap gap-1">{template.tags?.slice(0, 3).map(tag => <span key={tag} className="text-xs text-slate-500">#{tag}</span>)}</div></div>
            </div>
          </div>
          <div className="flex items-center gap-2"><button type="button" onClick={onPreview} disabled={isApplying} aria-label={`Preview ${templateName}`} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50" title="Preview"><SafeIcon icon={FiEye} className="w-4 h-4" aria-hidden="true" /></button>{renderApplyDropdown()}</div>
        </div>
      </motion.div>
    )
  }

  return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={isApplying ? undefined : { scale: 1.02 }} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-all">{content}</motion.div>
}

export default TemplateCard
