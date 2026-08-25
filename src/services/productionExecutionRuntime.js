import { repositories } from '../infrastructure/nocodebackend/repositories.js'
import { createExecutionSessionService } from './executionSessionService.js'
import { createSourceCompletionAdapter } from './sourceCompletionAdapter.js'
import { createExecutionCompletionService } from './executionCompletionService.js'
import { createExecutionCoordinator } from './executionCoordinator.js'
import { createExecutionRuntime } from './executionRuntime.js'
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

  return createExecutionRuntime({ coordinator })
}

export const productionExecutionRuntime = createProductionExecutionRuntime()

export default productionExecutionRuntime
