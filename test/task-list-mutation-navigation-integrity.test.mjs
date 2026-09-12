import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/tasks/TaskList.jsx', import.meta.url), 'utf8')

test('TaskList blocks retry and adjacent navigation from crossing an active mutation boundary', () => {
  assert.match(source, /const retryLoad = \(\) => \{\s*if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(source, /const handleOpenForm = \(\) => \{\s*if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(source, /const handleOpenTemplates = \(\) => \{\s*if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(source, /const handleFilterChange = \(nextFilter\) => \{\s*if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(source, /const handleSortChange = \(nextSort\) => \{\s*if \(mutationOwnerRef\.current !== null\) return/)
})

test('TaskList routes retry, entry, filter and sort controls through mutation-aware handlers', () => {
  const retryUses = source.match(/onRetry=\{retryLoad\}/g) ?? []
  assert.equal(retryUses.length, 2)
  const formUses = source.match(/onClick=\{handleOpenForm\}/g) ?? []
  assert.equal(formUses.length, 2)
  const templateUses = source.match(/onClick=\{handleOpenTemplates\}/g) ?? []
  assert.equal(templateUses.length, 2)
  assert.match(source, /onClick=\{\(\) => handleFilterChange\(filterOption\.key\)\}\s*disabled=\{mutationPending\}/)
  assert.match(source, /onChange=\{\(event\) => handleSortChange\(event\.target\.value\)\}\s*disabled=\{mutationPending\}/)
})

test('TaskList keeps the synchronous mutation owner authoritative for persistence', () => {
  assert.match(source, /const mutationOwnerRef = useRef\(null\)/)
  const ownershipGuards = source.match(/if \(mutationOwnerRef\.current !== null\) return/g) ?? []
  assert.ok(ownershipGuards.length >= 8)
  assert.match(source, /mutationOwnerRef\.current = mutationOwner/)
  assert.match(source, /if \(mutationOwnerRef\.current === mutationOwner\) \{\s*mutationOwnerRef\.current = null/)
})
