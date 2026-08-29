import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Accessibility Settings exposes labelled stateful selection groups', async () => {
  const source = await read('src/components/accessibility/AccessibilitySettings.jsx')

  assert.match(source, /id="accessibility-text-size-label"/)
  assert.match(source, /aria-labelledby="accessibility-text-size-label"/)
  assert.match(source, /aria-pressed=\{settings\.fontSize === size\.value\}/)

  assert.match(source, /id="accessibility-contrast-label"/)
  assert.match(source, /aria-labelledby="accessibility-contrast-label"/)
  assert.match(source, /aria-pressed=\{settings\.contrast === contrast\.value\}/)

  assert.match(source, /id="accessibility-line-spacing-label"/)
  assert.match(source, /aria-labelledby="accessibility-line-spacing-label"/)
  assert.match(source, /aria-pressed=\{settings\.lineSpacing === spacing\.value\}/)

  assert.equal((source.match(/role="group"/g) || []).length >= 3, true)
})
