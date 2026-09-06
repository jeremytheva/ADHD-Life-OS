import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const taskSelectorSource = readFileSync(
  fileURLToPath(new URL('../src/components/tasks/TaskSelector.jsx', import.meta.url)),
  'utf8'
)

test('task selector keeps icon-only filter controls named while hiding their glyphs', () => {
  assert.match(
    taskSelectorSource,
    /aria-label=\{showFilters \? 'Hide recommendation filters' : 'Show recommendation filters'\}[\s\S]*?<SafeIcon icon=\{FiSliders\} className="w-5 h-5" aria-hidden="true" \/>/
  )
  assert.match(
    taskSelectorSource,
    /aria-label="Hide recommendation filters"[\s\S]*?<SafeIcon icon=\{FiX\} className="w-5 h-5" aria-hidden="true" \/>/
  )
})

test('task selector hides decorative filter and recommendation icons beside semantic text', () => {
  assert.match(taskSelectorSource, /icon=\{option\.icon\}[\s\S]*?aria-hidden="true"[\s\S]*?\{option\.label\}/)
  assert.match(taskSelectorSource, /icon=\{FiZap\} className="w-4 h-4 inline mr-1" aria-hidden="true" \/>[\s\S]*?Energy Level/)
  assert.match(taskSelectorSource, /icon=\{FiClock\} className="w-4 h-4 inline mr-1" aria-hidden="true" \/>[\s\S]*?Available Time/)
  assert.match(taskSelectorSource, /icon=\{FiMapPin\} className="w-4 h-4 inline mr-1" aria-hidden="true" \/>[\s\S]*?Location \(optional\)/)
  assert.match(taskSelectorSource, /icon=\{FiHeart\} className="w-4 h-4 inline mr-1" aria-hidden="true" \/>[\s\S]*?Mood/)
  assert.match(taskSelectorSource, /icon=\{getPathIcon\(rec\.path\)\} className="w-4 h-4" aria-hidden="true" \/>/)
  assert.match(taskSelectorSource, /icon=\{FiClock\} className="w-3 h-3" aria-hidden="true" \/>[\s\S]*?time_required/)
  assert.match(taskSelectorSource, /icon=\{FiZap\} className="w-3 h-3" aria-hidden="true" \/>[\s\S]*?energy_required/)
  assert.match(taskSelectorSource, /icon=\{FiMapPin\} className="w-3 h-3" aria-hidden="true" \/>[\s\S]*?priority_metadata\.location/)
  assert.match(taskSelectorSource, /Start This Task[\s\S]*?<SafeIcon icon=\{FiChevronRight\} className="w-4 h-4" aria-hidden="true" \/>/)
  assert.match(taskSelectorSource, /<SafeIcon icon=\{FiTarget\} className="w-8 h-8 text-purple-600" aria-hidden="true" \/>[\s\S]*?No recommendations right now/)
})
