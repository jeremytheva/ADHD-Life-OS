import fs from 'node:fs'
import { URL } from 'node:url'
import test from 'node:test'
import assert from 'node:assert/strict'

const subtaskListSource = fs.readFileSync(
  new URL('../src/components/projects/SubtaskList.jsx', import.meta.url),
  'utf8'
)
const taskItemSource = fs.readFileSync(
  new URL('../src/components/projects/TaskItem.jsx', import.meta.url),
  'utf8'
)

test('Add Another Subtask opens the existing subtask input through the mutation ownership boundary', () => {
  assert.match(
    subtaskListSource,
    /const handleShowInput = \(\) => \{\s*if \(mutationOwnerRef\.current \|\| pending\) return\s*if \(onShowInput\) onShowInput\(\)\s*\}/,
    'SubtaskList should guard the explicit show-input callback with synchronous mutation ownership'
  )

  assert.match(
    subtaskListSource,
    /Add More Button[\s\S]*?onClick=\{handleShowInput\}[\s\S]*?Add Another Subtask/,
    'Add Another Subtask should route through the guarded show-input handler'
  )

  assert.match(
    taskItemSource,
    /onShowInput=\{\(\) => setShowSubtaskInput\(true\)\}/,
    'TaskItem should wire the show-input callback to set showSubtaskInput true'
  )

  assert.doesNotMatch(
    subtaskListSource,
    /Add More Button[\s\S]*?if \(onHideInput\) onHideInput\(\)/,
    'Add Another Subtask must not call the hide-input callback'
  )
})
