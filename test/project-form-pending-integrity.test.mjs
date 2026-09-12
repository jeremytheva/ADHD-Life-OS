import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/projects/ProjectForm.jsx', import.meta.url), 'utf8')

test('Project form owns a save until persistence settles', () => {
  assert.match(source, /const \[isSaving, setIsSaving\] = useState\(false\)/)
  assert.match(source, /const submitOwnerRef = useRef\(null\)/)
  assert.match(source, /const handleSubmit = async \(e\) => \{\s*e\.preventDefault\(\)\s*if \(submitOwnerRef\.current\) return/)
  assert.match(source, /const owner = Symbol\('project-form-submit'\)[\s\S]*?submitOwnerRef\.current = owner[\s\S]*?const submittedProject = \{ \.\.\.formData \}[\s\S]*?setIsSaving\(true\)[\s\S]*?await onSave\(submittedProject\)[\s\S]*?if \(submitOwnerRef\.current === owner\)[\s\S]*?submitOwnerRef\.current = null[\s\S]*?setIsSaving\(false\)/)
  assert.match(source, /const handleCancel = \(\) => \{\s*if \(submitOwnerRef\.current\) return\s*onCancel\(\)\s*\}/)
  assert.match(source, /useModalDialog\(\{ onEscape: handleCancel, initialFocusRef: titleInputRef \}\)/)
})

test('Project form exposes pending persistence and locks conflicting controls', () => {
  assert.match(source, /aria-busy=\{isSaving \? 'true' : 'false'\}/)
  assert.match(source, /aria-label="Close project form"[\s\S]*?disabled=\{isSaving\}/)
  assert.match(source, /<fieldset disabled=\{isSaving\}>/)
  assert.match(source, /type="submit"\s*disabled=\{isSaving\}\s*aria-busy=\{isSaving \? 'true' : 'false'\}/)
  assert.match(source, /\{isSaving \? 'Saving…' : `\$\{project \? 'Update' : 'Create'\} Project`\}/)
  assert.match(source, /role="status" aria-live="polite" aria-atomic="true"/)
})
