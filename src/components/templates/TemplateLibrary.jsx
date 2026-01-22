import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { templateService } from '../../services/templateService'
import TemplateCard from './TemplateCard'
import TemplatePreview from './TemplatePreview'
import TemplateEditModal from './TemplateEditModal'

const { FiSearch, FiFilter, FiX, FiGrid, FiList } = FiIcons

const TemplateLibrary = ({ onApplyTemplate, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [editingTemplate, setEditingTemplate] = useState(null)

  const categories = templateService.getCategories()
  const allCategories = ['all', ...categories.all]

  const getFilteredTemplates = () => {
    let routines = templateService.getRoutineTemplates()
    let tasks = templateService.getTaskTemplates()

    if (selectedCategory !== 'all') {
      routines = routines.filter(r => r.category === selectedCategory)
      tasks = tasks.filter(t => t.category === selectedCategory)
    }

    if (searchQuery) {
      const results = templateService.searchTemplates(searchQuery)
      routines = results.routines
      tasks = results.tasks
    }

    if (selectedType === 'routines') {
      return { routines, tasks: [] }
    } else if (selectedType === 'tasks') {
      return { routines: [], tasks }
    }

    return { routines, tasks }
  }

  const { routines, tasks } = getFilteredTemplates()
  const totalResults = routines.length + tasks.length

  const handleDirectApply = async (template, type) => {
    if (onApplyTemplate) {
      await onApplyTemplate(template, type)
      templateService.markTemplateAsApplied(template.id)
    }
  }

  const handleEditBeforeApply = (template, type) => {
    setEditingTemplate({ ...template, type })
    setPreviewTemplate(null)
  }

  const handleSaveEditedTemplate = async (editedTemplate, type) => {
    if (onApplyTemplate) {
      await onApplyTemplate(editedTemplate, type)
      templateService.markTemplateAsApplied(editedTemplate.id)
      setEditingTemplate(null)
    }
  }

  const handlePreview = (template, type) => {
    setPreviewTemplate({ ...template, type })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Template Library</h2>
            <p className="text-sm text-slate-600 mt-1">
              Choose from pre-built templates to get started quickly
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="relative">
            <SafeIcon 
              icon={FiSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiFilter} className="w-4 h-4 text-slate-600" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="routines">Routines Only</option>
                <option value="tasks">Tasks Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {allCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm transition-colors
                    ${selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }
                  `}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 ml-auto bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`
                  p-2 rounded transition-colors
                  ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}
                `}
              >
                <SafeIcon icon={FiGrid} className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  p-2 rounded transition-colors
                  ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}
                `}
              >
                <SafeIcon icon={FiList} className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-sm text-slate-600">
            Found {totalResults} template{totalResults !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Template Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {routines.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Routine Templates ({routines.length})
              </h3>
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                  : 'space-y-3'
                }
              `}>
                {routines.map((routine, index) => (
                  <TemplateCard
                    key={routine.id}
                    template={routine}
                    type="routine"
                    viewMode={viewMode}
                    onDirectApply={() => handleDirectApply(routine, 'routine')}
                    onEditBeforeApply={() => handleEditBeforeApply(routine, 'routine')}
                    onPreview={() => handlePreview(routine, 'routine')}
                    isApplied={templateService.hasAppliedTemplate(routine.id)}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {tasks.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Task Templates ({tasks.length})
              </h3>
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                  : 'space-y-3'
                }
              `}>
                {tasks.map((task, index) => (
                  <TemplateCard
                    key={task.id}
                    template={task}
                    type="task"
                    viewMode={viewMode}
                    onDirectApply={() => handleDirectApply(task, 'task')}
                    onEditBeforeApply={() => handleEditBeforeApply(task, 'task')}
                    onPreview={() => handlePreview(task, 'task')}
                    isApplied={templateService.hasAppliedTemplate(task.id)}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-2">No templates found</p>
              <p className="text-sm text-slate-500">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>

        {/* Modals */}
        <AnimatePresence>
          {previewTemplate && (
            <TemplatePreview
              template={previewTemplate}
              onClose={() => setPreviewTemplate(null)}
              onDirectApply={() => {
                handleDirectApply(previewTemplate, previewTemplate.type)
                setPreviewTemplate(null)
              }}
              onEditBeforeApply={() => {
                handleEditBeforeApply(previewTemplate, previewTemplate.type)
              }}
            />
          )}

          {editingTemplate && (
            <TemplateEditModal
              template={editingTemplate}
              onClose={() => setEditingTemplate(null)}
              onSave={handleSaveEditedTemplate}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default TemplateLibrary