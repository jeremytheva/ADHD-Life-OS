import React, { useEffect, useMemo, useState } from 'react'
import { executionEngine } from '../../services/executionEngine'
import LoadErrorState from '../../common/LoadErrorState'
import ExecutionControls from './ExecutionControls'

const ENERGY_OPTIONS = ['low', 'medium', 'high']
const TIME_OPTIONS = [10, 15, 30, 60]

const pathLabel = (path) => ({
  quick_win: 'Quick win',
  momentum: 'Momentum',
  brave_frog: 'Brave frog',
  priority: 'Priority'
}[path] || 'Next action')

const NextActionPanel = ({ currentMode, executionRuntime = null, userId = null }) => {
  const [energy, setEnergy] = useState('medium')
  const [availableTime, setAvailableTime] = useState(15)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [excludedActivityIds, setExcludedActivityIds] = useState([])
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [executionState, setExecutionState] = useState(null)
  const [executionBusy, setExecutionBusy] = useState(false)
  const [executionError, setExecutionError] = useState('')
  const [latestExecutionResult, setLatestExecutionResult] = useState(null)

  const location = useMemo(() => {
    if (!currentMode || currentMode.id === 'all') return null
    return currentMode.id
  }, [currentMode])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      setLoadError(false)
      const next = await executionEngine.getNextActions({
        current_energy: energy,
        available_time: availableTime,
        current_location: location
      }, {
        limit: 3,
        excludeActivityIds: excludedActivityIds
      })
      setResult(next)
      setSelectedIndex(0)
    } catch (error) {
      console.error('Error loading next actions:', error)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [energy, availableTime, location, excludedActivityIds])

  const recommendations = result?.recommendations || []
  const selected = recommendations[selectedIndex] || null
  const runtimeAvailable = Boolean(executionRuntime?.available && userId)

  const refreshExecutionState = async (latestResult = latestExecutionResult) => {
    if (!runtimeAvailable) {
      setExecutionState(null)
      return null
    }

    try {
      setExecutionError('')
      const next = await executionRuntime.getState({
        userId,
        recommendation: selected?.activity || null,
        latestResult
      })
      setExecutionState(next)
      return next
    } catch (error) {
      console.error('Error loading execution state:', error)
      setExecutionError('Execution status could not be loaded. Your recommendation has not been changed.')
      return null
    }
  }

  useEffect(() => {
    refreshExecutionState()
  }, [runtimeAvailable, userId, selected?.activity_id])

  const runExecutionAction = async (action) => {
    if (!runtimeAvailable || executionBusy) return

    const session = executionState?.currentExecution?.session || null
    try {
      setExecutionBusy(true)
      setExecutionError('')
      let outcome = null

      if (action === 'start' || action === 'open_routine') {
        if (!selected?.activity) throw new Error('No executable activity is selected.')
        outcome = await executionRuntime.start({ userId, activity: selected.activity })
      } else if (action === 'continue') {
        if (!session) throw new Error('No paused execution is available to continue.')
        outcome = await executionRuntime.resume({ session })
      } else if (action === 'pause') {
        if (!session) throw new Error('No active execution is available to pause.')
        outcome = await executionRuntime.pause({ session })
      } else if (action === 'complete') {
        if (!session) throw new Error('No active execution is available to complete.')
        outcome = await executionRuntime.complete({ session })
      } else if (action === 'cancel') {
        if (!session) throw new Error('No active execution is available to stop.')
        outcome = await executionRuntime.cancel({ session })
      } else if (action === 'refresh_status') {
        await refreshExecutionState(null)
        return
      } else {
        throw new Error(`Unsupported execution action: ${action}`)
      }

      setLatestExecutionResult(outcome)
      await refreshExecutionState(outcome)

      if (outcome?.replanning?.should_replan && outcome.replanning.mode === 'immediate') {
        await loadRecommendations()
      }
    } catch (error) {
      console.error('Execution action failed:', error)
      setExecutionError('That execution change was not confirmed. Your current work remains safe to retry.')
    } finally {
      setExecutionBusy(false)
    }
  }

  const chooseAnother = () => {
    if (recommendations.length < 2) return
    setSelectedIndex((index) => (index + 1) % recommendations.length)
  }

  const markNotNow = () => {
    if (!selected?.activity_id) return
    setFeedbackMessage(`${selected.title || 'That activity'} is out of the suggestions for now. Nothing was changed.`)
    setExcludedActivityIds((current) => (
      current.includes(selected.activity_id)
        ? current
        : [...current, selected.activity_id]
    ))
  }

  const restoreSkippedOptions = () => {
    setFeedbackMessage('Skipped options are available again.')
    setExcludedActivityIds([])
  }

  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5" aria-labelledby="next-action-title">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Execution support</p>
        <h2 id="next-action-title" className="text-xl font-semibold text-slate-900">What should I do now?</h2>
        <p className="mt-1 text-sm text-slate-600">Set what you have available. Life OS will narrow the list before asking you to choose.</p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Energy now
          <select
            aria-label="Energy now"
            value={energy}
            onChange={(event) => setEnergy(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            {ENERGY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Time available
          <select
            aria-label="Time available"
            value={availableTime}
            onChange={(event) => setAvailableTime(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            {TIME_OPTIONS.map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
          </select>
        </label>
      </div>

      {feedbackMessage && (
        <p className="mb-3 text-sm text-slate-600" role="status" aria-live="polite">{feedbackMessage}</p>
      )}

      {executionError && runtimeAvailable && (
        <p className="mb-3 text-sm text-rose-700" role="alert">{executionError}</p>
      )}

      {runtimeAvailable && executionState?.presentation && (
        <ExecutionControls
          presentation={executionState.presentation}
          recommendation={selected}
          busy={executionBusy}
          onPrimaryAction={runExecutionAction}
          onSecondaryAction={runExecutionAction}
        />
      )}

      {loading && <p className="text-sm text-slate-600" role="status">Finding a realistic next action…</p>}

      {!loading && loadError && (
        <LoadErrorState
          title="We couldn’t choose a next action"
          message="Your activities have not changed. Try the recommendation again."
          onRetry={loadRecommendations}
        />
      )}

      {!loading && !loadError && !selected && (
        <div className="rounded-lg border border-emerald-200 bg-white p-4">
          <h3 className="font-medium text-slate-900">
            {excludedActivityIds.length > 0 ? 'Nothing else fits right now' : 'Nothing fits these constraints yet'}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {excludedActivityIds.length > 0
              ? 'You can bring skipped options back or change your time and energy. No task has been changed.'
              : 'Try a longer time window or different energy level. No task has been changed.'}
          </p>
        </div>
      )}

      {!loading && !loadError && selected && (
        <div className="rounded-lg border border-emerald-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-700">
            <span>{pathLabel(selected.path)}</span>
            <span aria-hidden="true">•</span>
            <span>{selected.fits_available_time ? `${selected.estimated_duration_minutes} min` : `${selected.start_minutes} min start`}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{selected.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{selected.reason}</p>
          <div className="mt-3 rounded-lg bg-emerald-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Start with this</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{selected.start_action}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={markNotNow} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Not now
            </button>
            {recommendations.length > 1 && (
              <button type="button" onClick={chooseAnother} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Give me another option
              </button>
            )}
            <button type="button" onClick={loadRecommendations} className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
              Recheck now
            </button>
          </div>
        </div>
      )}

      {excludedActivityIds.length > 0 && !loading && !loadError && (
        <button type="button" onClick={restoreSkippedOptions} className="mt-3 text-sm font-medium text-emerald-700 hover:underline">
          Bring skipped options back
        </button>
      )}
    </section>
  )
}

export default NextActionPanel
