import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('project task controls expose names, state, and progress semantics', async () => {
  const taskItem = await read('src/components/projects/TaskItem.jsx')
  const subtaskList = await read('src/components/projects/SubtaskList.jsx')

  assert.match(taskItem, /aria-label=\{`Complete task: \$\{task\.title\}`\}/)
  assert.match(taskItem, /aria-label=\{`Delete task: \$\{task\.title\}`\}/)
  assert.match(taskItem, /role="progressbar"[\s\S]*?aria-valuemin=\{0\}[\s\S]*?aria-valuemax=\{totalSubtasks\}[\s\S]*?aria-valuenow=\{completedSubtasks\}[\s\S]*?aria-valuetext=\{`\$\{completedSubtasks\} of \$\{totalSubtasks\} subtasks complete`\}/)
  assert.match(taskItem, /aria-expanded=\{expanded\}/)
  assert.match(subtaskList, /aria-label=\{`\$\{subtask\.is_completed \? 'Mark incomplete' : 'Mark complete'\}: \$\{subtask\.title\}`\}/)
  assert.match(subtaskList, /aria-pressed=\{subtask\.is_completed\}/)
  assert.match(subtaskList, /aria-label=\{`Delete subtask: \$\{subtask\.title\}`\}/)
  assert.match(subtaskList, /aria-label="New subtask title"/)
})
