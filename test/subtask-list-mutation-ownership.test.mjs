import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { URL } from 'node:url'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('SubtaskList claims synchronous mutation ownership before async callbacks', async () => {
  const source = await read('src/components/projects/SubtaskList.jsx')

  assert.match(source, /const mutationOwnerRef = useRef\(null\)/)
  assert.match(source, /const claimMutation = \(action\) => \{\s*if \(mutationOwnerRef\.current \|\| pending\) return null[\s\S]*?mutationOwnerRef\.current = owner[\s\S]*?setLocalPendingAction\(action\)/)
  assert.match(source, /const releaseMutation = \(owner\) => \{\s*if \(mutationOwnerRef\.current !== owner\) return[\s\S]*?mutationOwnerRef\.current = null[\s\S]*?setLocalPendingAction\(null\)/)

  assert.match(source, /const handleAddSubtask = async \(\) => \{[\s\S]*?const acceptedTitle = newSubtaskTitle\.trim\(\)[\s\S]*?const owner = claimMutation\(`add:\$\{taskId\}`\)[\s\S]*?await onAddSubtask\(taskId, acceptedTitle\)[\s\S]*?finally \{\s*releaseMutation\(owner\)/)
  assert.match(source, /const handleDeleteSubtask = async \(subtaskId\) => \{[\s\S]*?const owner = claimMutation\(`delete:\$\{subtaskId\}`\)[\s\S]*?await onDeleteSubtask\(subtaskId\)[\s\S]*?finally \{\s*releaseMutation\(owner\)/)
  assert.match(source, /const handleToggleSubtask = async \(subtask\) => \{[\s\S]*?const owner = claimMutation\(`toggle:\$\{subtask\.id\}`\)[\s\S]*?await onToggleSubtask\(subtask\)[\s\S]*?finally \{\s*releaseMutation\(owner\)/)
})

test('SubtaskList mutation-adjacent controls consult synchronous ownership', async () => {
  const source = await read('src/components/projects/SubtaskList.jsx')

  assert.match(source, /const handleTitleChange = \(value\) => \{\s*if \(mutationOwnerRef\.current \|\| pending\) return/)
  assert.match(source, /const handleShowInput = \(\) => \{\s*if \(mutationOwnerRef\.current \|\| pending\) return/)
  assert.match(source, /onChange=\{\(e\) => handleTitleChange\(e\.target\.value\)\}/)
  assert.match(source, /onClick=\{handleShowInput\}/)
  assert.match(source, /aria-busy=\{mutationPending\}/)
  assert.match(source, /role="status" aria-live="polite" aria-atomic="true"/)
})
