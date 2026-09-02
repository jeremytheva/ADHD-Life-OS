import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { executionEngine } from '../../services/executionEngine'
import LoadErrorState from '../../common/LoadErrorState'

const ENERGY_OPTIONS = ['low', 'medium', 'high']
const TIME_OPTIONS = [10, 15, 30, 60]

const pathLabel = (path) => ({
  quick_win: 'Quick win',
  momentum: 'Momentum',
  brave_frog: 'Brave frog',
  priority: 'Priority'
}[path] || 'Next action')

const NextActionPanel = ({ currentMode }) => {
  const [energy, setEnergy] = useState('medium')
  const [availableTime, setAvailableTime] = useState(15)
  const [showFitControls, setShowFitControls] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [excludedActivityIds, setExcludedActivityIds] = useState([])
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const location = useMemo(() => {
    if (!currentMode || currentMode.id === 'all') return null
    return currentMode.id
  }, [currentMode])

  const loadRecommendations = useCallback(async () => {
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
  }, [availableTime, energy, excludedActivityIds, location])

  useEffect(() => {
    loadRecommendations()
  }, [loadRecommendations])

  const recommendations = result?.recommendations || []
  const selected = recommendations[selectedIndex] || null

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
        <p className="mt-1 text-sm text-slate-600">Life OS starts with a realistic default and narrows the list before asking you to choose.</p>
      </div>

      <div className="mb-4 rounded-lg border border-emerald-200 bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Current fit</p>
            <p className="text-sm text-slate-700">{availableTime} minutes · {energy} energy</p>
          </div>
          <button
            type="button"
            aria-expanded={showFitControls}
            aria-controls="next-action-fit-controls"
            onClick={() => setShowFitControls((current) => !current)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {showFitControls ? 'Hide fit options' : 'Adjust fit'}
          </button>
        </div>

        {showFitControls && (
          <div id="next-action-fit-controls" className="mt-3 grid gap-3 border-t border-slate-200 pt-3 sm:grid-cols-2">
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
        )}
      </div>

      {feedbackMessage && (
        <p className="mb-3 text-sm text-slate-600" role="status" aria-live="polite">{feedbackMessage}</p>
      )}

      {selected && (
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Suggested next action: {selected.title}. Start with this: {selected.start_action}
        </p>
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
          </div>
          <details className="mt-3 text-sm text-slate-600">
            <summary className="w-fit cursor-pointer font-medium text-emerald-700 hover:underline">More options</summary>
            <button type="button" onClick={loadRecommendations} className="mt-2 rounded-lg px-3 py-2 font-medium text-emerald-700 hover:bg-emerald-50">
              Recheck now
            </button>
          </details>
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
