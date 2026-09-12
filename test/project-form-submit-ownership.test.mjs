import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('ProjectForm owns accepted submission synchronously', async () => {
  const source = await read('src/components/projects/ProjectForm.jsx')

  assert.match(source, /const submitOwnerRef = useRef\(null\)/)
  assert.match(source, /const handleSubmit = async \(e\) => \{[\s\S]*?if \(submitOwnerRef\.current\) return[\s\S]*?const owner = Symbol\('project-form-submit'\)[\s\S]*?submitOwnerRef\.current = owner[\s\S]*?const submittedProject = \{ \.\.\.formData \}[\s\S]*?setIsSaving\(true\)[\s\S]*?await onSave\(submittedProject\)[\s\S]*?if \(submitOwnerRef\.current === owner\)[\s\S]*?submitOwnerRef\.current = null[\s\S]*?setIsSaving\(false\)/)
})

test('ProjectForm mutation-adjacent controls consult synchronous submission ownership', async () => {
  const source = await read('src/components/projects/ProjectForm.jsx')

  assert.match(source, /const handleCancel = \(\) => \{[\s\S]*?if \(submitOwnerRef\.current\) return[\s\S]*?onCancel\(\)/)
  assert.match(source, /useModalDialog\(\{ onEscape: handleCancel,/)
  assert.match(source, /const handleChange = \(field, value\) => \{[\s\S]*?if \(submitOwnerRef\.current\) return/)
  assert.match(source, /onClick=\{handleCancel\}/)
  assert.doesNotMatch(source, /onEscape: isSaving \? null : onCancel/)
  assert.doesNotMatch(source, /onClick=\{onCancel\}/)
})
