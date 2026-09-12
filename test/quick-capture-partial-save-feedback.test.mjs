import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/projects/QuickCaptureModal.jsx', import.meta.url), 'utf8')

test('quick capture keeps partial-save feedback inside the open modal', () => {
  assert.match(source, /const \[saveError, setSaveError\] = useState\(null\)/)
  assert.match(source, /if \(result\.remainingItems\.length > 0\)/)
  assert.match(source, /result\.savedCount > 0/)
  assert.match(source, /Only the unsaved tasks remain here, so retrying will not duplicate the saved tasks\./)
  assert.match(source, /None were saved, and your list is still available to retry\./)
  assert.match(source, /<OperationErrorState message=\{saveError\}/)
})

test('quick capture clears stale save feedback before the accepted snapshot is persisted', () => {
  const clearIndex = source.indexOf('setSaveError(null)')
  const snapshotIndex = source.indexOf('const acceptedItems = [...validItems]')
  const saveIndex = source.indexOf('const result = await onSave(acceptedItems)')

  assert.ok(clearIndex > -1, 'save feedback should be cleared before retrying')
  assert.ok(snapshotIndex > -1, 'accepted items should be snapshotted for the owning submission')
  assert.ok(saveIndex > clearIndex, 'stale feedback must clear before invoking the save operation')
  assert.ok(saveIndex > snapshotIndex, 'the accepted snapshot must be established before persistence')
})
