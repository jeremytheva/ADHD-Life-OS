import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('routine template preview exposes its visibly ordered steps as a native ordered list', async () => {
  const preview = await read('src/components/templates/TemplatePreview.jsx')

  assert.match(preview, /<ol className="space-y-2">\{template\.steps\.map/)
  assert.match(preview, /<motion\.li key=\{index\}/)
  assert.match(preview, /\{index \+ 1\}/)
})
