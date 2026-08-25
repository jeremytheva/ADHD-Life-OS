import { repositories } from '../infrastructure/nocodebackend/repositories.js'
import { activityService } from './activityService.js'
import { createExecutionSessionService } from './executionSessionService.js'
import { createSourceCompletionAdapter } from './sourceCompletionAdapter.js'
import { createExecutionCompletionService } from './executionCompletionService.js'
import { createExecutionCoordinator } from './executionCoordinator.js'
import { createExecutionRuntime } from './executionRuntime.js'
import { createExecutionSourceResolver } from './executionSourceResolver.js'
import { createExecutionRecoveryService } from './executionRecoveryService.js'
import { taskService } from './taskService.js'
import { houseworkService } from './houseworkService.js'

const routineEntryAdapter = Object.freeze({
  async open({ routine_id, step_id }) {
    return Object.freeze({
      path: '/routines',
      routine_id: String(routine_id),
      step_id: String(step_id)
    })
  }
})

const createSourceCompletion = () => createSourceCompletionAdapter({
  task: ({ source_id }) => taskService.completeTask(source_id),
  projectTask: ({ source_id }) => taskService.completeTask(source_id),
  chore: ({ source_id }) => houseworkService.completeHouseworkTask(source_id)
})

const resolveCanonicalSource = async ({ source_id, execution_session }) => {
  const activities = await activityService.getActivities()
  return activities.find((activity) => (
    String(activity.type || activity.source_type) === String(execution_session.activity_type) &&
    String(activity.source_id || activity.id) === String(source_id)
  )) || null
}

const createSourceRecovery = () => createExecutionRecoveryService({
  sourceResolver: createExecutionSourceResolver({
    task: resolveCanonicalSource,
    projectTask: resolveCanonicalSource,
    chore: resolveCanonicalSource
  })
})

export const createProductionExecutionRuntime = ({ executionSessionRepository = repositories.executionSessions } = {}) => {
  if (!executionSessionRepository) return createExecutionRuntime()

  const sessionService = createExecutionSessionService(executionSessionRepository)
  const completionService = createExecutionCompletionService({
    sessionService,
    sourceCompletionAdapter: createSourceCompletion()
  })
  const coordinator = createExecutionCoordinator({
    sessionService,
    completionService,
    routineEntryAdapter
  })
  const recoveryService = createSourceRecovery()

  return createExecutionRuntime({ coordinator, recoveryService })
}

export const productionExecutionRuntime = createProductionExecutionRuntime()

export default productionExecutionRuntime
