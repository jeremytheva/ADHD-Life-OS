import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { URL } from 'node:url'

const source = await readFile(
  new URL('../src/components/accessibility/AccessibilitySettings.jsx', import.meta.url),
  'utf8'
)

test('Accessibility Settings surfaces failed saves without closing the dialog', () => {
  assert.match(source, /const \[saveError, setSaveError\] = useState\(null\)/)
  assert.match(source, /if \(savePreferences\(settings\)\) \{[\s\S]*onClose\(\)[\s\S]*return[\s\S]*\}/)
  assert.match(source, /setSaveError\('Settings could not be saved\./)
  assert.match(source, /id="accessibility-settings-save-error"/)
  assert.match(source, /role="alert"/)
  assert.match(source, /aria-describedby=\{saveError \? 'accessibility-settings-save-error' : undefined\}/)
})

test('changing settings clears stale save feedback before another attempt', () => {
  assert.match(source, /const handleChange = \(key, value\) => \{\s*setSaveError\(null\)/)
})
