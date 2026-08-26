import process from 'node:process'
import {
  DATA_PROVIDER_CONTRACT_STATES,
  dataProviderContract,
  operationKeyForRequest
} from './dataProviderContract.js'

const SUPPORTED_PROVIDER_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
const TEMPLATE_TOKEN_PATTERN = /\{([a-zA-Z0-9_-]+)\}/g

export class DataProviderContractError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'DataProviderContractError'
    this.code = code
  }
}

const requireRuntimeConfiguration = (env) => {
  const missing = [
    'NOCODEBACKEND_DATA_BASE_URL',
    'NOCODEBACKEND_SECRET_KEY',
    'NOCODEBACKEND_INSTANCE'
  ].filter((name) => !env[name])

  if (missing.length) {
    throw new DataProviderContractError(
      'NCB_PROVIDER_CONFIG_MISSING',
      `Required NoCodeBackend data-provider configuration is missing: ${missing.join(', ')}`
    )
  }

  let base
  try {
    base = new URL(env.NOCODEBACKEND_DATA_BASE_URL)
  } catch {
    throw new DataProviderContractError('NCB_PROVIDER_CONFIG_INVALID', 'NoCodeBackend data base URL is invalid.')
  }

  if (!['http:', 'https:'].includes(base.protocol) || base.search || base.hash) {
    throw new DataProviderContractError('NCB_PROVIDER_CONFIG_INVALID', 'NoCodeBackend data base URL must be an HTTP(S) base URL without query or fragment data.')
  }

  if (!base.pathname.endsWith('/')) base.pathname += '/'
  return base
}

const requireVerifiedOperation = ({ contract, appMethod, id }) => {
  const operationKey = operationKeyForRequest(appMethod, Boolean(id))
  if (!operationKey) {
    throw new DataProviderContractError('NCB_PROVIDER_CONTRACT_INVALID', 'Application data operation cannot be mapped to a provider operation.')
  }

  const operation = contract?.operations?.[operationKey]
  if (contract?.state !== DATA_PROVIDER_CONTRACT_STATES.VERIFIED || operation?.verified !== true) {
    throw new DataProviderContractError(
      'NCB_PROVIDER_CONTRACT_UNVERIFIED',
      `No verified target-instance provider contract exists for data operation ${operationKey}.`
    )
  }

  const providerMethod = operation.providerMethod?.toUpperCase()
  if (!SUPPORTED_PROVIDER_METHODS.has(providerMethod) || typeof operation.pathTemplate !== 'string' || !operation.pathTemplate.trim()) {
    throw new DataProviderContractError('NCB_PROVIDER_CONTRACT_INVALID', `Verified provider operation ${operationKey} is incomplete or invalid.`)
  }

  return { operationKey, operation: { ...operation, providerMethod } }
}

const renderPath = (template, { collection, id }) => {
  const values = { collection, id }
  const tokens = [...template.matchAll(TEMPLATE_TOKEN_PATTERN)].map((match) => match[1])
  if (tokens.some((token) => !Object.hasOwn(values, token))) {
    throw new DataProviderContractError('NCB_PROVIDER_CONTRACT_INVALID', 'Provider path template contains an unsupported placeholder.')
  }

  let rendered = template
  for (const token of tokens) {
    const value = values[token]
    if (value === undefined || value === null || value === '') {
      throw new DataProviderContractError('NCB_PROVIDER_CONTRACT_INVALID', `Provider path template requires ${token}.`)
    }
    rendered = rendered.replaceAll(`{${token}}`, encodeURIComponent(String(value)))
  }

  if (rendered.includes('{') || rendered.includes('}')) {
    throw new DataProviderContractError('NCB_PROVIDER_CONTRACT_INVALID', 'Provider path template contains an unresolved placeholder.')
  }

  return rendered.replace(/^\/+/, '')
}

export const assertDataProviderReady = ({
  appMethod,
  id,
  contract = dataProviderContract,
  env = process.env
}) => {
  const base = requireRuntimeConfiguration(env)
  const { operationKey, operation } = requireVerifiedOperation({ contract, appMethod, id })
  return { base, operationKey, operation }
}

export const buildDataProviderRequest = ({
  appMethod,
  collection,
  id,
  query = {},
  body,
  contract = dataProviderContract,
  env = process.env
}) => {
  const { base, operationKey, operation } = assertDataProviderReady({ appMethod, id, contract, env })
  const relativePath = renderPath(operation.pathTemplate, { collection, id })
  const url = new URL(relativePath, base)

  // The generated data API uses the provider instance as server-owned
  // configuration. The browser cannot override this value.
  url.searchParams.set('Instance', env.NOCODEBACKEND_INSTANCE)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
  }

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${env.NOCODEBACKEND_SECRET_KEY}`
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  return {
    operationKey,
    url,
    method: operation.providerMethod,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  }
}
