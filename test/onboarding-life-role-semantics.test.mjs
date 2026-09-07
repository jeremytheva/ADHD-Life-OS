import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Onboarding life roles expose stateful choices and named custom-role controls', async () => {
  const source = await read('src/components/onboarding/steps/LifeRolesStep.jsx')

  assert.match(source, /role="group"[\s\S]*?aria-label="Life roles"/)
  assert.match(source, /type="button"[\s\S]*?aria-pressed=\{isSelected\}/)
  assert.match(source, /<label htmlFor="custom-role-input" className="sr-only">[\s\S]*?Custom role[\s\S]*?<\/label>/)
  assert.match(source, /id="custom-role-input"[\s\S]*?type="text"/)
  assert.match(source, /aria-label=\{`Remove \$\{role\}`\}/)
  assert.match(source, /icon=\{FiX\}[\s\S]*?aria-hidden="true"/)
})
