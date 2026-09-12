import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const profileSource = readFileSync(
  fileURLToPath(new URL('../src/components/auth/ProfileSelector.jsx', import.meta.url)),
  'utf8'
)

test('development profile switching claims synchronous ownership before auth begins', () => {
  assert.match(profileSource, /import React, \{ useRef, useState \} from 'react'/)
  assert.match(profileSource, /const switchOwnerRef = useRef\(null\)/)
  assert.match(
    profileSource,
    /const handleProfileSelect = async \(email\) => \{\s*if \(switchOwnerRef\.current !== null\) return;\s*\s*const selectedEmail = email;\s*switchOwnerRef\.current = selectedEmail;[\s\S]*?await signIn\(selectedEmail, 'password123'\)/
  )
})

test('profile switch ownership is released only by the attempt that owns it', () => {
  assert.match(
    profileSource,
    /finally \{\s*if \(switchOwnerRef\.current === selectedEmail\) \{\s*switchOwnerRef\.current = null;\s*setLoadingEmail\(null\);\s*\}\s*\}/
  )
  assert.match(profileSource, /Failed to switch to \$\{selectedEmail\}/)
})