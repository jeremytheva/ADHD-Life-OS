import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

const detailSource = await read('src/components/projects/ProjectDetailView.jsx')
const taskItemSource = await read('src/components/projects/TaskItem.jsx')
const subtaskSource = await read('src/components/projects/SubtaskList.jsx')

test('Project Detail owns one mutation at a time across task and subtask writes', () => {
  assert.match(detailSource, /const \[pendingAction, setPendingAction\] = useState\(null\)/)
  assert.match(detailSource, /const mutationPending = Boolean\(pendingAction\)/)

  for (const handler of [
    'handleAddTask',
    'handleUpdateTask',
    'handleCompleteTask',
    'handleDeleteTask',
    'handleAddSubtask',
    'handleDeleteSubtask',
    'handleToggleSubtask'
  ]) {
    assert.match(detailSource, new RegExp(`const ${handler} = async \\([^)]*\\) => \\{\\s*if \\(pendingAction\\) return`))
  }

  assert.match(detailSource, /aria-busy=\{detailsLoading \|\| mutationPending\}/)
  assert.match(detailSource, /Updating project tasks\.\.\./)
  assert.match(detailSource, /onEscape: mutationPending \? null : onClose/)
  assert.match(detailSource, /pending=\{mutationPending\}/)
})

test('subtask completion has one persistence owner and reconciles through Project Detail', () => {
  assert.equal((detailSource.match(/await projectService\.completeSubtask\(/g) ?? []).length, 1)
  assert.doesNotMatch(subtaskSource, /projectService/)
  assert.match(detailSource, /await projectService\.completeSubtask\(subtask\.id\)/)
  assert.match(detailSource, /await projectService\.uncompleteSubtask\(subtask\.id\)/)
  assert.match(detailSource, /const refreshed = await refreshAfterWrite\(/)
  assert.match(detailSource, /if \(completing\) \{[\s\S]*?setCelebrationMessage\('Each small step you do is a quick win! ⭐'\)/)
})

test('SubtaskList delegates writes and retains failed add input for retry', () => {
  assert.match(subtaskSource, /const saved = await onAddSubtask\(taskId, newSubtaskTitle\.trim\(\)\)/)
  assert.match(subtaskSource, /if \(!saved\) \{[\s\S]*?Your subtask title is still here/)
  assert.match(subtaskSource, /setNewSubtaskTitle\(''\)/)
  assert.match(subtaskSource, /const deleted = await onDeleteSubtask\(subtaskId\)/)
  assert.match(subtaskSource, /const updated = await onToggleSubtask\(subtask\)/)
  assert.match(subtaskSource, /aria-busy=\{mutationPending\}/)
})

test('Project Detail mutation controls reflect the shared pending lock while disclosure remains independent', () => {
  assert.match(taskItemSource, /disabled=\{pending\}/)
  assert.match(taskItemSource, /pending=\{pending\}/)
  assert.match(taskItemSource, /onAddSubtask=\{onAddSubtask\}/)
  assert.match(taskItemSource, /onDeleteSubtask=\{onDeleteSubtask\}/)
  assert.match(taskItemSource, /onToggleSubtask=\{onToggleSubtask\}/)
  assert.match(taskItemSource, /onClick=\{\(\) => setExpanded\(!expanded\)\}/)
  assert.doesNotMatch(taskItemSource, /onClick=\{\(\) => setExpanded\(!expanded\)\}[\s\S]{0,120}disabled=\{pending\}/)
})