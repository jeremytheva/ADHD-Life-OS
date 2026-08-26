#!/usr/bin/env node

import process from 'node:process'
import { pathToFileURL, URL } from 'node:url'
import { domainSchemasByCollection } from '../src/domains/schemas.js'

export class ProviderReadCertificationError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'ProviderReadCertificationError'
    this.code = code
    this.details = details
  }
}

const supportedCollections = new Set(Object.keys(domainSchemasByCollection))

const requireCollection = (value) => {
  if (!value || !supportedCollections.has(value)) {
    throw new ProviderReadCertificationError(
      'NCB_READ_CERT_COLLECTION_INVALID',
      `collection must be one of: ${[...supportedCollections].sort().join(', ')}`
    )
  }
  return value
}

const requireSecret = (value) => {
  if (!value) {
    throw new ProviderReadCertificationError('NCB_READ_CERT_CONFIG_MISSING', 'NOCODEBACKEND_SECRET_KEY is required.')
  }
  return value
}

const requireInstance = (value) => {
  if (!value) {
    throw new ProviderReadCertificationError('NCB_READ_CERT_CONFIG_MISSING', 'NOCODEBACKEND_INSTANCE is required.')
  }
  return value
}

const requireReadUrl = (value, instance, expectedUserId) => {
  if (!value) {
    throw new ProviderReadCertificationError('NCB_READ_CERT_CONFIG_MISSING', 'NOCODEBACKEND_CERT_READ_URL is required.')
  }

  let url
  try {
    url = new URL(value)
  } catch {
    throw new ProviderReadCertificationError('NCB_READ_CERT_URL_INVALID', 'NOCODEBACKEND_CERT_READ_URL must be an absolute HTTP(S) URL.')
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash) {
    throw new ProviderReadCertificationError(
      'NCB_READ_CERT_URL_INVALID',
      'NOCODEBACKEND_CERT_READ_URL must be an HTTP(S) URL without credentials or a fragment.'
    )
  }

  if (url.searchParams.get('Instance') !== instance) {
    throw new ProviderReadCertificationError(
      'NCB_READ_CERT_INSTANCE_MISMATCH',
      'The certification URL must contain the exact configured Instance query value.'
    )
  }

  if (expectedUserId && url.searchParams.get('user_id') !== String(expectedUserId)) {
    throw new ProviderReadCertificationError(
      'NCB_READ_CERT_OWNERSHIP_FILTER_MISSING',
      'When NOCODEBACKEND_CERT_USER_ID is supplied, the certification URL must contain the same user_id filter.'
    )
  }

  return url
}

const endpointEvidence = (url) => ({
  origin: url.origin,
  path: url.pathname,
  query_keys: [...new Set([...url.searchParams.keys()])].sort()
})

const parseArrayEnvelope = (payload) => {
  if (Array.isArray(payload)) return { records: payload, envelope: 'array' }
  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return { records: payload.data, envelope: 'data-array' }
  }
  throw new ProviderReadCertificationError(
    'NCB_READ_CERT_ENVELOPE_INVALID',
    'Read response must be an array or an object containing a data array.'
  )
}

const validateDomainRecords = (collection, records) => {
  const schema = domainSchemasByCollection[collection]
  for (let index = 0; index < records.length; index += 1) {
    const parsed = schema.safeParse(records[index])
    if (!parsed.success) {
      throw new ProviderReadCertificationError(
        'NCB_READ_CERT_DOMAIN_INVALID',
        `Provider record ${index} does not satisfy the ${collection} application schema.`,
        {
          record_index: index,
          issues: parsed.error.issues.slice(0, 10).map((issue) => ({
            path: issue.path.join('.'),
            code: issue.code,
            message: issue.message
          }))
        }
      )
    }
  }
}

const validateOwnership = (records, expectedUserId) => {
  if (!expectedUserId) return 'not_checked'
  const mismatchedIndex = records.findIndex((record) => String(record?.user_id) !== String(expectedUserId))
  if (mismatchedIndex !== -1) {
    throw new ProviderReadCertificationError(
      'NCB_READ_CERT_OWNERSHIP_MISMATCH',
      'The filtered provider response contained a record owned by a different user.',
      { record_index: mismatchedIndex }
    )
  }
  return 'passed'
}

export const certifyProviderRead = async ({
  fetchImpl = globalThis.fetch,
  collection,
  readUrl,
  secret,
  instance,
  expectedUserId = null
}) => {
  const verifiedCollection = requireCollection(collection)
  const verifiedSecret = requireSecret(secret)
  const verifiedInstance = requireInstance(instance)
  const url = requireReadUrl(readUrl, verifiedInstance, expectedUserId)

  let response
  try {
    response = await fetchImpl(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${verifiedSecret}`
      }
    })
  } catch (error) {
    throw new ProviderReadCertificationError(
      'NCB_READ_CERT_NETWORK_FAILED',
      'Provider read request failed before receiving a response.',
      { cause: error instanceof Error ? error.message : String(error) }
    )
  }

  const text = await response.text()
  if (!response.ok) {
    throw new ProviderReadCertificationError(
      'NCB_READ_CERT_HTTP_FAILED',
      `Provider read request returned HTTP ${response.status}.`,
      { status: response.status }
    )
  }

  let payload
  try {
    payload = JSON.parse(text)
  } catch {
    throw new ProviderReadCertificationError('NCB_READ_CERT_JSON_INVALID', 'Provider read response was not valid JSON.')
  }

  const { records, envelope } = parseArrayEnvelope(payload)
  validateDomainRecords(verifiedCollection, records)
  const ownershipFilter = validateOwnership(records, expectedUserId)

  return {
    passed: true,
    operation: 'list',
    application_collection: verifiedCollection,
    provider_method: 'GET',
    endpoint: endpointEvidence(url),
    instance_query: 'matched',
    http_status: response.status,
    envelope,
    record_count: records.length,
    application_schema: 'passed',
    ownership_filter: ownershipFilter
  }
}

const parseArgs = (argv) => ({
  collection: argv.find((arg) => arg.startsWith('--collection='))?.slice('--collection='.length) ?? null
})

const main = async () => {
  const { collection } = parseArgs(process.argv.slice(2))
  const result = await certifyProviderRead({
    collection,
    readUrl: process.env.NOCODEBACKEND_CERT_READ_URL,
    secret: process.env.NOCODEBACKEND_SECRET_KEY,
    instance: process.env.NOCODEBACKEND_INSTANCE,
    expectedUserId: process.env.NOCODEBACKEND_CERT_USER_ID || null
  })

  process.stdout.write(`${JSON.stringify({ certification: 'passed', ...result }, null, 2)}\n`)
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isCli) {
  main().catch((error) => {
    const failure = error instanceof ProviderReadCertificationError
      ? { code: error.code, message: error.message, details: error.details }
      : { code: 'NCB_READ_CERT_UNEXPECTED', message: error instanceof Error ? error.message : String(error) }
    process.stderr.write(`${JSON.stringify({ certification: 'failed', error: failure }, null, 2)}\n`)
    process.exitCode = 1
  })
}
