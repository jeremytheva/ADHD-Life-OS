import fs from 'node:fs'
import { URL } from 'node:url'
import test from 'node:test'
import assert from 'node:assert/strict'

const source = fs.readFileSync(
  new URL('../src/components/tasks/TaskMetadataForm.jsx', import.meta.url),
  'utf8'
)

test('task metadata inputs have explicit label associations', () => {
  for (const id of ['task-time-required', 'task-location', 'task-required-items']) {
    assert.match(source, new RegExp(`htmlFor="${id}"`))
    assert.match(source, new RegExp(`id="${id}"`))
  }
})

test('task metadata choice groups expose labels and selected state', () => {
  for (const labelId of [
    'task-energy-required-label',
    'task-interest-level-label',
    'task-aversiveness-label'
  ]) {
    assert.match(source, new RegExp(`id="${labelId}"`))
    assert.match(source, new RegExp(`aria-labelledby="${labelId}"`))
  }

  assert.match(source, /aria-pressed=\{metadata\.energy_required === level\}/)
  assert.match(source, /aria-pressed=\{metadata\.interest_level === level\}/)
  assert.match(source, /aria-pressed=\{metadata\.aversiveness === level\}/)
  assert.match(source, /aria-label=\{`Interest level \$\{level\} of 5`\}/)
  assert.match(source, /aria-label=\{`Aversiveness \$\{level\} of 5`\}/)
})

test('advanced task metadata is exposed as a disclosure relationship', () => {
  assert.match(source, /aria-expanded=\{showAdvanced\}/)
  assert.match(source, /aria-controls="task-metadata-advanced-options"/)
  assert.match(source, /id="task-metadata-advanced-options"/)
})
