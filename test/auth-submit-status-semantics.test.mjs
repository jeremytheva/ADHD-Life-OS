import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const authSource = readFileSync(
  fileURLToPath(new URL('../src/components/auth/NCBAuth.jsx', import.meta.url)),
  'utf8'
)

test('active auth submit state is announced without exposing its decorative spinner', () => {
  assert.match(authSource, /aria-busy=\{loading\}/)
  assert.match(authSource, /aria-hidden="true"[\s\S]*?animate-spin/)
  assert.match(authSource, /role="status"/)
  assert.match(authSource, /aria-live="polite"/)
  assert.match(authSource, /aria-atomic="true"/)
  assert.match(authSource, /\{loading \? copy\.loadingLabel : ''\}/)
})
