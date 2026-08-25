import React from 'react'

const secondaryLabel = (action) => ({
  pause: 'Pause',
  complete: 'Complete',
  cancel: 'Stop'
}[action] || action)

const ExecutionControls = ({
  presentation,
  recommendation = null,
  busy = false,
  onPrimaryAction,
  onSecondaryAction
}) => {
  if (!presentation || presentation.mode === 'idle') return null

  const title = presentation.session?.title_snapshot || recommendation?.title || 'Current activity'
  const canInvokePrimary = Boolean(presentation.primary_action && onPrimaryAction && !busy)

  return (
    <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-4" data-execution-mode={presentation.mode}>
      {(presentation.mode === 'active' || presentation.mode === 'paused') && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {presentation.mode === 'paused' ? 'Paused execution' : 'Current execution'}
          </p>
          <p className="mt-1 font-medium text-slate-900">{title}</p>
        </div>
      )}

      {presentation.message && (
        <p
          className="mb-3 text-sm text-slate-700"
          role={presentation.mode === 'execution_error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {presentation.message}
        </p>
      )}

      {presentation.mode === 'reconciliation_required' && (
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-amber-700">
          Completion needs checking
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {presentation.primary_action && (
          <button
            type="button"
            disabled={!canInvokePrimary}
            onClick={() => onPrimaryAction?.(presentation.primary_action)}
            className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Working…' : presentation.primary_label}
          </button>
        )}

        {(presentation.secondary_actions || []).map((action) => (
          <button
            key={action}
            type="button"
            disabled={busy || !onSecondaryAction}
            onClick={() => onSecondaryAction?.(action)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {secondaryLabel(action)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ExecutionControls
