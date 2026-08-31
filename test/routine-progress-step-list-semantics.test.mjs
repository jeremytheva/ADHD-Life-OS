import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/components/routines/RoutineProgress.jsx', import.meta.url), 'utf8')

test('RoutineProgress labels the All Steps collection as one semantic list', () => {
  assert.match(source, /const allStepsHeadingId = `routine-progress-all-steps-\$\{routineId\}`/)
  assert.match(source, /<h4 id=\{allStepsHeadingId\}[^>]*>All Steps<\/h4>/)
  assert.match(source, /<div className="space-y-2" role="list" aria-labelledby=\{allStepsHeadingId\}>\s*\{routineSteps\.map/)
})

test('RoutineProgress exposes every rendered routine step wrapper as a list item', () => {
  assert.match(source, /routineSteps\.map\(\(step, index\) => \{[\s\S]*?return \(\s*<div\s+key=\{step\.id\}\s+role="listitem"/)
})
