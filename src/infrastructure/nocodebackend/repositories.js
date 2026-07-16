import { requestDataEndpoint } from './dataClient'
import { NoCodeBackendError } from './errors'

const toQuery = (filters = {}) => {
  const query = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(key, String(value))
  })
  const value = query.toString()
  return value ? `?${value}` : ''
}

const requireRecord = (record, collection, id) => {
  if (!record) throw new NoCodeBackendError(`${collection} record ${id} was not found.`, { code: 'NOT_FOUND', status: 404 })
  return record
}

/** Domain repository interface over NoCodeBackend's /data/:collection endpoints. */
export const createNoCodeBackendRepository = (collection) => ({
  async list(filters) {
    const result = await requestDataEndpoint(`${collection}${toQuery(filters)}`)
    if (!Array.isArray(result)) throw new NoCodeBackendError(`Invalid ${collection} list response.`, { code: 'NCB_INVALID_RESPONSE', details: result })
    return result
  },
  async get(id, filters = {}) {
    return requireRecord(await requestDataEndpoint(`${collection}/${encodeURIComponent(id)}${toQuery(filters)}`), collection, id)
  },
  async create(record) {
    return requireRecord(await requestDataEndpoint(collection, { method: 'POST', body: record }), collection, 'created')
  },
  async update(id, record, filters = {}) {
    return requireRecord(await requestDataEndpoint(`${collection}/${encodeURIComponent(id)}${toQuery(filters)}`, { method: 'PATCH', body: record }), collection, id)
  },
  async remove(id, filters = {}) {
    await requestDataEndpoint(`${collection}/${encodeURIComponent(id)}${toQuery(filters)}`, { method: 'DELETE' })
    return true
  }
})

export const repositories = Object.freeze({
  preferences: createNoCodeBackendRepository('user-preferences'),
  tasks: createNoCodeBackendRepository('tasks'),
  projects: createNoCodeBackendRepository('projects'),
  subtasks: createNoCodeBackendRepository('subtasks'),
  routines: createNoCodeBackendRepository('routines'),
  routineSteps: createNoCodeBackendRepository('routine-steps'),
  routineSessions: createNoCodeBackendRepository('routine-sessions'),
  houseworkTasks: createNoCodeBackendRepository('housework-tasks'),
  houseworkCompletions: createNoCodeBackendRepository('housework-completions'),
  inboxItems: createNoCodeBackendRepository('inbox-items')
})
