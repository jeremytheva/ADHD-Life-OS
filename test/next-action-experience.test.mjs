import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Today exposes the unified next-action experience before the timeline', async () => {
  const source = await read('src/components/today/TodayView.jsx')
  assert.match(source, /import NextActionPanel from '\.\/NextActionPanel'/)
  assert.match(source, /<NextActionPanel currentMode=\{currentMode\} \/>/)
})

test('next-action panel captures low-friction execution state and uses the execution engine', async () => {
  const source = await read('src/components/today/NextActionPanel.jsx')
  assert.match(source, /executionEngine\.getNextActions/)
  assert.match(source, /current_energy: energy/)
  assert.match(source, /available_time: availableTime/)
  assert.match(source, /current_location: location/)
  assert.match(source, /aria-label="Energy now"/)
  assert.match(source, /aria-label="Time available"/)
})

test('next-action fit controls use defaults with progressive disclosure', async () => {
  const source = await read('src/components/today/NextActionPanel.jsx')
  assert.match(source, /const \[energy, setEnergy\] = useState\('medium'\)/)
  assert.match(source, /const \[availableTime, setAvailableTime\] = useState\(15\)/)
  assert.match(source, /const \[showFitControls, setShowFitControls\] = useState\(false\)/)
  assert.match(source, /Current fit/)
  assert.match(source, /aria-expanded=\{showFitControls\}/)
  assert.match(source, /aria-controls="next-action-fit-controls"/)
  assert.match(source, /showFitControls \? 'Hide fit options' : 'Adjust fit'/)
  assert.match(source, /showFitControls && \(/)
  assert.match(source, /id="next-action-fit-controls"/)
})

test('next-action panel presents initiation guidance and bounded alternatives', async () => {
  const source = await read('src/components/today/NextActionPanel.jsx')
  assert.match(source, /What should I do now\?/)
  assert.match(source, /Start with this/)
  assert.match(source, /selected\.start_action/)
  assert.match(source, /Give me another option/)
  assert.match(source, /recommendations\.length > 1/)
})

test('next-action panel progressively discloses the manual refresh control', async () => {
  const source = await read('src/components/today/NextActionPanel.jsx')
  assert.match(source, /<details className="mt-3 text-sm text-slate-600">/)
  assert.match(source, /<summary[^>]*>More options<\/summary>/)
  assert.match(source, />\s*Recheck now\s*</)
  assert.match(source, /onClick=\{refreshRecommendationsWithFocusRecovery\}/)
})

test('next-action panel treats not-now feedback as transient recommendation state', async () => {
  const source = await read('src/components/today/NextActionPanel.jsx')
  assert.match(source, /const \[excludedActivityIds, setExcludedActivityIds\] = useState\(\[\]\)/)
  assert.match(source, /excludeActivityIds: excludedActivityIds/)
  assert.match(source, />\s*Not now\s*</)
  assert.match(source, /Nothing was changed/)
  assert.match(source, /Bring skipped options back/)
  assert.doesNotMatch(source, /localStorage|sessionStorage|upsertActivity|updateTask/)
})

test('next-action refresh paths restore focus to the resulting recommendation state', async () => {
  const source = await read('src/components/today/NextActionPanel.jsx')
  assert.match(source, /shouldRestoreFocusAfterLoadRef = useRef\(false\)/)
  assert.match(source, /const refreshRecommendationsWithFocusRecovery = \(\) => \{[\s\S]*?shouldRestoreFocusAfterLoadRef\.current = true[\s\S]*?loadRecommendations\(\)[\s\S]*?\}/)
  assert.match(source, /const markNotNow = \(\) => \{[\s\S]*?shouldRestoreFocusAfterLoadRef\.current = true/)
  assert.match(source, /recommendationHeadingRef\.current/)
  assert.match(source, /emptyStateHeadingRef\.current \|\| panelHeadingRef\.current/)
  assert.match(source, /focusTarget\?\.focus\(\)/)
  assert.match(source, /ref=\{recommendationHeadingRef\} tabIndex="-1"/)
  assert.match(source, /ref=\{emptyStateHeadingRef\} tabIndex="-1"/)
})

test('next-action retrieval failures remain retryable with focus recovery and do not imply activity loss', async () => {
  const source = await read('src/components/today/NextActionPanel.jsx')
  assert.match(source, /title="We couldn’t choose a next action"/)
  assert.match(source, /Your activities have not changed/)
  assert.match(source, /onRetry=\{refreshRecommendationsWithFocusRecovery\}/)
})

test('next-action panel ignores stale async loads after fit or mode state changes', async () => {
  const source = await read('src/components/today/NextActionPanel.jsx')

  assert.match(source, /const latestRequestRef = useRef\(0\)/)
  assert.match(source, /const requestId = latestRequestRef\.current \+ 1\s+latestRequestRef\.current = requestId/)
  assert.equal((source.match(/requestId !== latestRequestRef\.current/g) || []).length >= 2, true)
  assert.match(source, /if \(requestId === latestRequestRef\.current\) \{\s+setLoading\(false\)\s+\}/)
  assert.match(
    source,
    /const next = await executionEngine\.getNextActions\([\s\S]*?\)\s+\s*if \(requestId !== latestRequestRef\.current\) return\s+\s*setResult\(next\)/
  )
})

test('Today keeps unscheduled task details secondary to the primary execution surface', async () => {
  const source = await read('src/components/today/TodayView.jsx')
  assert.match(source, /const \[showUnscheduledTasks, setShowUnscheduledTasks\] = useState\(false\)/)
  assert.match(source, /aria-expanded=\{showUnscheduledTasks\}/)
  assert.match(source, /aria-controls="today-unscheduled-task-details"/)
  assert.match(source, /Review unscheduled tasks/)
  assert.match(source, /showUnscheduledTasks && \(/)
  assert.match(source, /id="today-unscheduled-task-details"/)
  assert.match(source, /setShowUnscheduledTasks\(false\)/)
  assert.match(source, /const DEFAULT_UNSCHEDULED_LIMIT = 3/)
  assert.match(source, /showAllUnscheduled \? 'Show less' : `Show \$\{hiddenUnscheduledCount\} more`/)
})
