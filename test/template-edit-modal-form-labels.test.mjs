import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Template Edit associates visible labels and names dynamic step controls', async () => {
  const source = await read('src/components/templates/TemplateEditModal.jsx')

  assert.match(source, /const fieldIdPrefix = `template-edit-\$\{template\.id\}`/)

  assert.match(source, /<label htmlFor=\{primaryFieldId\}/)
  assert.match(source, /<input id=\{primaryFieldId\}/)
  assert.match(source, /<label htmlFor=\{descriptionFieldId\}/)
  assert.match(source, /<textarea id=\{descriptionFieldId\}/)
  assert.match(source, /<label htmlFor=\{repeatPatternFieldId\}/)
  assert.match(source, /<select id=\{repeatPatternFieldId\}/)
  assert.match(source, /<label htmlFor=\{durationFieldId\}/)
  assert.match(source, /<input id=\{durationFieldId\} type="number"/)

  assert.match(source, /aria-label=\{`Step \$\{index \+ 1\} name`\}/)
  assert.match(source, /aria-label=\{`Step \$\{index \+ 1\} duration in minutes`\}/)
  assert.match(source, /id=\{`\$\{fieldIdPrefix\}-step-essential-\$\{index\}`\}/)
  assert.match(source, /htmlFor=\{`\$\{fieldIdPrefix\}-step-essential-\$\{index\}`\}/)
})
