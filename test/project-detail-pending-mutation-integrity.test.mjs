import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

const detailSource = await read('src/components/projects/ProjectDetailView.jsx')
const taskItemSource = await read('src/components/projects/TaskItem.jsx')
const subtaskSource = await read('src/components/projects/SubtaskList.jsx')

test('Project Detail owns one mutation synchronously across task and subtask writes', () => {
  assert.match(detailSource, /const \[pendingAction, setPendingAction\] = useState\(null\)/)
  assert.match(detailSource, /const mutationOwnerRef = useRef\(null\)/)
  assert.match(detailSource, /const mutationPending = Boolean\(pendingAction\)/)
  assert.match(detailSource, /const claimMutation = \(action\) => \{\s*if \(mutationOwnerRef\.current\) return null\s*mutationOwnerRef\.current = action\s*setPendingAction\(action\)\s*return action/)
  assert.match(detailSource, /const releaseMutation = \(owner\) => \{\s*if \(mutationOwnerRef\.current !== owner\) return\s*mutationOwnerRef\.current = null\s*setPendingAction\(null\)/)

  for (const handler of [
    'handleAddTask',
    'handleUpdateTask',
    'handleCompleteTask',
    'handleAddSubtask',
    'handleDeleteSubtask'
  ]) {
    assert.match(detailSource, new RegExp(`const ${handler} = async \\([^)]*\\) => \\{\\s*const owner = claimMutation\\(`))
  }

  assert.match(detailSource, /const handleDeleteTask = async \(taskId\) => \{\s*if \(mutationOwnerRef\.current\) return[\s\S]*?const owner = claimMutation\(`delete-task:\$\{taskId\}`\)/)
  assert.match(detailSource, /const handleToggleSubtask = async \(subtask\) => \{[\s\S]*?const owner = claimMutation\(`\$\{completing \? 'complete' : 'uncomplete'\}-subtask:\$\{subtask\.id\}`\)/)
  assert.equal((detailSource.match(/releaseMutation\(owner\)/g) ?? []).length, 7)
  assert.doesNotMatch(detailSource, /if \(pendingAction\) return/)

  assert.match(detailSource, /aria-busy=\{detailsLoading \|\| mutationPending\}/)
  assert.match(detailSource, /Updating project tasks\.\.\./)
  assert.match(detailSource, /pending=\{mutationPending\}/)
})

test('Project Detail navigation cannot invalidate a synchronously owned mutation', () => {
  assert.match(detailSource, /const closeProject = \(\) => \{\s*if \(mutationOwnerRef\.current\) return\s*onClose\(\)/)
  assert.match(detailSource, /const openTaskForm = \(\) => \{\s*if \(mutationOwnerRef\.current\) return/)
  assert.match(detailSource, /useModalDialog\(\{ onEscape: closeProject \}\)/)
  assert.match(detailSource, /onClick=\{closeProject\}/)
  assert.match(detailSource, /onClick=\{openTaskForm\}/)
  assert.match(detailSource, /onCancel=\{\(\) => \{\s*if \(mutationOwnerRef\.current\) return/)
})

test('accepted task payloads are snapshotted before persistence', () => {
  assert.match(detailSource, /const acceptedTaskData = \{ \.\.\.taskData \}/)
  assert.match(detailSource, /await projectService\.createTask\(project\.id, acceptedTaskData\)/)
  assert.match(detailSource, /const acceptedUpdates = \{ \.\.\.updates \}/)
  assert.match(detailSource, /await projectService\.updateTask\(taskId, acceptedUpdates\)/)
  assert.match(detailSource, /const acceptedSubtaskId = subtask\.id/)
  assert.match(detailSource, /await projectService\.completeSubtask\(acceptedSubtaskId\)/)
  assert.match(detailSource, /await projectService\.uncompleteSubtask\(acceptedSubtaskId\)/)
})

test('subtask completion has one persistence owner and reconciles through Project Detail', () => {
  assert.equal((detailSource.match(/await projectService\.completeSubtask\(/g) ?? []).length, 1)
  assert.doesNotMatch(subtaskSource, /projectService/)
  assert.match(detailSource, /const refreshed = await refreshAfterWrite\(/)
  assert.match(detailSource, /if \(completing\) \{[\s\S]*?setCelebrationMessage\('Each small step you do is a quick win! ⭐'\)/)
})

test('SubtaskList delegates writes and retains failed add input for retry', () => {
  assert.match(subtaskSource, /const acceptedTitle = newSubtaskTitle\.trim\(\)/)
  assert.match(subtaskSource, /const saved = await onAddSubtask\(taskId, acceptedTitle\)/)
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