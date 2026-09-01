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

test('TemplateCard restores trigger focus when the apply menu is dismissed outside', async () => {
  const source = await read('src/components/templates/TemplateCard.jsx')

  assert.match(source, /className="fixed inset-0 z-10"[\s\S]*?onClick=\{\(\) => closeApplyMenu\(\{ restoreFocus: true \}\)\}/)
})

test('TemplateCard preserves Edit Before Applying modal-stack focus ownership', async () => {
  const source = await read('src/components/templates/TemplateCard.jsx')
  const editRegion = source.match(/onClick=\{onEditBeforeApply\}[\s\S]*?<span>Edit Before Applying<\/span>/)?.[0] ?? ''

  assert.match(source, /onClick=\{onEditBeforeApply\}/)
  assert.match(editRegion, /<span>Edit Before Applying<\/span>/)
  assert.doesNotMatch(editRegion, /closeApplyMenu\(/)
  assert.match(source, /disabled=\{isApplied \|\| isApplying\}/)
})
