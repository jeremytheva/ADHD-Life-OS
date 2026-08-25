import {
  domainCreateSchemasByCollection,
  domainPatchSchemasByCollection,
  domainSchemasByCollection
} from '../../src/domains/schemas.js'
import {
  executionSessionCreateSchema,
  executionSessionPatchSchema,
  executionSessionSchema
} from '../../src/domains/executionSessionSchemas.js'
import { providerCapabilities } from '../../src/config/providerCapabilities.js'

const BASE_COLLECTIONS = Object.freeze(Object.keys(domainSchemasByCollection))

export const buildProxyCollectionContracts = (capabilities = providerCapabilities) => {
  const executionSessionsEnabled = capabilities?.executionSessions === true
  const collections = executionSessionsEnabled
    ? [...BASE_COLLECTIONS, 'execution-sessions']
    : [...BASE_COLLECTIONS]

  return Object.freeze({
    collections: Object.freeze(collections),
    schemas: Object.freeze({
      ...domainSchemasByCollection,
      ...(executionSessionsEnabled ? { 'execution-sessions': executionSessionSchema } : {})
    }),
    createSchemas: Object.freeze({
      ...domainCreateSchemasByCollection,
      ...(executionSessionsEnabled ? { 'execution-sessions': executionSessionCreateSchema } : {})
    }),
    patchSchemas: Object.freeze({
      ...domainPatchSchemasByCollection,
      ...(executionSessionsEnabled ? { 'execution-sessions': executionSessionPatchSchema } : {})
    })
  })
}

export const proxyCollectionContracts = buildProxyCollectionContracts()

export default proxyCollectionContracts
