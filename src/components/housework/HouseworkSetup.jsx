import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { 
  HOUSEWORK_TEMPLATES, 
  ROOM_CATEGORIES,
  FREQUENCY_OPTIONS,
  getStarterSet 
} from '../../services/houseworkTemplates'
import { houseworkService } from '../../services/houseworkService'

const { FiX, FiCheck, FiPlus, FiHome } = FiIcons

const HouseworkSetup = ({ onClose, onComplete }) => {
  const [selectedRoom, setSelectedRoom] = useState('all')
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const [customizing, setCustomizing] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleToggleTask = (templateId) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(templateId)) {
        newSet.delete(templateId)
      } else {
        newSet.add(templateId)
      }
      return newSet
    })
  }

  const handleSelectStarterSet = () => {
    const starterTasks = getStarterSet()
    setSelectedTasks(new Set(starterTasks.map((_, idx) => idx)))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const allTemplates = Object.values(HOUSEWORK_TEMPLATES).flat()
      const tasksToCreate = Array.from(selectedTasks).map(idx => allTemplates[idx])
      
      for (const template of tasksToCreate) {
        await houseworkService.createHouseworkTask({
          ...template,
          next_due_date: new Date().toISOString()
        })
      }
      
      if (onComplete) {
        onComplete()
      }
      onClose()
    } catch (error) {
      console.error('Error creating housework tasks:', error)
    } finally {
      setSaving(false)
    }
  }

  const getFilteredTemplates = () => {
    if (selectedRoom === 'all') {
      return Object.values(HOUSEWORK_TEMPLATES).flat()
    }
    return HOUSEWORK_TEMPLATES[selectedRoom] || []
  }

  const filteredTemplates = getFilteredTemplates()
  const allTemplates = Object.values(HOUSEWORK_TEMPLATES).flat()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiHome} className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Set Up Your Housework Routine</h2>
                <p className="text-purple-100">Choose tasks that fit your lifestyle</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
            </div>
            <button
              onClick={handleSelectStarterSet}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm transition-colors"
            >
              Use Starter Set (Essential Tasks)
            </button>
          </div>
        </div>

        {/* Room Filter */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRoom('all')}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedRoom === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }
              `}
            >
              All Rooms
            </button>
            {ROOM_CATEGORIES.map(room => (
              <button
                key={room.value}
                onClick={() => setSelectedRoom(room.value)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                  ${selectedRoom === room.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }
                `}
              >
                <span>{room.icon}</span>
                <span>{room.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template, index) => {
              const globalIndex = allTemplates.findIndex(t => 
                t.title === template.title && t.room === template.room
              )
              const isSelected = selectedTasks.has(globalIndex)

              return (
                <motion.button
                  key={`${template.room}-${index}`}
                  onClick={() => handleToggleTask(globalIndex)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    text-left p-4 rounded-lg border-2 transition-all
                    ${isSelected
                      ? 'bg-purple-50 border-purple-300'
                      : 'bg-white border-slate-200 hover:border-purple-200'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className={`
                          w-5 h-5 rounded flex items-center justify-center flex-shrink-0
                          ${isSelected
                            ? 'bg-purple-600'
                            : 'bg-slate-200'
                          }
                        `}
                      >
                        {isSelected && (
                          <SafeIcon icon={FiCheck} className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <h4 className="font-medium text-slate-900">
                        {template.title}
                      </h4>
                    </div>
                    {template.is_essential && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        Essential
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 mb-3">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <SafeIcon icon={FiHome} className="w-3 h-3" />
                      {template.room.replace('_', ' ')}
                    </span>
                    <span>•</span>
                    <span>
                      {FREQUENCY_OPTIONS.find(f => f.value === template.frequency)?.label}
                    </span>
                    <span>•</span>
                    <span>{template.estimated_duration} min</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={selectedTasks.size === 0 || saving}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Tasks...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiPlus} className="w-5 h-5" />
                  Add {selectedTasks.size} Task{selectedTasks.size !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HouseworkSetup