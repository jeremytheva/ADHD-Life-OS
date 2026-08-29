import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Template Library owns one semantic parent dialog and exposes selected controls', async () => {
  const source = await read('src/components/templates/TemplateLibrary.jsx')

  assert.match(source, /import useModalDialog from '\.\.\/\.\.\/common\/useModalDialog'/)
  assert.match(source, /const dialogRef = useModalDialog\(\{ onEscape: onClose \}\)/)
  assert.equal((source.match(/role="dialog"/g) ?? []).length, 1)
  assert.match(source, /aria-modal="true"/)
  assert.match(source, /aria-labelledby=\{dialogTitleId\}/)
  assert.match(source, /aria-label="Close template library"/)
  assert.match(source, /aria-pressed=\{selectedCategory === category\}/)
  assert.match(source, /aria-label="Grid view"/)
  assert.match(source, /aria-pressed=\{viewMode === 'grid'\}/)
  assert.match(source, /aria-label="List view"/)
  assert.match(source, /aria-pressed=\{viewMode === 'list'\}/)
})

test('Template Preview and Edit use the same stack-aware modal contract', async () => {
  const preview = await read('src/components/templates/TemplatePreview.jsx')
  const edit = await read('src/components/templates/TemplateEditModal.jsx')

  for (const [name, source] of [['preview', preview], ['edit', edit]]) {
    assert.match(source, /import useModalDialog from '\.\.\/\.\.\/common\/useModalDialog'/, `${name} imports shared modal ownership`)
    assert.match(source, /const dialogRef = useModalDialog\(\{ onEscape: onClose \}\)/, `${name} uses shared Escape ownership`)
    assert.equal((source.match(/role="dialog"/g) ?? []).length, 1, `${name} exposes one dialog`)
    assert.match(source, /aria-modal="true"/)
    assert.match(source, /tabIndex=\{-1\}/)
  }

  assert.match(preview, /aria-label="Close template preview"/)
  assert.match(edit, /aria-label="Close template editor"/)
})

test('Preview stays mounted when Edit opens and direct Edit preserves its connected opener', async () => {
  const library = await read('src/components/templates/TemplateLibrary.jsx')
  const card = await read('src/components/templates/TemplateCard.jsx')

  const editHandler = library.match(/const handleEditBeforeApply = \(template, type\) => \{([\s\S]*?)\n {2}\}/)?.[1] ?? ''
  assert.match(editHandler, /setEditingTemplate\(\{ \.\.\.template, type \}\)/)
  assert.doesNotMatch(editHandler, /setPreviewTemplate\(null\)/)
  assert.match(library, /setEditingTemplate\(null\)\s+setPreviewTemplate\(null\)/)

  const editMenuHandler = card.match(/<span>Edit Before Applying<\/span>[\s\S]*?<\/button>/)
  assert.match(card, /aria-haspopup="menu"/)
  assert.match(card, /role="menu"/)
  assert.match(card, /role="menuitem"/)
  assert.match(card, /Keep the initiating control mounted while the child dialog is open/)
  assert.ok(editMenuHandler || card.includes('Edit Before Applying'))
})