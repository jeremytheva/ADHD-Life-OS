import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('routine list distinguishes load failures from a genuine empty list', async () => {
  const source = await read('src/components/routines/RoutineList.jsx')

  assert.match(source, /const \[loadError, setLoadError\] = useState\(false\)/)
  assert.match(source, /setLoadError\(true\)/)
  assert.match(source, /title="We couldn’t load your routines"/)
  assert.match(source, /onRetry=\{loadRoutines\}/)
  assert.match(source, /Your routines have not been removed/)
})

test('housework distinguishes load failures from an all-caught-up state', async () => {
  const source = await read('src/components/housework/ChoreChecklist.jsx')

  assert.match(source, /const \[loadError, setLoadError\] = useState\(false\)/)
  assert.match(source, /setLoadError\(true\)/)
  assert.match(source, /title="We couldn’t load your chores"/)
  assert.match(source, /onRetry=\{retryLoad\}/)
  assert.match(source, /Your chore list has not been cleared/)
})

test('shared load error state is accessible and retryable', async () => {
  const source = await read('src/common/LoadErrorState.jsx')

  assert.match(source, /role="alert"/)
  assert.match(source, />\s*Try again\s*</)
  assert.match(source, /onClick=\{onRetry\}/)
})
