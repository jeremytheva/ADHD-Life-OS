import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('shared operation error state is accessible and dismissible', async () => {
  const source = await read('src/common/OperationErrorState.jsx')

  assert.match(source, /role="alert"/)
  assert.match(source, /onClick=\{onDismiss\}/)
  assert.match(source, />\s*Dismiss\s*</)
})

test('routine mutations surface failures without closing recovery context', async () => {
  const source = await read('src/components/routines/RoutineList.jsx')

  assert.match(source, /const \[operationError, setOperationError\] = useState\(''\)/)
  assert.match(source, /Your form has been left open so you can review it and try again/)
  assert.match(source, /Your form remains open so you can try again/)
  assert.match(source, /It is still in your routine list/)
  assert.match(source, /setShowTemplates\(false\)/)
  assert.match(source, /<OperationErrorState/)
})
