import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/components/mode/ModeSwitcher.jsx', import.meta.url), 'utf8')

test('Mode Switcher owns Escape while its trigger still has focus', () => {
  assert.match(source, /case 'Escape':\s+if \(!isOpen\) break\s+event\.preventDefault\(\)\s+event\.stopPropagation\(\)\s+closeMenu\(\)/s)
})

test('Mode Switcher menu retains Escape ownership after focus enters the popup', () => {
  const escapeOwners = source.match(/case 'Escape':[\s\S]*?event\.stopPropagation\(\)[\s\S]*?closeMenu\(\)/g) || []
  assert.ok(escapeOwners.length >= 2, 'expected both trigger and popup Escape handlers to own dismissal')
})
