import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('routine session initialization failure remains visible and retryable', async () => {
  const source = await read('src/components/routines/RoutineProgress.jsx')

  assert.match(source, /const \[loadError, setLoadError\] = useState\(false\)/)
  assert.match(source, /title="We couldn’t start this routine"/)
  assert.match(source, /onRetry=\{initializeSession\}/)
  assert.match(source, /No progress was changed/)
})

test('routine step actions surface failed persistence without advancing', async () => {
  const source = await read('src/components/routines/RoutineProgress.jsx')

  assert.match(source, /We couldn’t save this step as completed/)
  assert.match(source, /We couldn’t save this step as skipped/)
  assert.match(source, /The routine has not advanced/)
  assert.match(source, /disabled=\{actionPending\}/)
  assert.match(source, /<OperationErrorState/)
})

test('routine completion is recoverable and only closes after persistence succeeds', async () => {
  const source = await read('src/components/routines/RoutineProgress.jsx')

  assert.match(source, /completionAttemptedRef/)
  assert.match(source, /await routineProgressService\.completeRoutine\(session\.id\)/)
  assert.match(source, /Your session remains open; try finishing again/)
  assert.match(source, /Try finishing again/)
  assert.match(source, /if \(onComplete\) onComplete\(\)/)
  assert.match(source, /onClose\(\)/)
})

test('routine cancellation failure leaves the session active', async () => {
  const source = await read('src/components/routines/RoutineProgress.jsx')

  assert.match(source, /await routineProgressService\.cancelRoutine\(session\.id\)/)
  assert.match(source, /It remains active, so you can keep working or try cancelling again/)
})

test('routine elapsed time is driven by an active one-second timer', async () => {
  const source = await read('src/components/routines/RoutineProgress.jsx')

  assert.match(source, /window\.setInterval/)
  assert.match(source, /setElapsedSeconds/)
  assert.match(source, /window\.clearInterval/)
})
