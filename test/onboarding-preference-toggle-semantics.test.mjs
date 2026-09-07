import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Onboarding preferences expose named stateful toggle controls', async () => {
  const source = await read('src/components/onboarding/steps/PreferencesStep.jsx')

  assert.match(source, /<button[\s\S]*?type="button"[\s\S]*?aria-label=\{`\$\{label\}: \$\{value \? 'On' : 'Off'\}`\}[\s\S]*?aria-pressed=\{value\}/)
  assert.match(source, /<SafeIcon icon=\{Icon\}[\s\S]*?aria-hidden="true"/)
  assert.match(source, /icon=\{value \? FiToggleRight : FiToggleLeft\}[\s\S]*?aria-hidden="true"/)
  assert.match(source, /Fine-tune your experience <span aria-hidden="true">⚙️<\/span>/)
  assert.match(source, /<span aria-hidden="true">✨<\/span>/)
  assert.match(source, /<span aria-hidden="true">←<\/span> Back/)
  assert.match(source, /Complete Setup <span aria-hidden="true">→<\/span>/)
})
