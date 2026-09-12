import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Day Setup claims save ownership synchronously and freezes edits while pending', async () => {
  const source = await read('src/components/settings/DaySetup.jsx')

  assert.match(source, /import React, \{ useRef, useState \} from 'react'/)
  assert.match(source, /const saveOwnerRef = useRef\(false\)/)
  assert.match(source, /const handleChange = \(field, value\) => \{\s*if \(saveOwnerRef\.current\) return/)
  assert.match(source, /const handleSubmit = async \(e\) => \{[\s\S]*?if \(saveOwnerRef\.current\) return[\s\S]*?saveOwnerRef\.current = true[\s\S]*?setSaving\(true\)/)
  assert.match(source, /const pendingChanges = \{[\s\S]*?\.\.\.formData,[\s\S]*?work_start_time: formData\.work_start_time \|\| null,[\s\S]*?work_end_time: formData\.work_end_time \|\| null[\s\S]*?\}/)
  assert.match(source, /await onUpdate\(pendingChanges\)/)
  assert.match(source, /finally \{\s*saveOwnerRef\.current = false\s*setSaving\(false\)/)
  assert.match(source, /<fieldset disabled=\{saving\} className="space-y-4">/)
  assert.match(source, /<form[^>]+aria-busy=\{saving \? 'true' : 'false'\}/)
  assert.match(source, /type="submit"[\s\S]*?disabled=\{saving\}[\s\S]*?aria-busy=\{saving \? 'true' : 'false'\}/)
  assert.match(source, /Saving day setup changes\.\.\./)
})
