import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('removing a routine step returns focus to the persistent Add Step control', async () => {
  const form = await read('src/components/routines/RoutineForm.jsx')

  assert.match(form, /const addStepButtonRef = useRef\(null\)/)
  assert.match(form, /ref=\{addStepButtonRef\}[\s\S]*?<span>Add Step<\/span>/)
  assert.match(form, /const removeStep = \(index\) => \{\s*if \(saving\) return\s*setSteps\(prev => prev\.filter\(\(_, i\) => i !== index\)\)\s*addStepButtonRef\.current\?\.focus\(\)\s*\}/)
  assert.match(form, /onClick=\{\(\) => removeStep\(index\)\}/)
})
