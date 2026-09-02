import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('removing a captured task returns focus to the persistent capture input', async () => {
  const modal = await read('src/components/projects/QuickCaptureModal.jsx')

  assert.match(modal, /const inputRef = useRef\(null\)/)
  assert.match(modal, /ref=\{inputRef\}/)
  assert.match(modal, /id="quick-capture-input"/)
  assert.match(modal, /const handleRemoveItem = \(index\) => \{\s*if \(isSaving\) return\s*setItems\(items\.filter\(\(_, i\) => i !== index\)\)\s*inputRef\.current\?\.focus\(\)\s*\}/)
  assert.match(modal, /onClick=\{\(\) => handleRemoveItem\(index\)\}/)
})
