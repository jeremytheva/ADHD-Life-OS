import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const inboxSource = readFileSync(
  fileURLToPath(new URL('../src/components/inbox/BrainInbox.jsx', import.meta.url)),
  'utf8'
)

test('brain inbox mode changes consult synchronous mutation ownership before navigation', () => {
  assert.match(
    inboxSource,
    /const hasActiveMutation = \(\) => \(\s*captureOwnerRef\.current !== null \|\|\s*editOwnerRef\.current !== null \|\|\s*deletingIdsRef\.current\.size > 0 \|\|\s*convertingIdsRef\.current\.size > 0 \|\|\s*categoryPendingIdsRef\.current\.size > 0\s*\)/
  )
  assert.match(
    inboxSource,
    /const handleModeChange = \(nextMode\) => \{\s*if \(hasActiveMutation\(\)\) return\s*setMode\(nextMode\)\s*\}/
  )
})

test('all brain inbox mode-navigation controls use the guarded handler', () => {
  assert.match(inboxSource, /onClick=\{\(\) => handleModeChange\('capture'\)\}/)
  assert.match(inboxSource, /onClick=\{\(\) => handleModeChange\('organize'\)\}/)
  assert.equal((inboxSource.match(/onClick=\{\(\) => handleModeChange\('capture'\)\}/g) || []).length, 2)
  assert.equal((inboxSource.match(/onClick=\{\(\) => handleModeChange\('organize'\)\}/g) || []).length, 2)
  assert.equal((inboxSource.match(/onClick=\{\(\) => setMode\(/g) || []).length, 0)
})

test('brain inbox exposes the rendered mutation lock on every mode-navigation control', () => {
  assert.match(
    inboxSource,
    /const modeChangePending = capturePending \|\| editPending \|\| deletingIds\.size > 0 \|\| convertingIds\.size > 0 \|\| categoryPendingIds\.size > 0/
  )
  assert.equal((inboxSource.match(/disabled=\{modeChangePending\}/g) || []).length, 4)
})
