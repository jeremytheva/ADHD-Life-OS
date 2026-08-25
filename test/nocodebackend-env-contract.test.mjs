import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const FILES = [
  '.env.example',
  'vite.config.js',
  'api/ncb/handler.js',
  'api/ncb/providerContract.js',
  'AGENTS.md',
  'README.md',
  'docs/SECURITY.md',
  'docs/DELIVERY.md'
]

const DEPRECATED = /\bNCB_[A-Z0-9_]+\b/g

test('runtime and durable guidance contain no deprecated NCB_* environment aliases', async () => {
  const violations = []
  for (const path of FILES) {
    const content = await readFile(new URL(`../${path}`, import.meta.url), 'utf8')
    const matches = content.match(DEPRECATED) || []
    if (matches.length) violations.push({ path, matches: [...new Set(matches)] })
  }
  assert.deepEqual(violations, [])
})
