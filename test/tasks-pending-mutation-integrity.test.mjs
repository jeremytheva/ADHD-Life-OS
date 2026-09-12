import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/tasks/TaskList.jsx', import.meta.url), 'utf8')

test('Tasks exposes the existing global mutation lock in the UI while persistence is unresolved', () => {
  assert.match(source, /const mutationPending = Boolean\(pendingAction\)/)
  assert.match(source, /<div className="p-6 space-y-6" aria-busy=\{loading \|\| mutationPending\}>/)
  assert.match(source, /\{mutationPending && \(\s*<p className="sr-only" role="status" aria-live="polite">\s*Updating tasks\.\.\.\s*<\/p>/)

  const mutationLockControls = source.match(/disabled=\{mutationPending\}/g) ?? []
  assert.equal(mutationLockControls.length, 6)
  assert.match(source, /onClick=\{\(\) => handleFilterChange\(filterOption\.key\)\}\s*disabled=\{mutationPending\}/)
  assert.match(source, /onChange=\{\(event\) => handleSortChange\(event\.target\.value\)\}\s*disabled=\{mutationPending\}/)

  assert.match(source, /<TaskCard[\s\S]*?pending=\{mutationPending\}[\s\S]*?\/>/)
})

test('Tasks retains handler-level serialization through synchronous mutation ownership', () => {
  assert.match(source, /const mutationOwnerRef = useRef\(null\)/)
  assert.match(source, /const handleCreateTask = async \(taskData\) => \{\s*if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(source, /const handleApplyTemplate = async \(template, type\) => \{\s*if \(type !== 'task' \|\| mutationOwnerRef\.current !== null\) return/)
  assert.match(source, /const handleCompleteTask = async \(id\) => \{\s*if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(source, /const handleDeleteTask = async \(id\) => \{\s*if \(mutationOwnerRef\.current !== null\) return/)
})