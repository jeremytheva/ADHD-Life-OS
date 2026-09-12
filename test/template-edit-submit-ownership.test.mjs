import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('TemplateEditModal owns accepted submission synchronously', async () => {
  const source = await read('src/components/templates/TemplateEditModal.jsx')

  assert.match(source, /const submitOwnerRef = useRef\(null\)/)
  assert.match(source, /const handleSubmit = async \(event\) => \{[\s\S]*?if \(isApplying \|\| submitOwnerRef\.current\) return[\s\S]*?const owner = Symbol\('template-edit-submit'\)[\s\S]*?submitOwnerRef\.current = owner[\s\S]*?const submittedTemplate = isRoutine[\s\S]*?await onSave\(submittedTemplate, template\.type\)[\s\S]*?if \(submitOwnerRef\.current === owner\)[\s\S]*?submitOwnerRef\.current = null/)
})

test('TemplateEditModal mutation-adjacent controls consult synchronous submission ownership', async () => {
  const source = await read('src/components/templates/TemplateEditModal.jsx')

  assert.match(source, /const safeClose = \(\) => \{[\s\S]*?if \(isApplying \|\| submitOwnerRef\.current\) return[\s\S]*?onClose\(\)/)
  assert.match(source, /useModalDialog\(\{ onEscape: safeClose \}\)/)
  assert.match(source, /const handleChange = \(field, value\) => \{[\s\S]*?if \(isApplying \|\| submitOwnerRef\.current\) return/)
  assert.match(source, /const handleStepChange = \(index, field, value\) => \{[\s\S]*?if \(isApplying \|\| submitOwnerRef\.current\) return/)
  assert.match(source, /const addStep = \(\) => \{[\s\S]*?if \(isApplying \|\| submitOwnerRef\.current\) return/)
  assert.match(source, /const removeStep = \(index\) => \{[\s\S]*?if \(isApplying \|\| submitOwnerRef\.current\) return/)
  assert.doesNotMatch(source, /onEscape: isApplying \? null : onClose/)
})
