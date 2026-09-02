import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('AccessibilitySettings associates each switch with its visible description', async () => {
  const source = await read('src/components/accessibility/AccessibilitySettings.jsx')

  assert.match(source, /id="accessibility-reduce-motion-description"/)
  assert.match(source, /aria-describedby="accessibility-reduce-motion-description"/)
  assert.match(source, /aria-checked=\{settings\.reduceMotion\}/)

  assert.match(source, /id="accessibility-focus-mode-description"/)
  assert.match(source, /aria-describedby="accessibility-focus-mode-description"/)
  assert.match(source, /aria-checked=\{settings\.focusMode\}/)

  assert.match(source, /id="accessibility-dyslexic-font-description"/)
  assert.match(source, /aria-describedby="accessibility-dyslexic-font-description"/)
  assert.match(source, /aria-checked=\{settings\.dyslexicFont\}/)
})
