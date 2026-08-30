import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('recommended task activation transfers focus to the matching task region', async () => {
  const taskList = await read('src/components/tasks/TaskList.jsx')
  const recommendations = await read('src/components/tasks/RecommendedTasks.jsx')

  assert.match(taskList, /element\.scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\)/)
  assert.match(taskList, /element\.focus\(\{ preventScroll: true \}\)/)
  assert.match(taskList, /role="group"/)
  assert.match(taskList, /aria-label=\{`Task: \$\{task\.title\}`\}/)
  assert.match(taskList, /tabIndex=\{-1\}/)
  assert.match(taskList, /focus:ring-2 focus:ring-blue-400/)
  assert.doesNotMatch(taskList, /element\.classList\.add\('ring-2'/)
  assert.match(recommendations, /<button\s+type="button"/)
  assert.match(recommendations, /onClick=\{\(\) => onTaskClick && onTaskClick\(task\)\}/)
})
