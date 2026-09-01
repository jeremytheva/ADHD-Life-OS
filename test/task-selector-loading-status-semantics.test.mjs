import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Task Selector announces recommendation loading without exposing its decorative spinner', async () => {
  const source = await read('src/components/tasks/TaskSelector.jsx')

  assert.match(source, /role="status"\s+aria-live="polite"\s+aria-atomic="true"\s+aria-busy="true"/)
  assert.match(source, /animate-spin[^>]+aria-hidden="true"/)
  assert.match(source, /Finding your perfect next task\.\.\./)
})
