import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { URL } from 'node:url'

const source = await readFile(
  new URL('../src/components/tasks/EnhancedTaskForm.jsx', import.meta.url),
  'utf8'
)

test('enhanced task form uses the shared modal focus contract', () => {
  assert.match(source, /import useModalDialog from '\.\.\/\.\.\/common\/useModalDialog'/)
  assert.match(source, /useModalDialog\(\{ onEscape: onCancel, initialFocusRef: titleInputRef \}\)/)
  assert.match(source, /role="dialog"/)
  assert.match(source, /aria-modal="true"/)
  assert.match(source, /aria-labelledby="enhanced-task-form-title"/)
  assert.match(source, /tabIndex=\{-1\}/)
})

test('enhanced task form exposes an accessible close control and associated basic-field labels', () => {
  assert.match(source, /aria-label="Close task form"/)

  for (const id of [
    'enhanced-task-title',
    'enhanced-task-description',
    'enhanced-task-due-date',
    'enhanced-task-estimated-duration'
  ]) {
    assert.match(source, new RegExp(`htmlFor="${id}"`))
    assert.match(source, new RegExp(`id="${id}"`))
  }

  assert.match(source, /ref=\{titleInputRef\}/)
})
