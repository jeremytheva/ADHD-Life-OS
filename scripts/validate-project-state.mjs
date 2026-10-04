#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const statusText = await readFile(path.join(root, 'STATUS.md'), 'utf8')
const failures = []

const end = statusText.indexOf('\n---\n', 4)
if (!statusText.startsWith('---\n') || end < 0) {
  failures.push('STATUS.md must contain YAML front matter')
}

const front = end >= 0 ? statusText.slice(4, end) : ''
const scalar = (name) => {
  const match = front.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))
  return match ? match[1].trim() : null
}
const nested = (group, name) => {
  const groupMatch = front.match(new RegExp(`^${group}:\\s*$([\\s\\S]*?)(?=^[A-Za-z_][A-Za-z0-9_]*:|$)`, 'm'))
  if (!groupMatch) return null
  const match = groupMatch[1].match(new RegExp(`^\\s{2}${name}:\\s*(.+)$`, 'm'))
  return match ? match[1].trim() : null
}
const listItems = (group) => {
  const groupMatch = front.match(new RegExp(`^${group}:\\s*$([\\s\\S]*?)(?=^[A-Za-z_][A-Za-z0-9_]*:|$)`, 'm'))
  if (!groupMatch) return []
  return [...groupMatch[1].matchAll(/^\\s{2}-\\s+(.+)$/gm)].map((match) => match[1].trim())
}

const portfolio = scalar('portfolio_state')
const slot = scalar('execution_slot')
const execution = scalar('execution_state')
const requiredScalars = [
  'current_main_commit',
  'current_candidate_commit',
  'latest_validated_commit',
  'latest_deployed_commit',
  'latest_runtime_verified_commit',
  'latest_browser_verified_commit',
  'validation_debt'
]
if (!['PLANNED','READY','ACTIVE','VALIDATING','BLOCKED','MAINTENANCE','COMPLETE'].includes(portfolio)) failures.push('STATUS.md portfolio_state is invalid')
if (!['BUILDING','INTEGRATING','VERIFYING','WAITING','NONE'].includes(slot)) failures.push('STATUS.md execution_slot is invalid')
if (!['READY','IMPLEMENTING','VALIDATING','BLOCKED','COMPLETE','MAINTENANCE'].includes(execution)) failures.push('STATUS.md execution_state is invalid')
for (const name of requiredScalars) if (!scalar(name)) failures.push(`STATUS.md is missing ${name}`)

const liveEnabled = process.argv.includes('--live') || (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY)
if (liveEnabled && process.env.GITHUB_REPOSITORY) {
  const token = process.env.GITHUB_TOKEN
  const headers = { Accept: 'application/vnd.github+json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const api = async (url) => {
    const response = await globalThis.fetch(url, { headers })
    if (!response.ok) throw new Error(`GitHub API ${response.status} for ${url}`)
    return response.json()
  }

  try {
    const repo = process.env.GITHUB_REPOSITORY
    const openPrs = await api(`https://api.github.com/repos/${repo}/pulls?state=open&per_page=100`)
    if (openPrs.length > 3) failures.push(`open PR WIP ${openPrs.length} exceeds repository limit 3`)

    const byHead = new Map(openPrs.map((pr) => [pr.head.ref, pr]))
    let maxDepth = 0
    for (const pr of openPrs) {
      let depth = 1
      let current = pr
      const seen = new Set()
      while (current?.base?.ref && byHead.has(current.base.ref) && !seen.has(current.base.ref)) {
        seen.add(current.base.ref)
        depth += 1
        current = byHead.get(current.base.ref)
      }
      maxDepth = Math.max(maxDepth, depth)
    }
    if (maxDepth > 2) failures.push(`dependent PR stack depth ${maxDepth} exceeds repository limit 2`)

    const activePr = nested('current_work', 'pr')
    if (activePr && activePr !== 'null') {
      const number = Number(activePr)
      const match = openPrs.find((pr) => pr.number === number)
      if (!match) failures.push(`STATUS.md current_work.pr ${activePr} is not an open PR`)
    }

    const activeIssue = nested('current_work', 'issue')
    if (activeIssue && activeIssue !== 'null') {
      const issue = await api(`https://api.github.com/repos/${repo}/issues/${Number(activeIssue)}`)
      if (issue.state !== 'open' || issue.pull_request) failures.push(`STATUS.md current_work.issue ${activeIssue} is not an open issue`)
    }

    const blockerIssueNumbers = new Set(
      listItems('blockers').flatMap((item) => [...item.matchAll(/#(\d+)/g)].map((match) => Number(match[1])))
    )
    for (const number of blockerIssueNumbers) {
      const issue = await api(`https://api.github.com/repos/${repo}/issues/${number}`)
      if (issue.state !== 'open') failures.push(`STATUS.md current blocker references closed issue #${number}`)
    }
  } catch (error) {
    failures.push(`live GitHub state validation failed: ${error.message}`)
  }
}

if (failures.length > 0) {
  for (const failure of failures) process.stderr.write(`project-state: ${failure}\n`)
  process.exitCode = 1
} else {
  process.stdout.write('Project state validation passed.\n')
}
