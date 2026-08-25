const REQUIRED_ENV = Object.freeze([
  'NOCODEBACKEND_AUTH_BASE_URL',
  'NOCODEBACKEND_DATA_BASE_URL',
  'NOCODEBACKEND_SECRET_KEY',
  'NOCODEBACKEND_INSTANCE'
])

const safeBase = (value) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url : null
  } catch {
    return null
  }
}

const appendPath = (base, segments) => {
  const url = new URL(base)
  const prefix = url.pathname.replace(/\/$/, '')
  url.pathname = `${prefix}/${segments.map(encodeURIComponent).join('/')}`
  return url
}

export const getNoCodeBackendConfig = (env = process.env) => {
  const authBase = safeBase(env.NOCODEBACKEND_AUTH_BASE_URL)
  const dataBase = safeBase(env.NOCODEBACKEND_DATA_BASE_URL)
  const secretKey = env.NOCODEBACKEND_SECRET_KEY || null
  const instance = env.NOCODEBACKEND_INSTANCE || null

  if (!authBase || !dataBase || !secretKey || !instance) return null

  return Object.freeze({
    authBase,
    dataBase,
    secretKey,
    instance
  })
}

export const missingNoCodeBackendEnv = (env = process.env) => (
  REQUIRED_ENV.filter((name) => !env[name])
)

export const buildAuthTarget = (path, query = {}, env = process.env) => {
  const config = getNoCodeBackendConfig(env)
  if (!config) return null

  const url = appendPath(config.authBase, path)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
  }
  return Object.freeze({ url, method: null, secretKey: config.secretKey })
}

const dataOperation = (path, method) => {
  const collection = path[0]
  const id = path[1] || null

  if (method === 'GET') return { operation: 'read', collection, id, upstreamMethod: 'GET' }
  if (method === 'POST' && !id) return { operation: 'create', collection, id: null, upstreamMethod: 'POST' }
  if (method === 'PATCH' && id) return { operation: 'update', collection, id, upstreamMethod: 'PUT' }
  if (method === 'DELETE' && id) return { operation: 'delete', collection, id, upstreamMethod: 'DELETE' }
  return null
}

export const buildDataTarget = (path, method, query = {}, env = process.env) => {
  const config = getNoCodeBackendConfig(env)
  const operation = dataOperation(path, method)
  if (!config || !operation) return null

  const segments = [operation.operation, operation.collection]
  if (operation.id && operation.operation !== 'read') segments.push(operation.id)
  const url = appendPath(config.dataBase, segments)

  url.searchParams.set('Instance', config.instance)
  if (operation.id && operation.operation === 'read') url.searchParams.set('id', operation.id)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
  }

  return Object.freeze({
    url,
    method: operation.upstreamMethod,
    operation: operation.operation,
    secretKey: config.secretKey,
    itemRead: operation.operation === 'read' && Boolean(operation.id)
  })
}

export const canonicalNoCodeBackendEnv = REQUIRED_ENV
