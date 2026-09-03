import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Mode Switcher exposes a controlled menu trigger and selected mode semantics', async () => {
  const source = await read('src/components/mode/ModeSwitcher.jsx')

  assert.match(source, /aria-haspopup="menu"/)
  assert.match(source, /aria-expanded=\{isOpen\}/)
  assert.match(source, /aria-controls=\{isOpen \? menuId : undefined\}/)
  assert.match(source, /role="menu"/)
  assert.match(source, /aria-label="Available contexts"/)
  assert.match(source, /role="menuitemradio"/)
  assert.match(source, /aria-checked=\{isActive\}/)
  assert.match(source, /tabIndex=\{isActive \? 0 : -1\}/)
  assert.match(source, /aria-label="Toggle context statistics"/)
  assert.match(source, /aria-pressed=\{showStats\}/)
})

test('Mode Switcher owns keyboard dismissal, roving navigation and trigger restoration', async () => {
  const source = await read('src/components/mode/ModeSwitcher.jsx')

  assert.match(source, /const triggerRef = useRef\(null\)/)
  assert.match(source, /const modeItemRefs = useRef\(\[\]\)/)
  assert.match(source, /window\.requestAnimationFrame\(\(\) => triggerRef\.current\?\.focus\(\)\)/)
  assert.match(source, /case 'Escape':/)
  assert.match(source, /case 'ArrowDown':/)
  assert.match(source, /case 'ArrowUp':/)
  assert.match(source, /case 'Home':/)
  assert.match(source, /case 'End':/)
  assert.match(source, /onKeyDown=\{handleMenuKeyDown\}/)
  assert.match(source, /onClick=\{\(\) => closeMenu\(\)\}/)
})

test('Mode Switcher closes after Tab moves focus outside without forcing trigger focus', async () => {
  const source = await read('src/components/mode/ModeSwitcher.jsx')

  assert.match(source, /const popupRef = useRef\(null\)/)
  assert.match(source, /ref=\{popupRef\}/)
  assert.match(source, /case 'Tab':/)
  assert.match(source, /const popup = popupRef\.current/)
  assert.match(source, /!popup\.contains\(document\.activeElement\)/)
  assert.match(source, /setIsOpen\(false\)/)
})
