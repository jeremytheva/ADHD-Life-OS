import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const authSource = readFileSync(
  fileURLToPath(new URL('../src/components/auth/NCBAuth.jsx', import.meta.url)),
  'utf8'
)

test('auth submit claims synchronous ownership and snapshots accepted credentials', () => {
  assert.match(authSource, /const submitPendingRef = useRef\(false\)/)
  assert.match(authSource, /if \(submitPendingRef\.current\) return[\s\S]*?submitPendingRef\.current = true/)
  assert.match(authSource, /const pendingCredentials = \{ email, password \}/)
  assert.match(authSource, /await signUp\(pendingCredentials\.email, pendingCredentials\.password\)/)
  assert.match(authSource, /await signIn\(pendingCredentials\.email, pendingCredentials\.password\)/)
  assert.match(authSource, /finally \{[\s\S]*?submitPendingRef\.current = false[\s\S]*?setLoading\(false\)/)
})

test('auth inputs and alternate navigation cannot compete with an owned submit', () => {
  assert.match(authSource, /const handleEmailChange = \(event\) => \{[\s\S]*?if \(submitPendingRef\.current\) return/)
  assert.match(authSource, /const handlePasswordChange = \(event\) => \{[\s\S]*?if \(submitPendingRef\.current\) return/)
  assert.match(authSource, /const handleAlternateClick = \(event\) => \{[\s\S]*?if \(submitPendingRef\.current\) event\.preventDefault\(\)/)
  assert.match(authSource, /onChange=\{handleEmailChange\}[\s\S]*?disabled=\{loading\}/)
  assert.match(authSource, /onChange=\{handlePasswordChange\}[\s\S]*?disabled=\{loading\}/)
  assert.match(authSource, /onClick=\{handleAlternateClick\}[\s\S]*?aria-disabled=\{loading\}[\s\S]*?tabIndex=\{loading \? -1 : undefined\}/)
})
