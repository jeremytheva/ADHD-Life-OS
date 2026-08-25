const REPLAN_REASONS = Object.freeze({
  EXECUTION_COMPLETED: 'execution_completed',
  SOURCE_COMPLETED: 'source_completed',
  SOURCE_PARTIAL_SUCCESS: 'source_partial_success',
  EXECUTION_CANCELLED: 'execution_cancelled',
  EXECUTION_PAUSED: 'execution_paused',
  TRANSIENT_NOT_NOW: 'transient_not_now',
  CONTEXT_CHANGED: 'context_changed',
  DATA_REFRESHED: 'data_refreshed'
})

const result = (shouldReplan, reason, mode = 'none') => Object.freeze({
  should_replan: shouldReplan,
  reason,
  mode
})

/**
 * Pure Stage 3 replanning policy.
 *
 * Modes:
 * - immediate: recompute recommendations now.
 * - after_reconciliation: source/session state is not fully reconciled; refresh/reconcile first.
 * - none: preserve the current recommendation set/session context.
 */
export const decideReplanning = ({ event, outcome, contextChanged = false } = {}) => {
  if (contextChanged) return result(true, REPLAN_REASONS.CONTEXT_CHANGED, 'immediate')

  switch (event) {
    case 'execution_completed':
      if (outcome?.status === 'partial_success' || outcome?.reconciliation_required) {
        return result(true, REPLAN_REASONS.SOURCE_PARTIAL_SUCCESS, 'after_reconciliation')
      }
      return result(true, REPLAN_REASONS.EXECUTION_COMPLETED, 'immediate')

    case 'source_completed':
      return result(true, REPLAN_REASONS.SOURCE_COMPLETED, 'immediate')

    case 'execution_cancelled':
      return result(true, REPLAN_REASONS.EXECUTION_CANCELLED, 'immediate')

    case 'data_refreshed':
      return result(true, REPLAN_REASONS.DATA_REFRESHED, 'immediate')

    case 'execution_paused':
      return result(false, REPLAN_REASONS.EXECUTION_PAUSED)

    case 'not_now':
      return result(false, REPLAN_REASONS.TRANSIENT_NOT_NOW)

    default:
      return result(false, null)
  }
}

export const replanningReasons = REPLAN_REASONS
