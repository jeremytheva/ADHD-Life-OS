import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Settings synchronously owns shared preference persistence and freezes conflicting controls', async () => {
  const source = await read('src/components/settings/Settings.jsx')

  assert.match(source, /const \[savingPreferences, setSavingPreferences\] = useState\(false\)/)
  assert.match(source, /const preferenceSaveOwnerRef = useRef\(false\)/)
  assert.match(source, /const handleUpdatePreferences = async \(updates\) => \{\s*if \(preferenceSaveOwnerRef\.current\)/)
  assert.match(source, /const pendingUpdates = \{ \.\.\.updates \}[\s\S]*?preferenceSaveOwnerRef\.current = true[\s\S]*?setSavingPreferences\(true\)/)
  assert.match(source, /setLastUpdates\(pendingUpdates\)[\s\S]*?await updateUserPreferences\(user, pendingUpdates\)/)
  assert.match(source, /finally \{\s*preferenceSaveOwnerRef\.current = false\s*setSavingPreferences\(false\)/)
  assert.match(source, /disabled=\{!lastUpdates \|\| savingPreferences\}/)
  assert.match(source, /<fieldset disabled=\{savingPreferences\} className="m-0 min-w-0 border-0 p-0">[\s\S]*?<DaySetup/)
  assert.match(source, /<fieldset disabled=\{savingPreferences\} className="space-y-4">[\s\S]*?id="app-theme"[\s\S]*?id="notifications"/)
  assert.match(source, /aria-busy=\{savingPreferences \? 'true' : 'false'\}/)
  assert.match(source, /Saving preferences\.\.\./)
})
