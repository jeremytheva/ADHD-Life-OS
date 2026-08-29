import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Template Apply exposes controlled menu semantics', async () => {
  const source = await read('src/components/templates/TemplateCard.jsx')

  assert.match(source, /aria-haspopup="menu"/)
  assert.match(source, /aria-expanded=\{showApplyMenu && !isApplied\}/)
  assert.match(source, /role="menu"/)
  assert.match(source, /aria-label=\{`Apply \$\{templateName\}`\}/)
  assert.match(source, /role="menuitem"/)
  assert.match(source, /aria-hidden="true"/)
})

test('Template Apply owns initial focus, keyboard navigation and Escape restoration', async () => {
  const source = await read('src/components/templates/TemplateCard.jsx')

  assert.match(source, /const applyTriggerRef = useRef\(null\)/)
  assert.match(source, /const applyMenuItemRefs = useRef\(\[\]\)/)
  assert.match(source, /window\.requestAnimationFrame\(\(\) => applyTriggerRef\.current\?\.focus\(\)\)/)
  assert.match(source, /window\.requestAnimationFrame\(\(\) => focusApplyMenuItem\(0\)\)/)
  assert.match(source, /case 'Escape':/)
  assert.match(source, /case 'ArrowDown':/)
  assert.match(source, /case 'ArrowUp':/)
  assert.match(source, /case 'Home':/)
  assert.match(source, /case 'End':/)
  assert.match(source, /onKeyDown=\{handleApplyMenuKeyDown\}/)
  assert.match(source, /onClick=\{\(\) => closeApplyMenu\(\)\}/)
})

test('Edit Before Applying preserves the initiating menu item for modal-stack focus restoration', async () => {
  const source = await read('src/components/templates/TemplateCard.jsx')

  const editHandler = source.match(/onClick=\{\(\) => \{([\s\S]*?)onEditBeforeApply\(\)([\s\S]*?)\}\}/)
  assert.ok(editHandler, 'expected Edit Before Applying click handler')
  assert.doesNotMatch(editHandler[0], /closeApplyMenu/)
})
