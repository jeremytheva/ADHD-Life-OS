import { resolveExecutionEntry } from './executionEntryRouting.js'

const view = (mode, values = {}) => Object.freeze({ mode, ...values })

export const deriveExecutionPresentation = ({
  recommendation = null,
  currentExecution = null,
  latestResult = null
} = {}) => {
  if (latestResult?.status === 'partial_success' || latestResult?.outcome?.reconciliation_required) {
    return view('reconciliation_required', {
      owner: latestResult.owner || 'generic_execution_session',
      primary_action: 'refresh_status',
      primary_label: 'Check completion status',
      can_start_another: false,
      message: 'The execution was saved, but the source item still needs reconciliation before choosing something new.'
    })
  }

  if (latestResult?.status === 'failed') {
    return view('execution_error', {
      owner: latestResult.owner || currentExecution?.owner || null,
      primary_action: 'retry_current',
      primary_label: 'Try again',
      can_start_another: false,
      message: 'That execution change did not complete. Your current work remains available.'
    })
  }

  const session = currentExecution?.session || null
  if (currentExecution?.status === 'active' && session?.status === 'paused') {
    return view('paused', {
      owner: 'generic_execution_session',
      session,
      primary_action: 'continue',
      primary_label: 'Continue',
      secondary_actions: ['complete', 'cancel'],
      can_start_another: false
    })
  }

  if (currentExecution?.status === 'active' && session?.status === 'in_progress') {
    return view('active', {
      owner: 'generic_execution_session',
      session,
      primary_action: 'continue',
      primary_label: 'Keep going',
      secondary_actions: ['pause', 'complete', 'cancel'],
      can_start_another: false
    })
  }

  if (latestResult?.status === 'routed' && latestResult.owner === 'routine_session') {
    return view('routine_routed', {
      owner: 'routine_session',
      primary_action: 'open_routine',
      primary_label: 'Open routine',
      can_start_another: false,
      routine: latestResult.routine || null
    })
  }

  if (recommendation) {
    const entry = resolveExecutionEntry(recommendation)
    if (entry.owner === 'routine_session') {
      return view('startable', {
        owner: 'routine_session',
        entry,
        primary_action: 'open_routine',
        primary_label: 'Start routine',
        can_start_another: true
      })
    }

    return view('startable', {
      owner: 'generic_execution_session',
      entry,
      primary_action: 'start',
      primary_label: 'Start this',
      can_start_another: true
    })
  }

  return view('idle', {
    owner: null,
    primary_action: null,
    primary_label: null,
    can_start_another: true
  })
}

export default deriveExecutionPresentation
