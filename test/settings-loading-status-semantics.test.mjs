import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const settingsSource = readFileSync(
  fileURLToPath(new URL('../src/components/settings/Settings.jsx', import.meta.url)),
  'utf8'
)

test('settings loading state is announced without exposing its decorative spinner', () => {
  assert.match(settingsSource, /role="status"/)
  assert.match(settingsSource, /aria-live="polite"/)
  assert.match(settingsSource, /aria-atomic="true"/)
  assert.match(settingsSource, /aria-busy="true"/)
  assert.match(settingsSource, /aria-hidden="true"[\s\S]*?animate-spin/)
  assert.match(settingsSource, />Loading settings\.\.\.<\/p>/)
})
