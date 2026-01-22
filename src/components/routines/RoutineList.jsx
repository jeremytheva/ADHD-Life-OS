import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { routineService } from '../../services/routineService'
import { useMode } from '../../contexts/ModeContext'
import RoutineCard from './RoutineCard'
import RoutineForm from './RoutineForm'
import RoutineProgress from './RoutineProgress'
import RoutineStats from './RoutineStats'
import TemplateLibrary from '../templates/TemplateLibrary'

const { FiPlus, FiBookOpen } = FiIcons

const RoutineList = () => {
  const { currentMode, filterByMode } = useMode()
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState(null)
  const [activeRoutine, setActiveRoutine] = useState(null)
  const [statsRoutine, setStatsRoutine] = useState(null)

  useEffect(() => {
    loadRoutines()
  }, [currentMode])

  const loadRoutines = async () => {
    try {
      setLoading(true)
      const data = await routineService.getRoutines()
      
      // Apply mode filtering
      const filteredData = filterByMode(data, 'routine')
      
      setRoutines(filteredData)
    } catch (error) {
      console.error('Error loading routines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoutine = async (routineData) => {
    try {
      // Auto-tag with current mode
      const routineWithMode = {
        ...routineData,
        mode: currentMode.id !== 'all' ? currentMode.id : null
      }
      
      await routineService.createRoutine(routineWithMode)
      setShowForm(false)
      loadRoutines()
    } catch (error) {
      console.error('Error creating routine:', error)
    }
  }

  const handleApplyTemplate = async (template, type) => {
    if (type !== 'routine') return

    try {
      const routineData = {
        name: template.name,
        description: template.description,
        repeat_pattern: template.repeat_pattern,
        is_active: template.is_active,
        steps: template.steps,
        mode: currentMode.id !== 'all' ? currentMode.id : null
      }

      await routineService.createRoutine(routineData)
      loadRoutines()
    } catch (error) {
      console.error('Error applying template:', error)
    }
  }

  const handleEditRoutine = (routine) => {
    setEditingRoutine(routine)
    setShowForm(true)
  }

  const handleUpdateRoutine = async (routineData) => {
    try {
      await routineService.updateRoutine(editingRoutine.id, routineData)
      setShowForm(false)
      setEditingRoutine(null)
      loadRoutines()
    } catch (error) {
      console.error('Error updating routine:', error)
    }
  }

  const handleDeleteRoutine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this routine?')) {
      return
    }

    try {
      await routineService.deleteRoutine(id)
      loadRoutines()
    } catch (error) {
      console.error('Error deleting routine:', error)
    }
  }

  const handleStartRoutine = (routine) => {
    setActiveRoutine(routine)
  }

  const handleViewStats = (routine) => {
    setStatsRoutine(routine)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingRoutine(null)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading routines...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Mode Context Banner */}
      {currentMode.id !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${currentMode.gradient} text-white rounded-lg p-4`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentMode.icon}</span>
            <div>
              <div className="font-medium">
                Viewing {currentMode.label} Routines
              </div>
              <div className="text-xs text-white text-opacity-90">
                Showing only {currentMode.label.toLowerCase()}-related routines
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium text-slate-900">Routines</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiBookOpen} className="w-4 h-4" />
            <span>Templates</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Routine</span>
          </button>
        </div>
      </div>

      {/* Routine List */}
      <div className="space-y-4">
        {routines.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <p className="text-slate-600 mb-4">
              {currentMode.id !== 'all'
                ? `No ${currentMode.label.toLowerCase()} routines found`
                : 'No routines found'
              }
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                Create your first routine
              </button>
              <span className="text-slate-400">or</span>
              <button
                onClick={() => setShowTemplates(true)}
                className="text-purple-600 hover:text-purple-700"
              >
                Browse templates
              </button>
            </div>
          </div>
        ) : (
          routines.map((routine, index) => (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RoutineCard
                routine={routine}
                onEdit={() => handleEditRoutine(routine)}
                onDelete={() => handleDeleteRoutine(routine.id)}
                onStart={() => handleStartRoutine(routine)}
                onViewStats={() => handleViewStats(routine)}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <RoutineForm
            routine={editingRoutine}
            onSave={editingRoutine ? handleUpdateRoutine : handleCreateRoutine}
            onCancel={handleCloseForm}
          />
        )}

        {showTemplates && (
          <TemplateLibrary
            onApplyTemplate={handleApplyTemplate}
            onClose={() => setShowTemplates(false)}
          />
        )}

        {activeRoutine && (
          <RoutineProgress
            routine={activeRoutine}
            onClose={() => setActiveRoutine(null)}
            onComplete={() => {
              setActiveRoutine(null)
              loadRoutines()
            }}
          />
        )}

        {statsRoutine && (
          <RoutineStats
            routine={statsRoutine}
            onClose={() => setStatsRoutine(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default RoutineList