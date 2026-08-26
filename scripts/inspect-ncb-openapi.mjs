#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import process from 'node:process'
import { pathToFileURL, URL } from 'node:url'
import { domainSchemasByCollection } from '../src/domains/schemas.js'

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
const MAX_SPEC_BYTES = 5 * 1024 * 1024
const supportedCollections = new Set(Object.keys(domainSchemasByCollection))

export class ProviderSpecEvidenceError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'ProviderSpecEvidenceError'
    this.code = code
    this.details = details
  }
}

const requireCollection = (value) => {
  if (!value || !supportedCollections.has(value)) {
    throw new ProviderSpecEvidenceError(
      'NCB_SPEC_COLLECTION_INVALID',
      `collection must be one of: ${[...supportedCollections].sort().join(', ')}`
    )
  }
  return value
}

const requireSpec = (spec) => {
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    throw new ProviderSpecEvidenceError('NCB_SPEC_INVALID', 'Provider specification must be a JSON object.')
  }

  const version = typeof spec.openapi === 'string'
    ? { format: 'openapi', version: spec.openapi }
    : typeof spec.swagger === 'string'
      ? { format: 'swagger', version: spec.swagger }
      : null

  if (!version) {
    throw new ProviderSpecEvidenceError('NCB_SPEC_VERSION_MISSING', 'Provider specification must declare openapi or swagger version metadata.')
  }

  if (!spec.paths || typeof spec.paths !== 'object' || Array.isArray(spec.paths)) {
    throw new ProviderSpecEvidenceError('NCB_SPEC_PATHS_MISSING', 'Provider specification must contain a paths object.')
  }

  return version
}

const collectionTokens = (collection) => [...new Set([
  collection.toLowerCase(),
  collection.replaceAll('-', '_').toLowerCase(),
  collection.replaceAll('-', ' ').toLowerCase()
])]

const includesToken = (value, tokens) =>
  typeof value === 'string' && tokens.some((token) => value.toLowerCase().includes(token))

const matchSignals = ({ path, operation, collection }) => {
  const tokens = collectionTokens(collection)
  const signals = []
  if (includesToken(path, tokens)) signals.push('path')
  if (includesToken(operation?.operationId, tokens)) signals.push('operation_id')
  if (Array.isArray(operation?.tags) && operation.tags.some((tag) => includesToken(tag, tokens))) signals.push('tag')
  if (includesToken(operation?.summary, tokens) || includesToken(operation?.description, tokens)) signals.push('summary_or_description')
  return signals
}

const resolveLocalRef = (spec, value) => {
  if (!value || typeof value !== 'object' || typeof value.$ref !== 'string' || !value.$ref.startsWith('#/')) return value
  const parts = value.$ref.slice(2).split('/').map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'))
  let current = spec
  for (const part of parts) {
    current = current?.[part]
    if (current === undefined) return value
  }
  return current
}

const normalizeParameter = (spec, parameter) => {
  const resolved = resolveLocalRef(spec, parameter)
  if (!resolved || typeof resolved !== 'object') return null
  if (typeof resolved.name !== 'string' || typeof resolved.in !== 'string') {
    if (typeof parameter?.$ref === 'string') return { ref: parameter.$ref }
    return null
  }
  return {
    name: resolved.name,
    in: resolved.in,
    required: resolved.required === true
  }
}

const parametersForOperation = (spec, pathItem, operation) => {
  const combined = [
    ...(Array.isArray(pathItem?.parameters) ? pathItem.parameters : []),
    ...(Array.isArray(operation?.parameters) ? operation.parameters : [])
  ]
  const normalized = combined.map((parameter) => normalizeParameter(spec, parameter)).filter(Boolean)
  const seen = new Set()
  return normalized.filter((parameter) => {
    const key = parameter.ref ? `ref:${parameter.ref}` : `${parameter.in}:${parameter.name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const securitySchemeNames = (spec, operation) => {
  const requirements = operation?.security ?? spec.security ?? []
  if (!Array.isArray(requirements)) return []
  return [...new Set(requirements.flatMap((requirement) =>
    requirement && typeof requirement === 'object' ? Object.keys(requirement) : []
  ))].sort()
}

const sanitizeServer = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return value
    url.username = ''
    url.password = ''
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch {
    return value
  }
}

const swaggerServers = (spec, operation) => {
  if (!spec.host) return []
  const basePath = typeof spec.basePath === 'string' ? spec.basePath : ''
  const schemes = Array.isArray(operation?.schemes) && operation.schemes.length
    ? operation.schemes
    : Array.isArray(spec.schemes) && spec.schemes.length
      ? spec.schemes
      : ['{scheme}']
  return schemes.map((scheme) => `${scheme}://${spec.host}${basePath}`)
}

const serversForOperation = (spec, pathItem, operation, format) => {
  const raw = format === 'openapi'
    ? (operation?.servers ?? pathItem?.servers ?? spec.servers ?? []).map((entry) => entry?.url)
    : swaggerServers(spec, operation)
  return [...new Set(raw.map(sanitizeServer).filter(Boolean))]
}

const requestBodySummary = (spec, operation, parameters, format) => {
  if (format === 'openapi') {
    const requestBody = resolveLocalRef(spec, operation?.requestBody)
    const contentTypes = requestBody?.content && typeof requestBody.content === 'object'
      ? Object.keys(requestBody.content).sort()
      : []
    return { present: Boolean(requestBody), content_types: contentTypes }
  }

  const hasBodyParameter = parameters.some((parameter) => parameter.in === 'body')
  const contentTypes = Array.isArray(operation?.consumes)
    ? [...new Set(operation.consumes)].sort()
    : Array.isArray(spec.consumes)
      ? [...new Set(spec.consumes)].sort()
      : []
  return { present: hasBodyParameter, content_types: contentTypes }
}

const responseSummary = (spec, operation, format) => {
  const responses = operation?.responses && typeof operation.responses === 'object' ? operation.responses : {}
  const statuses = Object.keys(responses).sort()
  const contentTypes = new Set()

  if (format === 'openapi') {
    for (const response of Object.values(responses)) {
      const resolved = resolveLocalRef(spec, response)
      if (resolved?.content && typeof resolved.content === 'object') {
        Object.keys(resolved.content).forEach((type) => contentTypes.add(type))
      }
    }
  } else {
    const produces = Array.isArray(operation?.produces)
      ? operation.produces
      : Array.isArray(spec.produces)
        ? spec.produces
        : []
    produces.forEach((type) => contentTypes.add(type))
  }

  return { statuses, content_types: [...contentTypes].sort() }
}

const namedParameter = (parameters, name) => {
  const parameter = parameters.find((candidate) => candidate.name === name)
  return parameter
    ? { present: true, in: parameter.in, required: parameter.required }
    : { present: false }
}

const summarizeOperation = ({ spec, format, path, pathItem, method, operation, collection }) => {
  const parameters = parametersForOperation(spec, pathItem, operation)
  return {
    path,
    provider_method: method.toUpperCase(),
    operation_id: typeof operation?.operationId === 'string' ? operation.operationId : null,
    match_signals: matchSignals({ path, operation, collection }),
    servers: serversForOperation(spec, pathItem, operation, format),
    parameters,
    instance_parameter: namedParameter(parameters, 'Instance'),
    ownership_parameter: namedParameter(parameters, 'user_id'),
    request_body: requestBodySummary(spec, operation, parameters, format),
    responses: responseSummary(spec, operation, format),
    security_schemes: securitySchemeNames(spec, operation)
  }
}

export const inspectProviderSpec = ({ spec, collection, rawText = JSON.stringify(spec) }) => {
  const verifiedCollection = requireCollection(collection)
  const { format, version } = requireSpec(spec)
  const candidates = []

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    if (!pathItem || typeof pathItem !== 'object' || Array.isArray(pathItem)) continue
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method]
      if (!operation || typeof operation !== 'object' || Array.isArray(operation)) continue
      const signals = matchSignals({ path, operation, collection: verifiedCollection })
      if (!signals.length) continue
      candidates.push(summarizeOperation({
        spec,
        format,
        path,
        pathItem,
        method,
        operation,
        collection: verifiedCollection
      }))
    }
  }

  if (!candidates.length) {
    throw new ProviderSpecEvidenceError(
      'NCB_SPEC_COLLECTION_NOT_FOUND',
      `No provider operations in the supplied specification matched collection ${verifiedCollection}.`
    )
  }

  candidates.sort((a, b) => a.path.localeCompare(b.path) || a.provider_method.localeCompare(b.provider_method))

  return {
    passed: true,
    evidence_state: 'CANDIDATE_ONLY',
    application_collection: verifiedCollection,
    spec: {
      format,
      version,
      title: typeof spec.info?.title === 'string' ? spec.info.title : null,
      api_version: typeof spec.info?.version === 'string' ? spec.info.version : null,
      sha256: createHash('sha256').update(rawText).digest('hex')
    },
    candidate_count: candidates.length,
    candidates,
    next_required_evidence: [
      'confirm the target instance represented by this specification',
      'exercise the exact candidate operation against the target provider',
      'record success envelope and representative failure behaviour',
      'enable only operations supported by connected evidence'
    ]
  }
}

export const inspectProviderSpecFile = async ({ specPath, collection }) => {
  if (!specPath) {
    throw new ProviderSpecEvidenceError('NCB_SPEC_PATH_MISSING', 'A JSON provider spec path is required via --spec or NOCODEBACKEND_OPENAPI_SPEC.')
  }

  let metadata
  try {
    metadata = await stat(specPath)
  } catch {
    throw new ProviderSpecEvidenceError('NCB_SPEC_FILE_UNREADABLE', 'Provider spec file could not be read.')
  }
  if (!metadata.isFile() || metadata.size > MAX_SPEC_BYTES) {
    throw new ProviderSpecEvidenceError('NCB_SPEC_FILE_INVALID', `Provider spec must be a JSON file no larger than ${MAX_SPEC_BYTES} bytes.`)
  }

  let rawText
  try {
    rawText = await readFile(specPath, 'utf8')
  } catch {
    throw new ProviderSpecEvidenceError('NCB_SPEC_FILE_UNREADABLE', 'Provider spec file could not be read.')
  }

  let spec
  try {
    spec = JSON.parse(rawText)
  } catch {
    throw new ProviderSpecEvidenceError('NCB_SPEC_JSON_INVALID', 'Provider spec must be valid JSON. Export Swagger/OpenAPI as JSON before inspection.')
  }

  return inspectProviderSpec({ spec, collection, rawText })
}

const parseArgs = (argv) => ({
  specPath: argv.find((arg) => arg.startsWith('--spec='))?.slice('--spec='.length) ?? process.env.NOCODEBACKEND_OPENAPI_SPEC ?? null,
  collection: argv.find((arg) => arg.startsWith('--collection='))?.slice('--collection='.length) ?? null
})

const main = async () => {
  const result = await inspectProviderSpecFile(parseArgs(process.argv.slice(2)))
  process.stdout.write(`${JSON.stringify({ inspection: 'passed', ...result }, null, 2)}\n`)
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isCli) {
  main().catch((error) => {
    const failure = error instanceof ProviderSpecEvidenceError
      ? { code: error.code, message: error.message, details: error.details }
      : { code: 'NCB_SPEC_UNEXPECTED', message: error instanceof Error ? error.message : String(error) }
    process.stderr.write(`${JSON.stringify({ inspection: 'failed', error: failure }, null, 2)}\n`)
    process.exitCode = 1
  })
}
