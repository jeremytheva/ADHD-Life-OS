import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('RoutineForm owns accepted submission synchronously', async () => {
  const source = await read('src/components/routines/RoutineForm.jsx')
  const submitHandler = source.match(/const handleSubmit = async \(e\) => \{[\s\S]*?const handleChange/)?.[0] ?? ''

  assert.match(source, /const submitOwnerRef = useRef\(null\)/)
  assert.match(submitHandler, /if \(submitOwnerRef\.current\) return/)
  assert.match(submitHandler, /submitOwnerRef\.current = owner/)
  assert.match(submitHandler, /await onSave\(submittedRoutine\)/)
  assert.match(submitHandler, /if \(submitOwnerRef\.current === owner\)/)
  assert.match(submitHandler, /submitOwnerRef\.current = null/)
})

test('RoutineForm mutation-adjacent controls consult synchronous submission ownership', async () => {
  const source = await read('src/components/routines/RoutineForm.jsx')

  for (const handler of ['handleCancel', 'handleChange', 'handleStepChange', 'addStep', 'removeStep']) {
    const escaped = handler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const body = source.match(new RegExp(`const ${escaped} = \\(.*?\\) => \\{[\\s\\S]*?\\n  \\}`, 'm'))?.[0] ?? ''
    assert.match(body, /if \(submitOwnerRef\.current\) return/, `${handler} must fail closed while submission is owned`)
  }

  assert.match(source, /onEscape: handleCancel/)
  assert.equal((source.match(/onClick=\{handleCancel\}/g) ?? []).length, 2)
})
