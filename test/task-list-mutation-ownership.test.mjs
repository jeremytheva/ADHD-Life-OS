import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const source = readFileSync(
  fileURLToPath(new URL('../src/components/tasks/TaskList.jsx', import.meta.url)),
  'utf8'
)

const handlerSource = (name, nextName) => {
  const start = source.indexOf(`const ${name} =`)
  const end = source.indexOf(`const ${nextName} =`, start)
  assert.notEqual(start, -1, `${name} should exist`)
  assert.notEqual(end, -1, `${nextName} should follow ${name}`)
  return source.slice(start, end)
}

test('task list uses one synchronous mutation owner across persistence actions', () => {
  assert.match(source, /const mutationOwnerRef = useRef\(null\)/)

  const create = handlerSource('handleCreateTask', 'handleApplyTemplate')
  assert.match(create, /if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(create, /mutationOwnerRef\.current = mutationOwner[\s\S]*setPendingAction\('create'\)[\s\S]*await taskService\.createTask/)
  assert.match(create, /if \(mutationOwnerRef\.current === mutationOwner\) \{\s*mutationOwnerRef\.current = null\s*setPendingAction\(null\)/)

  const template = handlerSource('handleApplyTemplate', 'handleCompleteTask')
  assert.match(template, /if \(type !== 'task' \|\| mutationOwnerRef\.current !== null\) return/)
  assert.match(template, /mutationOwnerRef\.current = mutationOwner[\s\S]*setPendingAction\('template'\)[\s\S]*await taskService\.createTask/)

  const complete = handlerSource('handleCompleteTask', 'handleDeleteTask')
  assert.match(complete, /if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(complete, /mutationOwnerRef\.current = mutationOwner[\s\S]*setPendingAction\(`complete:\$\{id\}`\)[\s\S]*await taskService\.completeTask\(id\)/)

  const deleteTask = source.slice(source.indexOf('const handleDeleteTask ='), source.indexOf('const filters ='))
  assert.match(deleteTask, /if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(deleteTask, /if \(!window\.confirm[\s\S]*mutationOwnerRef\.current = mutationOwner[\s\S]*setPendingAction\(`delete:\$\{id\}`\)[\s\S]*await taskService\.deleteTask\(id\)/)
})

test('task list modal close paths respect synchronous mutation ownership', () => {
  assert.match(source, /onCancel=\{\(\) => \{\s*if \(mutationOwnerRef\.current !== null\) return\s*setShowForm\(false\)/)
  assert.match(source, /onClose=\{\(\) => \{\s*if \(mutationOwnerRef\.current !== null\) return\s*setShowTemplates\(false\)/)
})
