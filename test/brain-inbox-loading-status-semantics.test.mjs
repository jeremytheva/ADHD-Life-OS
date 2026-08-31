import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const brainInboxSource = readFileSync(
  fileURLToPath(new URL('../src/components/inbox/BrainInbox.jsx', import.meta.url)),
  'utf8'
)

test('brain inbox loading state is announced without exposing its decorative spinner', () => {
  assert.match(brainInboxSource, /role="status"/)
  assert.match(brainInboxSource, /aria-live="polite"/)
  assert.match(brainInboxSource, /aria-atomic="true"/)
  assert.match(brainInboxSource, /aria-busy="true"/)
  assert.match(brainInboxSource, /aria-hidden="true"[\s\S]*?animate-spin/)
  assert.match(brainInboxSource, />Loading your inbox\.\.\.<\/p>/)
})
