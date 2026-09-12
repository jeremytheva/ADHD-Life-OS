import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/routines/RoutineList.jsx', import.meta.url), 'utf8')

test('RoutineList blocks refresh and adjacent navigation from crossing an active mutation boundary', () => {
  assert.match(source, /const retryLoad = \(\) => \{\s*if \(pendingActionRef\.current\) return/)
  assert.match(source, /const handleOpenCreate = \(\) => \{\s*if \(pendingActionRef\.current\) return/)
  assert.match(source, /const handleOpenTemplates = \(\) => \{\s*if \(pendingActionRef\.current\) return/)
  assert.match(source, /const handleStartRoutine = \(routine\) => \{\s*if \(pendingActionRef\.current\) return/)
  assert.match(source, /const handleViewStats = \(routine\) => \{\s*if \(pendingActionRef\.current\) return/)
})

test('RoutineList routes retry and create/template entry through mutation-aware handlers', () => {
  const retryUses = source.match(/onRetry=\{retryLoad\}/g) ?? []
  assert.equal(retryUses.length, 2)
  const createUses = source.match(/onClick=\{handleOpenCreate\}/g) ?? []
  assert.equal(createUses.length, 2)
  const templateUses = source.match(/onClick=\{handleOpenTemplates\}/g) ?? []
  assert.equal(templateUses.length, 2)
})

test('RoutineList retains synchronous ownership for routine persistence mutations', () => {
  assert.match(source, /const pendingActionRef = useRef\(null\)/)
  assert.match(source, /const claimMutation = \(action\) => \{\s*if \(pendingActionRef\.current\) return false\s*pendingActionRef\.current = action/)
  assert.match(source, /if \(!claimMutation\('create'\)\) return/)
  assert.match(source, /if \(type !== 'routine' \|\| !claimMutation\('template'\)\) return/)
  assert.match(source, /if \(!editingRoutine \|\| !claimMutation\(`update:\$\{editingRoutine\.id\}`\)\) return/)
  assert.match(source, /if \(!claimMutation\(`delete:\$\{id\}`\)\) return/)
})
