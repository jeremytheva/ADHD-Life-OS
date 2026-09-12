import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Routine Form delegates routine and step persistence as one guarded save', async () => {
  const source = await read('src/components/routines/RoutineForm.jsx')

  assert.doesNotMatch(source, /routineService/)
  assert.match(source, /const submitOwnerRef = useRef\(null\)/)
  assert.match(source, /const \[saving, setSaving\] = useState\(false\)/)
  assert.match(source, /const handleCancel = \(\) => \{[\s\S]*?if \(submitOwnerRef\.current\) return[\s\S]*?onCancel\(\)/)
  assert.match(source, /onEscape: handleCancel/)
  assert.match(source, /const handleSubmit = async \(e\) => \{[\s\S]*?if \(submitOwnerRef\.current\) return[\s\S]*?const owner = Symbol\('routine-form-submit'\)[\s\S]*?submitOwnerRef\.current = owner[\s\S]*?const submittedRoutine = \{[\s\S]*?steps: steps\.map\(\(step\) => \(\{ \.\.\.step \}\)\)[\s\S]*?setSaving\(true\)[\s\S]*?await onSave\(submittedRoutine\)[\s\S]*?finally \{[\s\S]*?if \(submitOwnerRef\.current === owner\)[\s\S]*?submitOwnerRef\.current = null[\s\S]*?setSaving\(false\)/)
  assert.match(source, /const handleChange = \(field, value\) => \{[\s\S]*?if \(submitOwnerRef\.current\) return/)
  assert.match(source, /const handleStepChange = \(index, field, value\) => \{[\s\S]*?if \(submitOwnerRef\.current\) return/)
  assert.match(source, /id="routine-name"[\s\S]*?disabled=\{saving\}/)
  assert.match(source, /id="routine-description"[\s\S]*?disabled=\{saving\}/)
  assert.match(source, /id="routine-repeat-pattern"[\s\S]*?disabled=\{saving\}/)
  assert.match(source, /id="is_active"[\s\S]*?disabled=\{saving\}/)
  assert.match(source, /aria-label=\{`Step \$\{index \+ 1\} name`\}[\s\S]*?disabled=\{saving\}/)
  assert.match(source, /aria-label=\{`Step \$\{index \+ 1\} duration in minutes`\}[\s\S]*?disabled=\{saving\}/)
  assert.match(source, /<form[^>]*aria-busy=\{saving \? 'true' : 'false'\}/)
  assert.match(source, /type="submit"[\s\S]*?disabled=\{saving\}[\s\S]*?aria-busy=\{saving \? 'true' : 'false'\}/)
  assert.match(source, /className="sr-only"\s+role="status"\s+aria-live="polite"\s+aria-atomic="true"/)
  assert.match(source, /Saving routine\.\.\./)
  assert.match(source, /saving \? 'Saving\.\.\.' : routine \? 'Update' : 'Create'/)
})

test('Routine service owns routine-step persistence for create and update', async () => {
  const source = await read('src/services/routineService.js')

  assert.match(source, /async createRoutine\(input\)[\s\S]*?const steps = await Promise\.all\(\(data\.steps \|\| \[\]\)\.map/)
  assert.match(source, /async updateRoutine\(routineId, updates\)[\s\S]*?const \{ steps, \.\.\.routineUpdates \} = updates[\s\S]*?if \(!steps\) return routine[\s\S]*?repositories\.routineSteps\.remove[\s\S]*?steps\.map/)
})