import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/components/today/ExecutionControls.jsx', import.meta.url), 'utf8')

test('execution controls remain presentation-only', () => {
  assert.doesNotMatch(source, /nocodebackend|repositories|executionSessionService|executionCoordinator/i)
  assert.match(source, /presentation\.primary_action/)
  assert.match(source, /onPrimaryAction/)
  assert.match(source, /onSecondaryAction/)
})

test('execution controls expose active lifecycle actions and reconciliation copy', () => {
  assert.match(source, /pause: 'Pause'/)
  assert.match(source, /complete: 'Complete'/)
  assert.match(source, /cancel: 'Stop'/)
  assert.match(source, /Completion needs checking/)
  assert.match(source, /role=\{presentation\.mode === 'execution_error' \? 'alert' : 'status'\}/)
})

test('execution controls serialize UI actions while busy', () => {
  assert.match(source, /disabled=\{!canInvokePrimary\}/)
  assert.match(source, /disabled=\{busy \|\| !onSecondaryAction\}/)
  assert.match(source, /Working…/)
})
