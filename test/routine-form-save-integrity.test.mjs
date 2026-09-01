import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Routine Form delegates routine and step persistence as one guarded save', async () => {
  const source = await read('src/components/routines/RoutineForm.jsx')

  assert.doesNotMatch(source, /routineService/)
  assert.match(source, /const \[saving, setSaving\] = useState\(false\)/)
  assert.match(source, /onEscape: saving \? null : onCancel/)
  assert.match(source, /const handleSubmit = async \(e\) => \{[\s\S]*?if \(saving\) return[\s\S]*?setSaving\(true\)[\s\S]*?await onSave\(\{ \.\.\.formData, steps \}\)[\s\S]*?finally \{[\s\S]*?setSaving\(false\)/)
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