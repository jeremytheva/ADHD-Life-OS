import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Task Form freezes mutation and dismissal while saving', async () => {
  const source = await read('src/components/tasks/TaskForm.jsx')

  assert.match(source, /onEscape: saving \? null : onCancel/)
  assert.match(source, /const handleSubmit = \(e\) => \{[\s\S]*?if \(saving\) return[\s\S]*?onSave\(/)
  assert.match(source, /const handleChange = \(field, value\) => \{\s*if \(saving\) return/)
  assert.match(source, /<fieldset disabled=\{saving\} className="space-y-4">/)
  assert.match(source, /aria-label="Close task form"[\s\S]*?disabled=\{saving\}/)
  assert.match(source, /type="button"[\s\S]*?onClick=\{onCancel\}[\s\S]*?disabled=\{saving\}[\s\S]*?>\s*Cancel/)
  assert.match(source, /<form[^>]+aria-busy=\{saving \? 'true' : 'false'\}/)
  assert.match(source, /type="submit"[\s\S]*?disabled=\{saving\}[\s\S]*?aria-busy=\{saving \? 'true' : 'false'\}/)
  assert.match(source, /className="sr-only" role="status" aria-live="polite" aria-atomic="true"/)
  assert.match(source, /Saving task changes\.\.\./)
})
