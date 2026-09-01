import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Project Task Form guards and announces an unresolved save', async () => {
  const source = await read('src/components/projects/TaskForm.jsx')

  assert.match(source, /const \[saving, setSaving\] = useState\(false\)/)
  assert.match(source, /const handleChange = \(field, value\) => \{\s*if \(saving\) return/)
  assert.match(source, /const handleSubmit = async \(e\) => \{[\s\S]*?if \(saving\) return[\s\S]*?setSaving\(true\)[\s\S]*?await onSave\(formData\)[\s\S]*?finally \{[\s\S]*?setSaving\(false\)/)
  assert.match(source, /onEscape: saving \? null : onCancel/)
  assert.match(source, /<fieldset disabled=\{saving\} className="space-y-4">/)
  assert.match(source, /aria-label="Close task form"[\s\S]*?disabled=\{saving\}/)
  assert.match(source, /type="button"[\s\S]*?onClick=\{onCancel\}[\s\S]*?disabled=\{saving\}[\s\S]*?>\s*Cancel/)
  assert.match(source, /aria-busy=\{saving \? 'true' : 'false'\}/)
  assert.match(source, /type="submit"[\s\S]*?disabled=\{saving\}[\s\S]*?aria-busy=\{saving \? 'true' : 'false'\}/)
  assert.match(source, /className="sr-only"\s+role="status"\s+aria-live="polite"\s+aria-atomic="true"/)
  assert.match(source, /Saving project task\.\.\./)
  assert.match(source, /saving \? 'Saving\.\.\.' : `\$\{task \? 'Update' : 'Add'\} Task`/)
})
