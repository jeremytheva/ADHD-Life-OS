import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Today task completion is serialized and distinguishes write failure from refresh failure', async () => {
  const todaySource = await read('src/components/today/TodayView.jsx')
  const blockSource = await read('src/components/today/BlockCard.jsx')

  assert.match(todaySource, /const \[operationError, setOperationError\] = useState\(null\)/)
  assert.match(todaySource, /const \[pendingTaskId, setPendingTaskId\] = useState\(null\)/)
  assert.match(todaySource, /if \(pendingTaskId\) return/)
  assert.match(todaySource, /The task was completed, but Today could not refresh/)
  assert.match(todaySource, /It has not been confirmed as completed and remains safe to retry/)
  assert.match(todaySource, /pending=\{block\.ref_type === 'task' && pendingTaskId === block\.ref_id\}/)
  assert.match(blockSource, /disabled=\{pending\}/)
  assert.match(blockSource, /aria-label=\{`Complete \$\{block\.label\}`\}/)
})
