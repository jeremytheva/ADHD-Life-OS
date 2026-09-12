import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const source = await read('src/components/routines/RoutineProgress.jsx')

test('Routine Progress guards initialization synchronously before session discovery can create a session', () => {
  assert.match(source, /const initializationPendingRef = useRef\(false\)/)
  assert.match(source, /const initializeSession = useCallback\(async \(\) => \{\s*if \(initializationPendingRef\.current\) return\s*initializationPendingRef\.current = true/)
  assert.match(source, /let activeSession = await routineProgressService\.getActiveSession\(routineId\)[\s\S]*?if \(!activeSession\) \{\s*activeSession = await routineProgressService\.startRoutine\(routineId, activeRoutine\)/)
  assert.match(source, /finally \{\s*initializationPendingRef\.current = false\s*setLoading\(false\)/)
})

test('Routine Progress owns mutations synchronously instead of using rendered actionPending as the handler authority', () => {
  assert.match(source, /const actionOwnerRef = useRef\(null\)/)
  assert.match(source, /const claimAction = useCallback\(\(action\) => \{\s*if \(actionOwnerRef\.current\) return null\s*actionOwnerRef\.current = action\s*setActionPending\(true\)\s*return action/)
  assert.match(source, /const releaseAction = useCallback\(\(owner\) => \{\s*if \(actionOwnerRef\.current !== owner\) return\s*actionOwnerRef\.current = null\s*setActionPending\(false\)/)
  assert.doesNotMatch(source, /const handleCompleteStep = async \(\) => \{\s*if \(actionPending\) return/)
  assert.doesNotMatch(source, /const handleSkipStep = async \(\) => \{\s*if \(actionPending\) return/)
  assert.doesNotMatch(source, /const handleCompleteRoutine = useCallback\(async \(\) => \{\s*if \(!session \|\| actionPending\) return/)
  assert.doesNotMatch(source, /const handleCancel = useCallback\(async \(\) => \{\s*if \(!session \|\| actionPending\) return/)
  assert.equal((source.match(/releaseAction\(owner\)/g) ?? []).length, 4)
})

test('routine completion, cancellation and step writes all claim the shared owner before persistence', () => {
  assert.match(source, /const handleCompleteRoutine = useCallback\(async \(\) => \{\s*if \(!session\) return\s*const owner = claimAction\(`complete-routine:\$\{session\.id\}`\)\s*if \(!owner\) return/)
  assert.match(source, /const handleCancel = useCallback\(async \(\) => \{\s*if \(!session \|\| actionOwnerRef\.current\) return[\s\S]*?const owner = claimAction\(`cancel-routine:\$\{session\.id\}`\)/)
  assert.match(source, /const handleCompleteStep = async \(\) => \{\s*if \(!session \|\| !currentStep\) return\s*const owner = claimAction\(`complete-step:\$\{session\.id\}:\$\{session\.current_step_index\}`\)/)
  assert.match(source, /const handleSkipStep = async \(\) => \{\s*if \(!session \|\| !currentStep\) return\s*const owner = claimAction\(`skip-step:\$\{session\.id\}:\$\{session\.current_step_index\}`\)/)
  assert.match(source, /if \(loading \|\| actionOwnerRef\.current\) return/)
})

test('accepted step coordinates are snapshotted before awaiting persistence', () => {
  assert.equal((source.match(/const acceptedSessionId = session\.id/g) ?? []).length, 2)
  assert.equal((source.match(/const acceptedStepIndex = session\.current_step_index/g) ?? []).length, 2)
  assert.equal((source.match(/const acceptedStepId = currentStep\.id/g) ?? []).length, 2)
  assert.match(source, /routineProgressService\.completeStep\(\s*acceptedSessionId,\s*acceptedStepIndex,\s*acceptedStepId/)
  assert.match(source, /routineProgressService\.skipStep\(\s*acceptedSessionId,\s*acceptedStepIndex,\s*acceptedStepId/)
})

test('rendered pending state remains the accessible UI signal and may gate automatic completion effects', () => {
  assert.match(source, /aria-busy=\{loading \|\| actionPending\}/)
  assert.match(source, /disabled=\{actionPending\}/)
  assert.match(source, /if \(!isFinishingSession \|\| !hasSession \|\| actionPending \|\| completionAttemptedRef\.current\) return/)
  assert.match(source, /Saving your completed routine…/)
})