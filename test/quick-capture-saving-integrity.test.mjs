import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Quick Capture guards and announces an unresolved save', async () => {
  const source = await read('src/components/projects/QuickCaptureModal.jsx')

  assert.match(source, /const \[isSaving, setIsSaving\] = useState\(false\)/)
  assert.match(source, /onEscape: isSaving \? null : onCancel/)
  assert.match(source, /const handleAddItem = \(\) => \{[\s\S]*?if \(isSaving\) return/)
  assert.match(source, /const handleRemoveItem = \(index\) => \{[\s\S]*?if \(isSaving\) return/)
  assert.match(source, /id="quick-capture-input"[\s\S]*?disabled=\{isSaving\}/)
  assert.match(source, /aria-label="Close quick capture"[\s\S]*?disabled=\{isSaving\}/)
  assert.match(source, /aria-busy=\{isSaving \? 'true' : 'false'\}/)
  assert.match(source, /onClick=\{handleSaveAll\}[\s\S]*?disabled=\{items\.filter\(i => i\)\.length === 0 \|\| isSaving\}[\s\S]*?aria-busy=\{isSaving \? 'true' : 'false'\}/)
  assert.match(source, /className="sr-only" role="status" aria-live="polite" aria-atomic="true"/)
  assert.match(source, /Saving captured tasks\.\.\./)
  assert.match(source, /isSaving \? 'Saving…'/)
})
