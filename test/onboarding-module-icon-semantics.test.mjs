import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Onboarding modules keep redundant glyphs presentation-only', async () => {
  const source = await read('src/components/onboarding/steps/ModulesStep.jsx')

  assert.match(source, /Choose your tools <span aria-hidden="true">🛠️<\/span>/)
  assert.match(source, /<SafeIcon icon=\{module\.icon\}[\s\S]*?aria-hidden="true"/)
  assert.match(source, /<span className="text-green-500" aria-hidden="true">✓<\/span>/)
  assert.match(source, /className=\{isEnabled \? 'text-green-500' : 'text-slate-400'\} aria-hidden="true">✓<\/span>/)
  assert.match(source, /<SafeIcon icon=\{FiInfo\}[\s\S]*?aria-hidden="true"/)
  assert.match(source, /<span aria-hidden="true">💡<\/span> Helpful Tip/)
  assert.match(source, /<span aria-hidden="true">←<\/span> Back/)
  assert.match(source, /Continue <span aria-hidden="true">→<\/span>/)
})
