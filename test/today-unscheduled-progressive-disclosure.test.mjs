import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Today bounds the default unscheduled-task presentation without removing tasks', async () => {
  const source = await read('src/components/today/TodayView.jsx')

  assert.match(source, /const DEFAULT_UNSCHEDULED_LIMIT = 3/)
  assert.match(source, /const \[showAllUnscheduled, setShowAllUnscheduled\] = useState\(false\)/)
  assert.match(source, /setShowAllUnscheduled\(false\)/)
  assert.match(source, /timeline\.unscheduledTasks\.slice\(0, DEFAULT_UNSCHEDULED_LIMIT\)/)
  assert.match(source, /unscheduledTaskCount > DEFAULT_UNSCHEDULED_LIMIT/)
  assert.match(source, /hiddenUnscheduledCount/)
})

test('Today exposes explicit progressive-disclosure semantics for the remaining tasks', async () => {
  const source = await read('src/components/today/TodayView.jsx')

  assert.match(source, /id="today-unscheduled-task-list"/)
  assert.match(source, /aria-expanded=\{showAllUnscheduled\}/)
  assert.match(source, /aria-controls="today-unscheduled-task-list"/)
  assert.match(source, /Show less/)
  assert.match(source, /`Show \$\{hiddenUnscheduledCount\} more`/)
  assert.match(source, /visibleUnscheduledTasks\.map/)
})
