const freezeOperation = (operation = {}) => Object.freeze({
  verified: operation.verified === true,
  providerMethod: operation.providerMethod ?? null,
  pathTemplate: operation.pathTemplate ?? null,
  evidence: operation.evidence ?? null
})

export const DATA_PROVIDER_CONTRACT_STATES = Object.freeze({
  VERIFIED: 'VERIFIED',
  UNVERIFIED: 'UNVERIFIED'
})

export const defineDataProviderContract = ({ state, evidence = null, operations = {} }) => Object.freeze({
  state,
  evidence,
  operations: Object.freeze({
    list: freezeOperation(operations.list),
    get: freezeOperation(operations.get),
    create: freezeOperation(operations.create),
    update: freezeOperation(operations.update),
    delete: freezeOperation(operations.delete)
  })
})

// Production remains fail-closed until the target ADHD Life OS NoCodeBackend
// instance has been inspected and each physical operation below has evidence.
// The browser-facing application routes stay stable; only this provider-side
// mapping changes when the real generated contract is certified.
export const dataProviderContract = defineDataProviderContract({
  state: DATA_PROVIDER_CONTRACT_STATES.UNVERIFIED,
  evidence: 'Target-instance generated data API contract has not been certified.',
  operations: {}
})

export const operationKeyForRequest = (method, hasId) => {
  switch (method) {
    case 'GET': return hasId ? 'get' : 'list'
    case 'POST': return hasId ? null : 'create'
    case 'PATCH': return hasId ? 'update' : null
    case 'DELETE': return hasId ? 'delete' : null
    default: return null
  }
}
