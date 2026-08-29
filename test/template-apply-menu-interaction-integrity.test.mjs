import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('TemplateCard apply menu exposes complete keyboard navigation semantics', async () => {
  const source = await read('src/components/templates/TemplateCard.jsx')

  assert.match(source, /aria-haspopup="menu"/)
  assert.match(source, /role="menu"/)
  assert.match(source, /role="menuitem"/)
  assert.match(source, /onKeyDown=\{handleApplyMenuKeyDown\}/)
  assert.match(source, /event\.key === 'ArrowDown'/)
  assert.match(source, /event\.key === 'ArrowUp'/)
  assert.match(source, /event\.key === 'Home'/)
  assert.match(source, /event\.key === 'End'/)
})

test('TemplateCard apply menu owns initial focus and Escape restoration', async () => {
  const source = await read('src/components/templates/TemplateCard.jsx')

  assert.match(source, /applyMenuItemRefs\.current\[0\]\?\.focus\(\)/)
  assert.match(source, /if \(event\.key === 'Escape'\)/)
  assert.match(source, /closeApplyMenu\(\{ restoreFocus: true \}\)/)
  assert.match(source, /applyMenuTriggerRef\.current\?\.focus\(\)/)
})

test('TemplateCard preserves Edit Before Applying modal-stack focus ownership', async () => {
  const source = await read('src/components/templates/TemplateCard.jsx')
  const editHandler = source.match(/<span>Edit Before Applying<\/span>[\s\S]*?<\/button>/)

  assert.match(source, /onEditBeforeApply\(\)/)
  assert.match(source, /Keep the initiating control mounted while the child dialog is open/)
  assert.doesNotMatch(editHandler?.[0] ?? '', /closeApplyMenu\(/)
})
