import fs from 'node:fs'
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

test('Add Another Subtask opens the existing subtask input', () => {
  assert.match(
    subtaskListSource,
    /onShowInput,[\s\S]*?Add More Button[\s\S]*?if \(onShowInput\) onShowInput\(\)/,
    'SubtaskList should invoke an explicit show-input callback from Add Another Subtask'
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
