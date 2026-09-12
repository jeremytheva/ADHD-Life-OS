import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/projects/QuickCaptureModal.jsx', import.meta.url), 'utf8')

test('quick capture claims synchronous ownership before persistence', () => {
  const guardIndex = source.indexOf('if (submitOwnerRef.current !== null) return')
  const ownerIndex = source.indexOf('submitOwnerRef.current = submitOwner')
  const snapshotIndex = source.indexOf('const acceptedItems = [...validItems]')
  const saveIndex = source.indexOf('const result = await onSave(acceptedItems)')

  assert.ok(guardIndex > -1, 'save should reject a competing same-render submission')
  assert.ok(ownerIndex > guardIndex, 'the accepted submit should claim synchronous ownership')
  assert.ok(snapshotIndex > ownerIndex, 'accepted items should be snapshotted after ownership is claimed')
  assert.ok(saveIndex > snapshotIndex, 'persistence must occur only after ownership and payload snapshot')
})

test('only the owning quick capture submission can release saving state', () => {
  assert.match(
    source,
    /finally \{[\s\S]*?if \(submitOwnerRef\.current === submitOwner\) \{[\s\S]*?submitOwnerRef\.current = null[\s\S]*?setIsSaving\(false\)[\s\S]*?\}/
  )
})

test('quick capture local mutation and close paths use the synchronous owner', () => {
  for (const handler of ['handleCancel', 'handleInputChange', 'handleAddItem', 'handleRemoveItem', 'handleToggleAdvanced', 'handleDismissSaveError']) {
    const handlerIndex = source.indexOf(`const ${handler} =`)
    assert.ok(handlerIndex > -1, `${handler} should exist`)
    const nextHandlerIndex = source.indexOf('\n  const ', handlerIndex + 10)
    const body = source.slice(handlerIndex, nextHandlerIndex > -1 ? nextHandlerIndex : undefined)
    assert.match(body, /submitOwnerRef\.current !== null/, `${handler} should fail closed while a save owns the modal`)
  }

  assert.match(source, /useModalDialog\(\{ onEscape: handleCancel, initialFocusRef: inputRef \}\)/)
  assert.match(source, /onClick=\{handleCancel\}/)
  assert.match(source, /onChange=\{\(e\) => handleInputChange\(e\.target\.value\)\}/)
  assert.match(source, /onClick=\{handleToggleAdvanced\}/)
})
