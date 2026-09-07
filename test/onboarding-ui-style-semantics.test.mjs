import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Onboarding UI style choices expose state while decorative glyphs stay silent', async () => {
  const source = await read('src/components/onboarding/steps/UIStyleStep.jsx')

  assert.match(source, /role="group" aria-label="Interface style"/)
  assert.match(source, /<motion\.button[\s\S]*?type="button"[\s\S]*?aria-pressed=\{isSelected\}/)
  assert.match(source, /<SafeIcon icon=\{style\.icon\}[\s\S]*?aria-hidden="true"/)
  assert.match(source, /className="bg-green-500 text-white p-1 rounded-full" aria-hidden="true"/)
  assert.match(source, /feels right <span aria-hidden="true">🎨<\/span>/)
  assert.match(source, /<button[\s\S]*?type="button"[\s\S]*?onClick=\{onBack\}[\s\S]*?<span aria-hidden="true">←<\/span> Back/)
  assert.match(source, /<button[\s\S]*?type="button"[\s\S]*?onClick=\{handleNext\}[\s\S]*?Continue <span aria-hidden="true">→<\/span>/)
})
