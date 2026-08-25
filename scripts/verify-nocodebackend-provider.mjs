#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { buildDataTarget, missingNoCodeBackendEnv } from '../api/ncb/providerContract.js'

const fail = (message, details = {}) => {
  const error = new Error(message)
  Object.assign(error, details)
  throw error
}

export const parseCertificationArgs = (argv = []) => {
  const options = {
    collection: null,
    write: false,
    cleanup: false,
    createFixture: null,
    updateFixture: null,
    filters: {},
    expectFields: []
  }

  for (const arg of argv) {
    if (arg === '--write') options.write = true
    else if (arg === '--cleanup') options.cleanup = true
    else if (arg.startsWith('--collection=')) options.collection = arg.slice('--collection='.length).trim()
    else if (arg.startsWith('--create-fixture=')) options.createFixture = arg.slice('--create-fixture='.length).trim()
    else if (arg.startsWith('--update-fixture=')) options.updateFixture = arg.slice('--update-fixture='.length).trim()
    else if (arg.startsWith('--expect-fields=')) {
      options.expectFields = arg.slice('--expect-fields='.length).split(',').map((value) => value.trim()).filter(Boolean)
    } else if (arg.startsWith('--filter=')) {
      const expression = arg.slice('--filter='.length)
      const separator = expression.indexOf('=')
      if (separator <= 0) fail(`Invalid filter: ${expression}`)
      options.filters[expression.slice(0, separator)] = expression.slice(separator + 1)
    } else if (arg) {
      fail(`Unknown argument: ${arg}`)
    }
  }

  if (!options.collection) fail('Provide --collection=<provider collection>.')
  if (!/^[A-Za-z0-9._-]+$/.test(options.collection)) fail('Collection contains unsupported characters.')
  if (options.cleanup && !options.write) fail('--cleanup requires --write.')
  if (options.write && (!options.createFixture || !options.updateFixture)) {
    fail('--write requires both --create-fixture=<path> and --update-fixture=<path>.')
  }

  return Object.freeze(options)
}

const parseJson = (text, stage) => {
  try { return JSON.parse(text) } catch { fail(`${stage} returned invalid JSON.`) }
}

export const unwrapProviderData = (payload) => payload?.data ?? payload

const safeRequest = async (target, body) => {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${target.secretKey}`
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const response = await fetch(target.url, {
    method: target.method || 'GET',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual'
  })

  const text = await response.text()
  const payload = text ? parseJson(text, target.operation || 'provider request') : null
  if (!response.ok) {
    fail(`Provider ${target.operation || 'request'} failed with HTTP ${response.status}.`, {
      status: response.status,
      operation: target.operation || null
    })
  }
  return { response, payload, data: unwrapProviderData(payload) }
}

const readFixture = async (path, label) => {
  const text = await readFile(path, 'utf8')
  const value = parseJson(text, label)
  if (!value || Array.isArray(value) || typeof value !== 'object') fail(`${label} must contain one JSON object.`)
  return value
}

const assertExpectedFields = (record, fields, stage) => {
  if (!fields.length || !record) return
  const missing = fields.filter((field) => !(field in record))
  if (missing.length) fail(`${stage} is missing expected fields: ${missing.join(', ')}`)
}

export const certifyNoCodeBackendProvider = async (options, env = process.env) => {
  const missing = missingNoCodeBackendEnv(env)
  if (missing.length) fail(`Missing canonical NoCodeBackend environment: ${missing.join(', ')}`)

  const report = {
    collection: options.collection,
    mode: options.write ? 'read-write' : 'read-only',
    read: null,
    create: null,
    update: null,
    cleanup: null
  }

  const readTarget = buildDataTarget([options.collection], 'GET', options.filters, env)
  const readResult = await safeRequest(readTarget)
  if (!Array.isArray(readResult.data)) fail('Provider read did not return a collection array.')
  if (readResult.data[0]) assertExpectedFields(readResult.data[0], options.expectFields, 'Provider read')
  report.read = { status: 'pass', records: readResult.data.length }

  if (!options.write) return Object.freeze(report)

  const createBody = await readFixture(options.createFixture, 'Create fixture')
  const updateBody = await readFixture(options.updateFixture, 'Update fixture')

  const createTarget = buildDataTarget([options.collection], 'POST', {}, env)
  const createResult = await safeRequest(createTarget, createBody)
  const created = Array.isArray(createResult.data) ? createResult.data[0] : createResult.data
  if (!created?.id) fail('Provider create response did not expose a record id.')
  assertExpectedFields(created, options.expectFields, 'Provider create')
  const recordId = String(created.id)
  report.create = { status: 'pass', record_id: recordId }

  const updateTarget = buildDataTarget([options.collection, recordId], 'PATCH', {}, env)
  const updateResult = await safeRequest(updateTarget, updateBody)
  const updated = Array.isArray(updateResult.data) ? updateResult.data[0] : updateResult.data
  if (!updated?.id || String(updated.id) !== recordId) fail('Provider update response did not return the created record id.')
  assertExpectedFields(updated, options.expectFields, 'Provider update')
  report.update = { status: 'pass', record_id: recordId }

  if (options.cleanup) {
    const deleteTarget = buildDataTarget([options.collection, recordId], 'DELETE', {}, env)
    await safeRequest(deleteTarget)
    report.cleanup = { status: 'pass', record_id: recordId }
  } else {
    report.cleanup = { status: 'not_requested', record_id: recordId }
  }

  return Object.freeze(report)
}

const main = async () => {
  try {
    const options = parseCertificationArgs(process.argv.slice(2))
    const report = await certifyNoCodeBackendProvider(options)
    console.log(JSON.stringify({ status: 'pass', ...report }, null, 2))
  } catch (error) {
    console.error(JSON.stringify({
      status: 'fail',
      message: error.message,
      operation: error.operation || null,
      http_status: error.status || null
    }, null, 2))
    process.exitCode = 1
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main()
