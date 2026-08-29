import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('ProjectCard keeps project opening on an explicit native control', async () => {
  const source = await read('src/components/projects/ProjectCard.jsx')

  assert.match(source, /<button[\s\S]*aria-label=\{`View details for \$\{project\.title\}`\}/)
  assert.doesNotMatch(source, /className=\{`bg-gradient-to-r[\s\S]*cursor-pointer[\s\S]*onClick=\{onClick\}/)
  assert.doesNotMatch(source, /className="p-4 cursor-pointer" onClick=\{onClick\}/)
})

test('ProjectCard action menu owns keyboard navigation and focus restoration', async () => {
  const source = await read('src/components/projects/ProjectCard.jsx')

  assert.match(source, /aria-haspopup="menu"/)
  assert.match(source, /role="menu"/)
  assert.match(source, /role="menuitem"/)
  assert.match(source, /if \(event\.key === 'Escape'\)/)
  assert.match(source, /event\.key === 'ArrowDown'/)
  assert.match(source, /event\.key === 'ArrowUp'/)
  assert.match(source, /event\.key === 'Home'/)
  assert.match(source, /event\.key === 'End'/)
  assert.match(source, /menuItemRefs\.current\[0\]\?\.focus\(\)/)
  assert.match(source, /menuTriggerRef\.current\?\.focus\(\)/)
})
