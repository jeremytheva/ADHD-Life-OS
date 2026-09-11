import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/housework/ChoreChecklist.jsx', import.meta.url), 'utf8')

test('Housework serializes checklist mutations with immediate ownership', () => {
  assert.match(source, /const \[pendingAction, setPendingAction\] = useState\(null\)/)
  assert.match(source, /const pendingActionRef = useRef\(null\)/)
  assert.match(source, /const mutationPending = Boolean\(pendingAction\)/)
  assert.match(source, /const claimMutation = \(action\) => \{\s*if \(pendingActionRef\.current\) return false\s*pendingActionRef\.current = action\s*setPendingAction\(action\)\s*return true/)
  assert.match(source, /const releaseMutation = \(\) => \{\s*pendingActionRef\.current = null\s*setPendingAction\(null\)/)
  assert.match(source, /const handleCompleteTask = async \(taskId\) => \{\s*if \(!claimMutation\(`complete:\$\{taskId\}`\)\) return/)
  assert.match(source, /const handleSnoozeTask = async \(taskId\) => \{\s*if \(!claimMutation\(`snooze:\$\{taskId\}`\)\) return/)
})

test('Housework keeps ownership through reconciliation and exposes pending state', () => {
  assert.match(source, /await houseworkService\.completeHouseworkTask\(taskId, \[\]\)[\s\S]*?const refreshed = await loadTasks\(\)[\s\S]*?finally \{\s*releaseMutation\(\)/)
  assert.match(source, /await houseworkService\.snoozeTask\(taskId\)[\s\S]*?const refreshed = await loadTasks\(\)[\s\S]*?finally \{\s*releaseMutation\(\)/)
  assert.match(source, /aria-busy=\{loading \|\| mutationPending\}/)
  assert.match(source, /Updating chores\.\.\./)
  const disabledActions = source.match(/disabled=\{mutationPending\}/g) ?? []
  assert.equal(disabledActions.length, 2)
})

test('Housework warns when persistence succeeds but reconciliation fails', () => {
  assert.match(source, /That chore was marked complete, but we couldn’t refresh your chore list/)
  assert.match(source, /That chore was moved to tomorrow, but we couldn’t refresh your chore list/)
})
