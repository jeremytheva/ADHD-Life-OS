import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/projects/TaskForm.jsx', import.meta.url), 'utf8')

test('project task form claims synchronous ownership before persistence', () => {
  const guardIndex = source.indexOf('if (submitOwnerRef.current !== null) return')
  const ownerIndex = source.indexOf('submitOwnerRef.current = submitOwner')
  const snapshotIndex = source.indexOf('const acceptedFormData = { ...formData }')
  const saveIndex = source.indexOf('await onSave(acceptedFormData)')

  assert.ok(guardIndex > -1, 'submission should reject a competing same-render submit')
  assert.ok(ownerIndex > guardIndex, 'accepted submission should claim ownership synchronously')
  assert.ok(snapshotIndex > ownerIndex, 'accepted task payload should be snapshotted after ownership is claimed')
  assert.ok(saveIndex > snapshotIndex, 'persistence should cross only after synchronous ownership and snapshot')
})

test('only the owning project task submission can release saving state', () => {
  assert.match(
    source,
    /finally \{[\s\S]*?if \(submitOwnerRef\.current === submitOwner\) \{[\s\S]*?submitOwnerRef\.current = null[\s\S]*?setSaving\(false\)[\s\S]*?\}/
  )
})

test('project task cancellation and local mutation paths consult synchronous ownership', () => {
  assert.match(source, /const handleCancel = \(\) => \{\s*if \(submitOwnerRef\.current !== null\) return\s*onCancel\(\)\s*\}/)
  assert.match(source, /const handleChange = \(field, value\) => \{\s*if \(submitOwnerRef\.current !== null\) return/)
  assert.match(source, /useModalDialog\(\{[\s\S]*?onEscape: handleCancel/)
  assert.equal((source.match(/onClick=\{handleCancel\}/g) || []).length, 2)
})
