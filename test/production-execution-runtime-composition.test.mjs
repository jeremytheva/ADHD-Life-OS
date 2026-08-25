import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import { providerCapabilities } from '../src/config/providerCapabilities.js'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('generic execution persistence remains disabled at the provider capability boundary', () => {
  assert.equal(providerCapabilities.executionSessions, false)
})

test('production runtime composition fails closed when the execution-session repository is unavailable', async () => {
  const source = await read('src/services/productionExecutionRuntime.js')
  assert.match(source, /repositories\.executionSessions/)
  assert.match(source, /if \(!executionSessionRepository\) return createExecutionRuntime\(\)/)
  assert.match(source, /createExecutionSessionService\(executionSessionRepository\)/)
  assert.match(source, /createExecutionCompletionService/)
  assert.match(source, /createExecutionCoordinator/)
  assert.match(source, /createExecutionRuntime\(\{ coordinator \}\)/)
})

test('Today injects the gated production runtime without bypassing NextActionPanel availability checks', async () => {
  const today = await read('src/components/today/TodayView.jsx')
  const panel = await read('src/components/today/NextActionPanel.jsx')

  assert.match(today, /productionExecutionRuntime/)
  assert.match(today, /executionRuntime=\{productionExecutionRuntime\}/)
  assert.match(today, /userId=\{user\?\.id \|\| null\}/)
  assert.match(panel, /executionRuntime\?\.available && userId/)
  assert.match(panel, /runtimeAvailable && executionState\?\.presentation/)
})

test('routine execution entry stays a UI navigation concern', async () => {
  const runtime = await read('src/services/productionExecutionRuntime.js')
  const panel = await read('src/components/today/NextActionPanel.jsx')

  assert.match(runtime, /path: '\/routines'/)
  assert.match(panel, /useNavigate/)
  assert.match(panel, /outcome\?\.status === 'routed'/)
  assert.match(panel, /navigate\(outcome\.routine\.path/)
})
