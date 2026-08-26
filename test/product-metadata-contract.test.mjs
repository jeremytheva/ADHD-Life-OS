import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const indexHtml = await readFile(new globalThis.URL('../index.html', import.meta.url), 'utf8')

test('index metadata identifies ADHD Life OS instead of build-tool boilerplate', () => {
  assert.match(indexHtml, /<title>ADHD Life OS<\/title>/)
  assert.match(indexHtml, /<meta property="og:title" content="ADHD Life OS" \/>/)
  assert.match(indexHtml, /name="description"/)
  assert.match(indexHtml, /ADHD Life OS is a calm, low-stimulation life-management app/)

  assert.doesNotMatch(indexHtml, /<title>Vite \+ React<\/title>/)
  assert.doesNotMatch(indexHtml, /Your Name/)
  assert.doesNotMatch(indexHtml, /SEO-Friendly App/)
})
