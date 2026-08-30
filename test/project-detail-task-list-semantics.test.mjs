import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('ProjectDetailView exposes pending and completed task collections as labelled lists', async () => {
  const source = await read('src/components/projects/ProjectDetailView.jsx')

  assert.match(source, /id="project-pending-tasks-heading"/)
  assert.match(source, /role="list" aria-labelledby="project-pending-tasks-heading"/)
  assert.match(source, /pendingTasks\.map\(\(task, index\) =>/)
  assert.match(source, /<div role="listitem" key=\{task\.id\}>\s*<TaskItem/s)

  assert.match(source, /id="project-completed-tasks-heading"/)
  assert.match(source, /role="list" aria-labelledby="project-completed-tasks-heading"/)
  assert.match(source, /completedTasks\.map\(\(task\) =>/)
  assert.match(source, /key=\{task\.id\}\s+role="listitem"/)
})
