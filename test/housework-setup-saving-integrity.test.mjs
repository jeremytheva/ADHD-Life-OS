import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Housework setup owns an unresolved multi-chore save synchronously', async () => {
  const source = await read('src/components/housework/HouseworkSetup.jsx')

  assert.match(source, /import React, \{ useRef, useState \} from 'react'/)
  assert.match(source, /const saveInFlightRef = useRef\(false\)/)
  assert.match(source, /const handleClose = \(\) => \{[\s\S]*?if \(saveInFlightRef\.current \|\| saving\) return[\s\S]*?onClose\(\)/)
  assert.match(source, /onEscape: handleClose/)
  assert.match(source, /const handleToggleTask = \(templateId\) => \{[\s\S]*?if \(saveInFlightRef\.current \|\| saving\) return/)
  assert.match(source, /const handleSelectStarterSet = \(\) => \{[\s\S]*?if \(saveInFlightRef\.current \|\| saving\) return/)
  assert.match(source, /const handleSave = async \(\) => \{[\s\S]*?if \(saveInFlightRef\.current \|\| saving \|\| selectedTasks\.size === 0\) return[\s\S]*?saveInFlightRef\.current = true[\s\S]*?setSaving\(true\)/)
  assert.match(source, /const selectedIndexes = Array\.from\(selectedTasks\)/)
  assert.match(source, /for \(const index of selectedIndexes\) \{[\s\S]*?await houseworkService\.createHouseworkTask/)
  assert.match(source, /savedCount \+= 1[\s\S]*?next\.delete\(index\)/)
  assert.match(source, /Only the unsaved chores remain selected, so retrying will not duplicate the saved chores\./)
  assert.match(source, /finally \{[\s\S]*?saveInFlightRef\.current = false[\s\S]*?setSaving\(false\)/)
  assert.match(source, /onClick=\{handleClose\}[\s\S]*?disabled=\{saving\}/)
})
