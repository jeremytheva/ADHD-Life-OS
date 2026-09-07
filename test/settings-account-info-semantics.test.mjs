import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Settings exposes static account information as description data', async () => {
  const source = await read('src/components/settings/Settings.jsx')

  assert.match(source, /<h2 className="text-lg font-medium text-slate-900 mb-4">Account<\/h2>/)
  assert.match(source, /<dl className="space-y-3">/)
  assert.match(source, /<dt className="text-sm font-medium text-slate-700">Email<\/dt>/)
  assert.match(source, /<dd className="text-slate-900">\{user\?\.email\}<\/dd>/)
  assert.doesNotMatch(source, /<label[^>]*>\s*Email\s*<\/label>\s*<p[^>]*>\{user\?\.email\}<\/p>/)
})
