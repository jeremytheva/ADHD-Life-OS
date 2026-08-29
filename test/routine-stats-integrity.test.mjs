import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Routine Statistics keeps one semantic dialog shell across transient states', async () => {
  const source = await read('src/components/routines/RoutineStats.jsx')

  assert.match(source, /import LoadErrorState from '\.\.\/\.\.\/common\/LoadErrorState'/)
  assert.match(source, /import useModalDialog from '\.\.\/\.\.\/common\/useModalDialog'/)
  assert.match(source, /const dialogRef = useModalDialog\(\{ onEscape: onClose \}\)/)
  assert.equal((source.match(/role="dialog"/g) ?? []).length, 1)
  assert.match(source, /aria-modal="true"/)
  assert.match(source, /aria-labelledby=\{`\$\{dialogTitleId\} \$\{routineNameId\}`\}/)
  assert.match(source, /aria-busy=\{loading\}/)
  assert.match(source, /tabIndex=\{-1\}/)
  assert.match(source, /Loading statistics\.\.\./)
})

test('Routine Statistics distinguishes retrieval failure from genuine empty data and can retry', async () => {
  const source = await read('src/components/routines/RoutineStats.jsx')

  assert.match(source, /const \[loadError, setLoadError\] = useState\(false\)/)
  assert.match(source, /setLoadError\(false\)/)
  assert.match(source, /setStats\(null\)\s+setHistory\(\[\]\)\s+setLoadError\(true\)/)
  assert.match(source, /title="We couldn’t load routine statistics"/)
  assert.match(source, /onRetry=\{loadStats\}/)
  assert.match(source, /No data available yet/)
})

test('Routine Statistics controls expose explicit accessible semantics', async () => {
  const source = await read('src/components/routines/RoutineStats.jsx')

  assert.match(source, /aria-label="Close routine statistics"/)
  assert.match(source, /aria-pressed=\{timeframe === days\}/)
  assert.match(source, /aria-disabled=\{loading\}/)
  assert.match(source, /if \(loading \|\| days === timeframe\) return/)
  assert.match(source, /role="progressbar"/)
  assert.match(source, /aria-valuenow=\{completionPercent\}/)
  assert.match(source, /const completionPercent = totalSteps > 0/)
})