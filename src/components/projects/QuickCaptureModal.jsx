import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiX, FiPlus, FiZap, FiChevronDown, FiChevronUp } = FiIcons

const QuickCaptureModal = ({ onSave, onCancel, projectId }) => {
  const [items, setItems] = useState([''])
  const [currentInput, setCurrentInput] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleAddItem = () => {
    if (currentInput.trim()) {
      setItems([...items.filter(i => i), currentInput.trim()])
      setCurrentInput('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddItem()
    }
  }

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSaveAll = () => {
    const validItems = items.filter(i => i.trim())
    if (validItems.length > 0) {
      onSave(validItems)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiZap} className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Quick Task Capture</h2>
                <p className="text-green-100 text-sm">
                  Just dump everything out - we'll organize it later!
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Encouragement */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
            <p className="text-blue-800 text-center font-medium">
              💭 Don't worry about perfect wording or order - just get it all out of your head!
            </p>
          </div>

          {/* Quick Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type a task and press Enter
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Call dentist, Buy groceries, Fix leaky faucet..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                autoFocus
              />
              <button
                onClick={handleAddItem}
                disabled={!currentInput.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <SafeIcon icon={FiPlus} className="w-5 h-5" />
                Add
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              💡 Tip: Press Enter after each task to add it quickly
            </p>
          </div>

          {/* Captured Items */}
          {items.filter(i => i).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900">
                  Your Brain Dump ({items.filter(i => i).length} items)
                </h3>
                {items.filter(i => i).length >= 3 && (
                  <div className="text-sm text-green-600 font-medium">
                    ✨ Great! Keep going!
                  </div>
                )}
              </div>

              <AnimatePresence>
                {items.filter(i => i).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-900">{item}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiX} className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty State */}
          {items.filter(i => i).length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiZap} className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Ready to capture your thoughts?
              </h3>
              <p className="text-slate-600 mb-4">
                Start typing in the box above and press Enter after each task
              </p>
              <div className="max-w-md mx-auto text-left space-y-2 text-sm text-slate-600">
                <p>✨ Examples to get started:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Things you keep forgetting to do</li>
                  <li>Ideas that keep popping up</li>
                  <li>Small tasks you've been putting off</li>
                  <li>Bigger goals you want to tackle</li>
                </ul>
              </div>
            </div>
          )}

          {/* Advanced Options Toggle */}
          {items.filter(i => i).length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="text-sm font-medium text-slate-700">
                  Organization Options (Optional)
                </span>
                <SafeIcon
                  icon={showAdvanced ? FiChevronUp : FiChevronDown}
                  className="w-5 h-5 text-slate-600"
                />
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <p className="text-sm text-slate-600 mb-3">
                      💡 After saving, you can:
                    </p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Mark some tasks as "Essential"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Add time estimates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Break tasks into smaller subtasks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Reorder by priority</span>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Success Message */}
          {items.filter(i => i).length >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200"
            >
              <p className="text-green-800 text-center font-medium">
                🎉 Awesome! You've captured {items.filter(i => i).length} tasks!
                That's huge progress in clearing your mental space!
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={items.filter(i => i).length === 0}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <SafeIcon icon={FiZap} className="w-5 h-5" />
              Save {items.filter(i => i).length} Task{items.filter(i => i).length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default QuickCaptureModal