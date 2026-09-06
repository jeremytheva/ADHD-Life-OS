import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../src/index.css', import.meta.url)),
  'utf8'
)

test('shared motion variables preserve operating-system reduced-motion preference', () => {
  assert.match(css, /:root\s*\{[\s\S]*?--animation-duration:\s*200ms;[\s\S]*?--scroll-behavior:\s*smooth;[\s\S]*?\}/)
  assert.match(css, /html\s*\{\s*scroll-behavior:\s*var\(--scroll-behavior\);\s*\}/)
  assert.match(
    css,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?:root\s*\{[\s\S]*?--animation-duration:\s*0\.01ms;[\s\S]*?--scroll-behavior:\s*auto;[\s\S]*?\}[\s\S]*?animation-iteration-count:\s*1\s*!important;/
  )

  const sharedDurationRule = css.indexOf('animation-duration: var(--animation-duration) !important;')
  const systemPreferenceRule = css.indexOf('@media (prefers-reduced-motion: reduce)')
  assert.ok(sharedDurationRule >= 0)
  assert.ok(systemPreferenceRule > sharedDurationRule)
})
