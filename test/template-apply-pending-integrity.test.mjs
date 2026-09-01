import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('template library owns one pending apply and blocks dismissal or filter mutation', async () => {
  const source = await read('src/components/templates/TemplateLibrary.jsx')

  assert.match(source, /const \[isApplying, setIsApplying\] = useState\(false\)/)
  assert.match(source, /const applyPendingRef = useRef\(false\)/)
  assert.match(source, /if \(!onApplyTemplate \|\| applyPendingRef\.current\) return false/)
  assert.match(source, /onEscape: isApplying \? null : safeClose/)
  assert.match(source, /aria-busy=\{isApplying\}/)
  assert.match(source, /Applying template…/)
  assert.match(source, /disabled=\{isApplying\}/)
})

test('template cards cannot open or apply another template during an unresolved apply', async () => {
  const source = await read('src/components/templates/TemplateCard.jsx')

  assert.match(source, /isApplying = false/)
  assert.match(source, /disabled=\{isApplied \|\| isApplying\}/)
  assert.match(source, /disabled=\{isApplying\}/)
  assert.match(source, /Applying…/)
})

test('template preview locks dismissal and edit/apply actions while applying', async () => {
  const source = await read('src/components/templates/TemplatePreview.jsx')

  assert.match(source, /onEscape: isApplying \? null : onClose/)
  assert.match(source, /aria-busy=\{isApplying\}/)
  assert.match(source, /const safeClose = \(\) => \{ if \(!isApplying\) onClose\(\) \}/)
  assert.match(source, /aria-live="polite"/)
  assert.match(source, /aria-busy=\{isApplying\}/)
})

test('template editor freezes submitted state and dismissal while applying', async () => {
  const source = await read('src/components/templates/TemplateEditModal.jsx')

  assert.match(source, /onEscape: isApplying \? null : onClose/)
  assert.match(source, /if \(isApplying\) return/)
  assert.match(source, /<fieldset disabled=\{isApplying\}/)
  assert.match(source, /aria-busy=\{isApplying\}/)
  assert.match(source, /Applying template…/)
})
