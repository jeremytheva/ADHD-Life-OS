import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Chore Detail announces completion progress without exposing its decorative spinner', async () => {
  const source = await read('src/components/housework/ChoreDetailView.jsx')

  assert.match(source, /aria-busy=\{completing \? 'true' : 'false'\}/)
  assert.match(source, /animate-spin[^>]+aria-hidden="true"/)
  assert.match(source, /className="sr-only"\s+aria-live="polite"\s+aria-atomic="true"/)
  assert.doesNotMatch(source, /className="sr-only"\s+role="status"/)
  assert.match(source, /Confirming chore completion\.\.\./)
  assert.match(source, /Confirming completion\.\.\./)
})
