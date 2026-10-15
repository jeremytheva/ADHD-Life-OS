#!/usr/bin/env node
// Runs only from the trusted default-branch repository_dispatch workflow.
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'
import path from 'node:path'

export class GitHubOperationError extends Error {
  constructor(message, { status, code } = {}) {
    super(message)
    this.name = 'GitHubOperationError'
    this.status = status
    this.code = code
  }
}

export function classifyGitHubFailure(error) {
  const status = Number(error?.status)
  const code = String(error?.code ?? '').toUpperCase()
  const message = String(error?.message ?? '')
  if (status === 429 || status === 408 || [500, 502, 503, 504].includes(status) ||
      (status === 403 && /(?:secondary|rate limit)/i.test(message)) ||
      ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ECONNABORTED'].includes(code)) return 'TRANSIENT'
  if (status === 401 || status === 403) return 'AUTHORIZATION'
  if ([409, 412, 422].includes(status) || /(?:stale|expectedhead|non.fast.forward)/i.test(message)) return 'CONFLICT'
  return 'PERMANENT'
}

export async function mergeWithRecovery({
  inspect,
  performMerge,
  expectedHead,
  expectedBase,
  sleep = (ms) => delay(ms),
  random = Math.random,
  maxAttempts = 3
}) {
  if (!expectedHead || !expectedBase || !Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) {
    throw new Error('Exact head/base and a bounded retry limit are required')
  }
  const assertCurrent = (pr) => {
    if (pr.merged) return
    if (pr.state !== 'open' || pr.draft || pr.headSha !== expectedHead || pr.baseSha !== expectedBase) {
      throw new GitHubOperationError('PR state/head/base changed; revalidate before merging', { status: 409 })
    }
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const before = await inspect()
    if (before.merged) return { state: 'ALREADY_MERGED', attempts: attempt - 1 }
    assertCurrent(before)
    try {
      await performMerge(before)
    } catch (error) {
      // A failed response may arrive AFTER GitHub successfully merged.
      // If we cannot inspect the result, stop: the outcome is uncertain.
      const after = await inspect()
      if (after.merged) return { state: 'MERGED_AFTER_UNCERTAIN_RESPONSE', attempts: attempt }
      assertCurrent(after)
      if (classifyGitHubFailure(error) !== 'TRANSIENT' || attempt === maxAttempts) throw error
      const backoffMs = Math.min(3000, 250 * (2 ** (attempt - 1)) + Math.floor(random() * 100))
      await sleep(backoffMs)
      continue
    }
    const confirmed = await inspect()
    if (!confirmed.merged) {
      throw new GitHubOperationError('Merge response was successful but repository state did not confirm merge; no automatic retry')
    }
    return { state: 'MERGED', attempts: attempt }
  }
  throw new Error('Retry limit exceeded')
}

async function runCli() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
  const repository = process.env.REPO || process.env.GITHUB_REPOSITORY
  const prNumber = Number(process.env.PR_NUMBER)
  const expectedHead = process.env.HEAD_SHA
  const expectedBase = process.env.BASE_SHA
  if (!token || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? '') ||
      !Number.isSafeInteger(prNumber) || prNumber < 1 || !/^[0-9a-f]{40}$/.test(expectedHead ?? '') ||
      !/^[0-9a-f]{40}$/.test(expectedBase ?? '')) {
    throw new Error('Missing or invalid trusted merge parameters')
  }
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28'
  }
  const request = async (url, body) => {
    let response
    try {
      response = await globalThis.fetch(url, {
        method: body ? 'POST' : 'GET',
        headers: body ? { ...headers, 'Content-Type': 'application/json' } : headers,
        body: body ? JSON.stringify(body) : undefined
      })
    } catch (error) {
      throw new GitHubOperationError('GitHub connection failed', { code: error?.cause?.code || error?.code })
    }
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new GitHubOperationError(`GitHub HTTP ${response.status}: ${payload.message || 'unknown error'}`, { status: response.status })
    }
    if (Array.isArray(payload.errors) && payload.errors.length) {
      const error = payload.errors[0]
      const type = String(error.type || '').toUpperCase()
      throw new GitHubOperationError(`GitHub GraphQL: ${error.message || type}`, {
        status: type === 'FORBIDDEN' ? 403 : type === 'RATE_LIMITED' ? 429 : 422,
        code: type
      })
    }
    return payload
  }
  const inspect = async () => {
    const pr = await request(`https://api.github.com/repos/${repository}/pulls/${prNumber}`)
    return {
      id: pr.node_id,
      state: pr.state,
      merged: pr.merged === true,
      draft: pr.draft === true,
      headSha: pr.head?.sha,
      baseSha: pr.base?.sha
    }
  }
  const performMerge = async ({ id }) => {
    const mutation = 'mutation($id:ID!,$head:GitObjectID!){mergePullRequest(input:{pullRequestId:$id,expectedHeadOid:$head,mergeMethod:MERGE}){pullRequest{merged state}}}'
    const data = await request('https://api.github.com/graphql', {
      query: mutation,
      variables: { id, head: expectedHead }
    })
    if (data.data?.mergePullRequest?.pullRequest?.merged !== true) {
      throw new GitHubOperationError('Merge response did not confirm success; inspect before proceeding')
    }
  }
  const result = await mergeWithRecovery({ inspect, performMerge, expectedHead, expectedBase })
  process.stdout.write(`Repository merge outcome: ${result.state}; attempts: ${result.attempts}\n`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli().catch((error) => {
    process.stderr.write(`Merge halted: ${error.message} [${classifyGitHubFailure(error)}]\n`)
    process.exitCode = 1
  })
}
