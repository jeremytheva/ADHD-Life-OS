import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('TemplateLibrary claims apply ownership before rendered pending state', async () => {
  const source = await read('src/components/templates/TemplateLibrary.jsx')
  const runApply = source.match(/const runApply = async[\s\S]*?const handleDirectApply/)?.[0] ?? ''

  assert.match(runApply, /if \(!onApplyTemplate \|\| applyPendingRef\.current\) return false/)
  assert.match(runApply, /applyPendingRef\.current = true[\s\S]*?setIsApplying\(true\)/)
  assert.match(runApply, /applyPendingRef\.current = false[\s\S]*?setIsApplying\(false\)/)
})

test('TemplateLibrary mutation-adjacent controls consult synchronous apply ownership', async () => {
  const source = await read('src/components/templates/TemplateLibrary.jsx')

  for (const handler of [
    'handleSearchQueryChange',
    'handleTypeChange',
    'handleCategoryChange',
    'handleViewModeChange'
  ]) {
    const region = source.match(new RegExp(`const ${handler} = \\(.*?\\) => \\{[\\s\\S]*?\\n  \\}`))?.[0] ?? ''
    assert.match(region, /if \(applyPendingRef\.current\) return/)
  }

  assert.match(source, /onChange=\{\(e\) => handleSearchQueryChange\(e\.target\.value\)\}/)
  assert.match(source, /onChange=\{\(e\) => handleTypeChange\(e\.target\.value\)\}/)
  assert.match(source, /onClick=\{\(\) => handleCategoryChange\(category\)\}/)
  assert.match(source, /onClick=\{\(\) => handleViewModeChange\('grid'\)\}/)
  assert.match(source, /onClick=\{\(\) => handleViewModeChange\('list'\)\}/)
})
