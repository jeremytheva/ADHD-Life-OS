import React, { useCallback, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import LoadErrorState from '../../common/LoadErrorState'
import OperationErrorState from '../../common/OperationErrorState'
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
  const [hasLoaded, setHasLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [operationError, setOperationError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState(null)
  const [activeRoutine, setActiveRoutine] = useState(null)
  const [statsRoutine, setStatsRoutine] = useState(null)
  const latestRoutineRequestRef = useRef(0)
  const pendingActionRef = useRef(null)
  const mutationPending = Boolean(pendingAction)

  const claimMutation = (action) => {
    if (pendingActionRef.current) return false
    pendingActionRef.current = action
    setPendingAction(action)
    return true
  }

  const releaseMutation = () => {
    pendingActionRef.current = null
    setPendingAction(null)
  }

  const loadRoutines = useCallback(async () => {
    const requestId = latestRoutineRequestRef.current + 1
    latestRoutineRequestRef.current = requestId

    try {
      setLoading(true)
      setLoadError(false)
      const data = await routineService.getRoutines()
      const filteredData = filterByMode(data, 'routine')

      if (requestId !== latestRoutineRequestRef.current) return true

      setRoutines(filteredData)
      setHasLoaded(true)
      return true
    } catch (error) {
      if (requestId !== latestRoutineRequestRef.current) return true

      console.error('Error loading routines:', error)
      setLoadError(true)
      return false
    } finally {
      if (requestId === latestRoutineRequestRef.current) {
        setLoading(false)
      }
    }
  }, [filterByMode])

  useEffect(() => {
    loadRoutines()
  }, [loadRoutines])

  const handleCreateRoutine = async (routineData) => {
    if (!claimMutation('create')) return

    try {
      setOperationError('')
      const routineWithMode = {
        ...routineData,
        mode: currentMode.id !== 'all' ? currentMode.id : null
      }

      await routineService.createRoutine(routineWithMode)
      setShowForm(false)
      const refreshed = await loadRoutines()
      if (!refreshed) {
        setOperationError('The routine was created, but the routine list could not refresh. Reload Routines before creating it again.')
      }
    } catch (error) {
      console.error('Error creating routine:', error)
      setOperationError('We couldn’t create that routine. Your form has been left open so you can review it and try again.')
    } finally {
      releaseMutation()
    }
  }

  const handleApplyTemplate = async (template, type) => {
    if (type !== 'routine' || !claimMutation('template')) return

    try {
      setOperationError('')
      const routineData = {
        name: template.name,
        description: template.description,
        repeat_pattern: template.repeat_pattern,
        is_active: template.is_active,
        steps: template.steps,
        mode: currentMode.id !== 'all' ? currentMode.id : null
      }

      await routineService.createRoutine(routineData)
      setShowTemplates(false)
      const refreshed = await loadRoutines()
      if (!refreshed) {
        setOperationError('The template routine was created, but the routine list could not refresh. Reload Routines before applying the same template again.')
      }
    } catch (error) {
      console.error('Error applying template:', error)
      setOperationError('We couldn’t create a routine from that template. Nothing has been removed; you can choose a template and try again.')
    } finally {
      releaseMutation()
    }
  }

  const handleEditRoutine = (routine) => {
    if (pendingActionRef.current) return
    setOperationError('')
    setEditingRoutine(routine)
    setShowForm(true)
  }

  const handleUpdateRoutine = async (routineData) => {
    if (!editingRoutine || !claimMutation(`update:${editingRoutine.id}`)) return

    try {
      setOperationError('')
      await routineService.updateRoutine(editingRoutine.id, routineData)
      setShowForm(false)
      setEditingRoutine(null)
      const refreshed = await loadRoutines()
      if (!refreshed) {
        setOperationError('The routine changes were saved, but the routine list could not refresh. Reload Routines before editing it again.')
      }
    } catch (error) {
      console.error('Error updating routine:', error)
      setOperationError('We couldn’t save those routine changes. Your form remains open so you can try again.')
    } finally {
      releaseMutation()
    }
  }

  const handleDeleteRoutine = async (id) => {
    if (pendingActionRef.current) return
    if (!window.confirm('Are you sure you want to delete this routine?')) return
    if (!claimMutation(`delete:${id}`)) return

    try {
      setOperationError('')
      await routineService.deleteRoutine(id)
      const refreshed = await loadRoutines()
      if (!refreshed) {
        setOperationError('The routine was deleted, but the routine list could not refresh. Reload Routines before acting on the stale entry.')
      }
    } catch (error) {
      console.error('Error deleting routine:', error)
      setOperationError('We couldn’t delete that routine. It is still in your routine list.')
    } finally {
      releaseMutation()
    }
  }

  const handleStartRoutine = (routine) => {
    setActiveRoutine(routine)
  }

  const handleViewStats = (routine) => {
    setStatsRoutine(routine)
  }

  const handleCloseForm = () => {
    if (pendingActionRef.current) return
    setShowForm(false)
    setEditingRoutine(null)
  }

  if (loading && !hasLoaded) {
    return (
      <div className="p-6">
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-busy="true"
          className="bg-white rounded-lg border border-slate-200 p-8 text-center"
        >
          <div
            aria-hidden="true"
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"
          ></div>
          <p className="text-slate-600">Loading routines...</p>
        </div>
      </div>
    )
  }

  if (loadError && !hasLoaded) {
    return (
      <div className="p-6">
        <LoadErrorState
          title="We couldn’t load your routines"
          message="Your routines have not been removed. Check your connection and try again."
          onRetry={loadRoutines}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" aria-busy={loading || mutationPending}>
      {loading && (
        <p className="sr-only" role="status" aria-live="polite">
          Refreshing routines...
        </p>
      )}
      {mutationPending && (
        <p className="sr-only" role="status" aria-live="polite">
          Updating routines...
        </p>
      )}

      {loadError && hasLoaded && !operationError && (
        <LoadErrorState
          title="We couldn’t refresh your routines"
          message="Your current routine list is still shown and may be out of date. Check your connection and try again."
          onRetry={loadRoutines}
        />
      )}

      <OperationErrorState
        message={operationError}
        onDismiss={() => setOperationError('')}
      />

      {currentMode.id !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${currentMode.gradient} text-white rounded-lg p-4`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentMode.icon}</span>
            <div>
              <div className="font-medium">Viewing {currentMode.label} Routines</div>
              <div className="text-xs text-white text-opacity-90">
                Showing only {currentMode.label.toLowerCase()}-related routines
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium text-slate-900">Routines</h1>
        <div className="flex gap-2">
          <button
            disabled={mutationPending}
            onClick={() => { setOperationError(''); setShowTemplates(true) }}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SafeIcon icon={FiBookOpen} className="w-4 h-4" />
            <span>Templates</span>
          </button>
          <button
            disabled={mutationPending}
            onClick={() => { setOperationError(''); setShowForm(true) }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Routine</span>
          </button>
        </div>
      </div>

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
                disabled={mutationPending}
                onClick={() => { setOperationError(''); setShowForm(true) }}
                className="text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create your first routine
              </button>
              <span className="text-slate-400">or</span>
              <button
                disabled={mutationPending}
                onClick={() => { setOperationError(''); setShowTemplates(true) }}
                className="text-purple-600 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Browse templates
              </button>
            </div>
          </div>
        ) : (
          <div role="list" aria-label="Routines" className="space-y-4">
            {routines.map((routine, index) => (
              <motion.div
                role="listitem"
                key={routine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RoutineCard
                  routine={routine}
                  pending={mutationPending}
                  onEdit={() => handleEditRoutine(routine)}
                  onDelete={() => handleDeleteRoutine(routine.id)}
                  onStart={() => handleStartRoutine(routine)}
                  onViewStats={() => handleViewStats(routine)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
            onClose={() => {
              if (!pendingActionRef.current) setShowTemplates(false)
            }}
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
