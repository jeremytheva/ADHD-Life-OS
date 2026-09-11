import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const listSource = await readFile(new URL('../src/components/routines/RoutineList.jsx', import.meta.url), 'utf8')
const cardSource = await readFile(new URL('../src/components/routines/RoutineCard.jsx', import.meta.url), 'utf8')

test('Routines serializes parent-level mutations with immediate ownership', () => {
  assert.match(listSource, /const \[pendingAction, setPendingAction\] = useState\(null\)/)
  assert.match(listSource, /const pendingActionRef = useRef\(null\)/)
  assert.match(listSource, /const mutationPending = Boolean\(pendingAction\)/)
  assert.match(listSource, /const claimMutation = \(action\) => \{\s*if \(pendingActionRef\.current\) return false\s*pendingActionRef\.current = action\s*setPendingAction\(action\)\s*return true/)
  assert.match(listSource, /const releaseMutation = \(\) => \{\s*pendingActionRef\.current = null\s*setPendingAction\(null\)/)

  assert.match(listSource, /const handleCreateRoutine = async \(routineData\) => \{\s*if \(!claimMutation\('create'\)\) return/)
  assert.match(listSource, /const handleApplyTemplate = async \(template, type\) => \{\s*if \(type !== 'routine' \|\| !claimMutation\('template'\)\) return/)
  assert.match(listSource, /const handleUpdateRoutine = async \(routineData\) => \{\s*if \(!editingRoutine \|\| !claimMutation\(`update:\$\{editingRoutine\.id\}`\)\) return/)
  assert.match(listSource, /const handleDeleteRoutine = async \(id\) => \{\s*if \(pendingActionRef\.current\) return[\s\S]*?if \(!claimMutation\(`delete:\$\{id\}`\)\) return/)
})

test('Routines exposes pending persistence and disables mutation launchers', () => {
  assert.match(listSource, /aria-busy=\{loading \|\| mutationPending\}/)
  assert.match(listSource, /Updating routines\.\.\./)
  const disabledLaunchers = listSource.match(/disabled=\{mutationPending\}/g) ?? []
  assert.ok(disabledLaunchers.length >= 4)
  assert.match(listSource, /<RoutineCard[\s\S]*?pending=\{mutationPending\}[\s\S]*?\/>/)

  assert.match(cardSource, /pending = false/)
  const disabledCardMutations = cardSource.match(/disabled=\{pending\}/g) ?? []
  assert.equal(disabledCardMutations.length, 2)
})

test('Routines preserves read-only start and stats actions while persistence owns writes', () => {
  assert.match(cardSource, /onClick=\{onViewStats\}/)
  assert.match(cardSource, /onClick=\{onStart\}/)
  assert.doesNotMatch(cardSource, /onClick=\{onViewStats\}[\s\S]{0,160}disabled=\{pending\}/)
  assert.doesNotMatch(cardSource, /onClick=\{onStart\}[\s\S]{0,160}disabled=\{pending\}/)
})

test('Routines keeps mutation ownership through post-write refresh and releases it on every exit', () => {
  assert.match(listSource, /await routineService\.createRoutine\(routineWithMode\)[\s\S]*?const refreshed = await loadRoutines\(\)[\s\S]*?finally \{\s*releaseMutation\(\)/)
  assert.match(listSource, /await routineService\.createRoutine\(routineData\)[\s\S]*?const refreshed = await loadRoutines\(\)[\s\S]*?finally \{\s*releaseMutation\(\)/)
  assert.match(listSource, /await routineService\.updateRoutine\(editingRoutine\.id, routineData\)[\s\S]*?const refreshed = await loadRoutines\(\)[\s\S]*?finally \{\s*releaseMutation\(\)/)
  assert.match(listSource, /await routineService\.deleteRoutine\(id\)[\s\S]*?const refreshed = await loadRoutines\(\)[\s\S]*?finally \{\s*releaseMutation\(\)/)
})
