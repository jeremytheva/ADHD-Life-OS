import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const panelPath = new URL('../src/components/today/NextActionPanel.jsx', import.meta.url)
const todayPath = new URL('../src/components/today/TodayView.jsx', import.meta.url)

test('NextActionPanel keeps execution runtime optional and fail-closed', async () => {
  const source = await readFile(panelPath, 'utf8')
  assert.match(source, /executionRuntime = null/)
  assert.match(source, /runtimeAvailable = Boolean\(executionRuntime\?\.available && userId\)/)
  assert.match(source, /runtimeAvailable && executionState\?\.presentation/)
  assert.match(source, /selected\?\.activity \|\| null/)
})

test('production Today does not inject an execution runtime before provider verification', async () => {
  const source = await readFile(todayPath, 'utf8')
  assert.match(source, /<NextActionPanel currentMode=\{currentMode\} \/>/)
  assert.doesNotMatch(source, /executionRuntime=/)
})

test('runtime-backed mutations are serialized by the panel', async () => {
  const source = await readFile(panelPath, 'utf8')
  assert.match(source, /if \(!runtimeAvailable \|\| executionBusy\) return/)
  assert.match(source, /setExecutionBusy\(true\)/)
  assert.match(source, /setExecutionBusy\(false\)/)
})
