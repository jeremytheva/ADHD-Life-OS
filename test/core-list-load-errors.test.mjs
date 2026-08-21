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

test('projects distinguish load failures from a genuine empty portfolio', async () => {
  const source = await read('src/components/projects/ProjectsList.jsx')

  assert.match(source, /const \[loadError, setLoadError\] = useState\(null\)/)
  assert.match(source, /setLoadError\(error\)/)
  assert.match(source, /title="We couldn’t load your projects"/)
  assert.match(source, /onRetry=\{loadProjects\}/)
  assert.match(source, /Your projects and tasks have not been removed/)
})

test('brain inbox distinguishes load failures and keeps failed mutations visible', async () => {
  const source = await read('src/components/inbox/BrainInbox.jsx')

  assert.match(source, /const \[loadError, setLoadError\] = useState\(null\)/)
  assert.match(source, /title="We couldn’t load your brain inbox"/)
  assert.match(source, /onRetry=\{loadItems\}/)
  assert.match(source, /const \[operationError, setOperationError\] = useState\(''\)/)
  assert.match(source, /still in the input box so you can try again/)
  assert.match(source, /Your edited text is still here so you can try again/)
  assert.match(source, /It remains in your inbox so you can try again/)
  assert.match(source, /role="alert"/)
})

test('shared load error state is accessible and retryable', async () => {
  const source = await read('src/common/LoadErrorState.jsx')

  assert.match(source, /role="alert"/)
  assert.match(source, />\s*Try again\s*</)
  assert.match(source, /onClick=\{onRetry\}/)
})
