import {
  executionSessionCreateSchema,
  executionSessionPatchSchema,
  executionSessionSchema
} from '../../domains/executionSessionSchemas.js'
import { requestDataEndpoint } from './dataClient'
import { DomainValidationError, NoCodeBackendError } from './errors'

const COLLECTION = 'execution-sessions'

const validate = (schema, value, message) => {
  const result = schema.safeParse(value)
  if (!result.success) throw new DomainValidationError(message, result.error.flatten())
  return result.data
}

const requireRecord = (record, id = 'record') => {
  if (!record) {
    throw new NoCodeBackendError(`Execution session ${id} was not found.`, {
      code: 'NOT_FOUND',
      status: 404
    })
  }
  return validate(executionSessionSchema, record, 'Invalid execution-session response.')
}

const toQuery = (filters = {}) => {
  const query = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(key, String(value))
  })
  const encoded = query.toString()
  return encoded ? `?${encoded}` : ''
}

/**
 * Prepared execution-session repository.
 *
 * This adapter is intentionally not added to the production repository registry
 * and `execution-sessions` is intentionally absent from the server proxy
 * collection allowlist until the target NoCodeBackend instance is certified.
 */
export const executionSessionRepository = Object.freeze({
  async list(filters = {}) {
    const result = await requestDataEndpoint(`${COLLECTION}${toQuery(filters)}`)
    if (!Array.isArray(result)) {
      throw new DomainValidationError('Invalid execution-session list response.', result)
    }
    return result.map((record) => requireRecord(record))
  },

  async get(id, filters = {}) {
    const record = await requestDataEndpoint(`${COLLECTION}/${encodeURIComponent(id)}${toQuery(filters)}`)
    return requireRecord(record, id)
  },

  async create(record) {
    const body = validate(
      executionSessionCreateSchema,
      record,
      'Invalid execution-session create request.'
    )
    return requireRecord(
      await requestDataEndpoint(COLLECTION, { method: 'POST', body }),
      'created'
    )
  },

  async update(id, record, filters = {}) {
    const body = validate(
      executionSessionPatchSchema,
      record,
      'Invalid execution-session update request.'
    )
    return requireRecord(
      await requestDataEndpoint(
        `${COLLECTION}/${encodeURIComponent(id)}${toQuery(filters)}`,
        { method: 'PATCH', body }
      ),
      id
    )
  }
})

export default executionSessionRepository
