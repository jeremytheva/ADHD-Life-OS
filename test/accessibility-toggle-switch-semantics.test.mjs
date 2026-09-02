import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { URL } from 'node:url'

const source = await readFile(
  new URL('../src/components/accessibility/AccessibilitySettings.jsx', import.meta.url),
  'utf8'
)

test('binary accessibility controls expose switch semantics', () => {
  const switchRoles = source.match(/role="switch"/g) ?? []
  const checkedStates = source.match(/aria-checked=\{settings\.(reduceMotion|focusMode|dyslexicFont)\}/g) ?? []

  assert.equal(switchRoles.length, 3)
  assert.equal(checkedStates.length, 3)
  assert.doesNotMatch(source, /aria-pressed=\{settings\.(reduceMotion|focusMode|dyslexicFont)\}/)
})
