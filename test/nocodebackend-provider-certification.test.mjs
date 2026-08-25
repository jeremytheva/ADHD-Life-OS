import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  certifyNoCodeBackendProvider,
  parseCertificationArgs
} from '../scripts/verify-nocodebackend-provider.mjs'

const env = {
  NOCODEBACKEND_AUTH_BASE_URL: 'https://auth.example.test/api/user-auth',
  NOCODEBACKEND_DATA_BASE_URL: 'https://data.example.test/',
  NOCODEBACKEND_SECRET_KEY: 'secret',
  NOCODEBACKEND_INSTANCE: 'life_os_test'
}

const originalFetch = globalThis.fetch

test.after(() => { globalThis.fetch = originalFetch })

test('certification is read-only unless --write is explicit', () => {
  const options = parseCertificationArgs(['--collection=tasks', '--filter=user_id=user-1'])
  assert.equal(options.write, false)
  assert.equal(options.cleanup, false)
  assert.deepEqual(options.filters, { user_id: 'user-1' })
})

test('write mode requires explicit create and update fixtures', () => {
  assert.throws(
    () => parseCertificationArgs(['--collection=tasks', '--write']),
    /requires both --create-fixture/
  )
  assert.throws(
    () => parseCertificationArgs(['--collection=tasks', '--cleanup']),
    /requires --write/
  )
})

test('read-only certification verifies generated read route without mutation', async () => {
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), method: options.method })
    return new Response(JSON.stringify({ status: 'success', data: [{ id: 'task-1', user_id: 'user-1' }] }), { status: 200 })
  }

  const report = await certifyNoCodeBackendProvider(parseCertificationArgs([
    '--collection=tasks',
    '--filter=user_id=user-1',
    '--expect-fields=id,user_id'
  ]), env)

  assert.equal(report.mode, 'read-only')
  assert.equal(report.read.records, 1)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://data.example.test/read/tasks?Instance=life_os_test&user_id=user-1')
  assert.equal(calls[0].method, 'GET')
})

test('write certification performs create and update and only deletes with cleanup', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'life-os-ncb-'))
  const createFixture = path.join(directory, 'create.json')
  const updateFixture = path.join(directory, 'update.json')
  await writeFile(createFixture, JSON.stringify({ user_id: 'user-1', title: 'Test' }))
  await writeFile(updateFixture, JSON.stringify({ title: 'Updated' }))

  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), method: options.method })
    if (String(url).includes('/read/')) return new Response(JSON.stringify({ status: 'success', data: [] }), { status: 200 })
    if (String(url).includes('/create/')) return new Response(JSON.stringify({ status: 'success', data: { id: 'record-1', user_id: 'user-1', title: 'Test' } }), { status: 200 })
    if (String(url).includes('/update/')) return new Response(JSON.stringify({ status: 'success', data: { id: 'record-1', user_id: 'user-1', title: 'Updated' } }), { status: 200 })
    if (String(url).includes('/delete/')) return new Response(JSON.stringify({ status: 'success' }), { status: 200 })
    throw new Error('unexpected provider route')
  }

  try {
    const report = await certifyNoCodeBackendProvider(parseCertificationArgs([
      '--collection=tasks', '--write', '--cleanup',
      `--create-fixture=${createFixture}`,
      `--update-fixture=${updateFixture}`,
      '--expect-fields=id,user_id,title'
    ]), env)

    assert.equal(report.create.record_id, 'record-1')
    assert.equal(report.update.record_id, 'record-1')
    assert.equal(report.cleanup.status, 'pass')
    assert.deepEqual(calls.map((call) => call.method), ['GET', 'POST', 'PUT', 'DELETE'])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
