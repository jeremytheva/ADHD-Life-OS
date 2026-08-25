const TERMINAL_SOURCE_STATUSES = new Set(['completed', 'archived', 'cancelled'])
const ACTIVE_SESSION_STATUSES = new Set(['in_progress', 'paused'])

const result = (mode, values = {}) => Object.freeze({ mode, ...values })

const sourceStatus = (source = {}) => {
  if (source.completed || source.is_completed) return 'completed'
  return String(source.status || '').toLowerCase() || null
}

export const assessExecutionSourceRecovery = ({ session = null, sourceActivity = null } = {}) => {
  if (!session || !ACTIVE_SESSION_STATUSES.has(session.status)) {
    return result('none', {
      recovery_required: false,
      can_resume: false,
      can_complete: false,
      suggested_action: null
    })
  }

  if (!sourceActivity) {
    return result('source_missing', {
      recovery_required: true,
      can_resume: false,
      can_complete: false,
      suggested_action: 'cancel_execution',
      message: 'The source item is no longer available. Keep the saved execution history, but do not continue or complete it against a missing source.'
    })
  }

  const sourceId = String(sourceActivity.source_id || sourceActivity.id || '')
  if (sourceId && String(session.source_id) !== sourceId) {
    return result('source_mismatch', {
      recovery_required: true,
      can_resume: false,
      can_complete: false,
      suggested_action: 'refresh_source',
      message: 'The recovered execution does not match the loaded source item. Refresh authoritative data before acting.'
    })
  }

  const status = sourceStatus(sourceActivity)

  if (status === 'completed') {
    return result('source_completed_elsewhere', {
      recovery_required: true,
      can_resume: false,
      can_complete: false,
      suggested_action: 'reconcile_execution',
      message: 'The source item was already completed elsewhere. Reconcile the execution session instead of completing the source again.'
    })
  }

  if (TERMINAL_SOURCE_STATUSES.has(status)) {
    return result('source_closed', {
      recovery_required: true,
      can_resume: false,
      can_complete: false,
      suggested_action: 'cancel_execution',
      message: 'The source item is no longer active. Do not resume or complete it through this execution session.'
    })
  }

  return result('recoverable', {
    recovery_required: false,
    can_resume: true,
    can_complete: true,
    suggested_action: session.status === 'paused' ? 'continue' : 'resume_current',
    message: null
  })
}

export default assessExecutionSourceRecovery
