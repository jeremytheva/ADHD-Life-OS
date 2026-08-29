import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Accessibility Settings exposes each visual option group and selected state semantically', async () => {
  const source = await read('src/components/accessibility/AccessibilitySettings.jsx')

  assert.match(source, /role="group" aria-labelledby="accessibility-text-size-label"/)
  assert.match(source, /aria-pressed=\{settings\.fontSize === size\.value\}/)
  assert.match(source, /role="group" aria-labelledby="accessibility-contrast-label"/)
  assert.match(source, /aria-pressed=\{settings\.contrast === contrast\.value\}/)
  assert.match(source, /role="group" aria-labelledby="accessibility-line-spacing-label"/)
  assert.match(source, /aria-pressed=\{settings\.lineSpacing === spacing\.value\}/)
})
