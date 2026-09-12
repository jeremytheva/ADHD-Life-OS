import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('TaskForm owns accepted submission synchronously', async () => {
  const source = await read('src/components/tasks/TaskForm.jsx')

  assert.match(source, /const submitOwnerRef = useRef\(null\)/)
  assert.match(source, /const handleSubmit = async \(e\) => \{[\s\S]*?if \(saving \|\| submitOwnerRef\.current\) return[\s\S]*?const owner = Symbol\('task-form-submit'\)[\s\S]*?submitOwnerRef\.current = owner[\s\S]*?const submittedTask = \{[\s\S]*?\.\.\.formData,[\s\S]*?due_date: formData\.due_date \|\| null[\s\S]*?\}[\s\S]*?await onSave\(submittedTask\)[\s\S]*?if \(submitOwnerRef\.current === owner\)[\s\S]*?submitOwnerRef\.current = null/)
})

test('TaskForm mutation-adjacent controls consult synchronous submission ownership', async () => {
  const source = await read('src/components/tasks/TaskForm.jsx')

  assert.match(source, /const handleCancel = \(\) => \{[\s\S]*?if \(saving \|\| submitOwnerRef\.current\) return[\s\S]*?onCancel\(\)/)
  assert.match(source, /useModalDialog\(\{[\s\S]*?onEscape: handleCancel,/)
  assert.match(source, /const handleChange = \(field, value\) => \{[\s\S]*?if \(saving \|\| submitOwnerRef\.current\) return/)
  assert.match(source, /onClick=\{handleCancel\}/)
  assert.doesNotMatch(source, /onEscape: saving \? null : onCancel/)
  assert.doesNotMatch(source, /onClick=\{onCancel\}/)
})
