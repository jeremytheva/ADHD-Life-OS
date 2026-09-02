import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { URL } from 'node:url'

const source = await readFile(
  new URL('../src/contexts/AccessibilityPreferencesContext.jsx', import.meta.url),
  'utf8'
)

test('accessibility preferences govern shared Framer Motion reduced-motion policy', () => {
  assert.match(source, /import \{ MotionConfig \} from 'framer-motion'/)
  assert.match(
    source,
    /<MotionConfig reducedMotion=\{preferences\.reduceMotion \? 'always' : 'user'\}>/
  )
  assert.match(source, /<AccessibilityPreferencesContext\.Provider/)
})
