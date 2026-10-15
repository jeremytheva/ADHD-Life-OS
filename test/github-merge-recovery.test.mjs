import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyGitHubFailure, GitHubOperationError, mergeWithRecovery } from '../scripts/github-merge-recovery.mjs'

const HEAD = 'a'.repeat(40)
const BASE = 'b'.repeat(40)
const active = () => ({ state: 'open', draft: false, merged: false, headSha: HEAD, baseSha: BASE })

test('uncertain response after a successful merge is confirmed without duplicate write', async () => {
  let writes = 0
  let merged = false
  const result = await mergeWithRecovery({
    inspect: async () => ({ ...active(), merged }),
    performMerge: async () => {
      writes += 1
      merged = true
      throw new GitHubOperationError('gateway returned 503 after mutation', { status: 503 })
    },
    expectedHead: HEAD,
    expectedBase: BASE
  })
  assert.equal(result.state, 'MERGED_AFTER_UNCERTAIN_RESPONSE')
  assert.equal(writes, 1)
})

test('transient server failures use bounded backoff and retry only after read-back', async () => {
  let writes = 0
  const delays = []
  let merged = false
  const result = await mergeWithRecovery({
    inspect: async () => ({ ...active(), merged }),
    performMerge: async () => {
      writes += 1
      if (writes < 3) throw new GitHubOperationError('temporary service error', { status: 503 })
      merged = true
    },
    expectedHead: HEAD,
    expectedBase: BASE,
    random: () => 0,
    sleep: async (ms) => { delays.push(ms) }
  })
  assert.deepEqual(delays, [250, 500])
  assert.equal(writes, 3)
  assert.equal(result.state, 'MERGED')
})

test('stale branch or competing main update stops before another write', async () => {
  let writes = 0
  let reads = 0
  await assert.rejects(mergeWithRecovery({
    inspect: async () => {
      reads += 1
      return { ...active(), baseSha: reads > 1 ? 'c'.repeat(40) : BASE }
    },
    performMerge: async () => {
      writes += 1
      throw new GitHubOperationError('temporary network failure', { code: 'ECONNRESET' })
    },
    expectedHead: HEAD,
    expectedBase: BASE
  }), /state\/head\/base changed/)
  assert.equal(writes, 1)
})

test('authorization and bad arguments never retry', async () => {
  let writes = 0
  await assert.rejects(mergeWithRecovery({
    inspect: async () => active(),
    performMerge: async () => {
      writes += 1
      throw new GitHubOperationError('Forbidden', { status: 403 })
    },
    expectedHead: HEAD,
    expectedBase: BASE,
    sleep: async () => assert.fail('authorization failure must not back off')
  }), /Forbidden/)
  assert.equal(writes, 1)
  assert.equal(classifyGitHubFailure(new GitHubOperationError('rate limit', { status: 403 })), 'TRANSIENT')
})

test('retry count is capped without looping indefinitely', async () => {
  let writes = 0
  const delays = []
  await assert.rejects(mergeWithRecovery({
    inspect: async () => active(),
    performMerge: async () => {
      writes += 1
      throw new GitHubOperationError('unavailable', { status: 503 })
    },
    expectedHead: HEAD,
    expectedBase: BASE,
    maxAttempts: 3,
    random: () => 0,
    sleep: async (ms) => { delays.push(ms) }
  }), /unavailable/)
  assert.equal(writes, 3)
  assert.deepEqual(delays, [250, 500])
})

test('uncertain outcome with failed read-back never risks a duplicate mutation', async () => {
  let writes = 0
  let reads = 0
  await assert.rejects(mergeWithRecovery({
    inspect: async () => {
      reads += 1
      if (reads > 1) throw new GitHubOperationError('read-back unavailable', { status: 503 })
      return active()
    },
    performMerge: async () => {
      writes += 1
      throw new GitHubOperationError('write response lost', { code: 'ETIMEDOUT' })
    },
    expectedHead: HEAD,
    expectedBase: BASE
  }), /read-back unavailable/)
  assert.equal(writes, 1)
})

test('already merged operations terminate without issuing a write', async () => {
  let writes = 0
  const result = await mergeWithRecovery({
    inspect: async () => ({ ...active(), merged: true }),
    performMerge: async () => { writes += 1 },
    expectedHead: HEAD,
    expectedBase: BASE
  })
  assert.equal(result.state, 'ALREADY_MERGED')
  assert.equal(writes, 0)
})
