import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Day Setup exposes saving progress and freezes pending form state', async () => {
  const source = await read('src/components/settings/DaySetup.jsx')

  assert.match(source, /<form[^>]+aria-busy=\{saving \? 'true' : 'false'\}/)
  assert.match(source, /const handleChange = \(field, value\) => \{\s*if \(saving\) return/)
  assert.match(source, /const handleSubmit = async \(e\) => \{[\s\S]*?if \(saving\) return[\s\S]*?setSaving\(true\)/)
  assert.match(source, /<fieldset disabled=\{saving\} className="space-y-4">/)
  assert.match(source, /disabled=\{saving\}[\s\S]*?aria-busy=\{saving \? 'true' : 'false'\}/)
  assert.match(source, /className="sr-only"\s+role="status"\s+aria-live="polite"\s+aria-atomic="true"/)
  assert.match(source, /Saving day setup changes\.\.\./)
  assert.match(source, /saving \? 'Saving\.\.\.' : 'Save Changes'/)
})
