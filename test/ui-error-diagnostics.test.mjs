import assert from 'node:assert/strict'
import test from 'node:test'
import { buildUiErrorDiagnostic, createUiCorrelationId } from '../src/services/uiErrorDiagnostics.js'

test('UI error diagnostics create a shareable correlation id', () => {
  const correlationId = createUiCorrelationId()

  assert.equal(typeof correlationId, 'string')
  assert.ok(correlationId.length > 0)
})

test('UI error diagnostics omit error messages and user content', () => {
  const diagnostic = buildUiErrorDiagnostic(
    new Error('sensitive form value'),
    { componentStack: '\n    at TaskForm' },
    'ui-test-id'
  )

  assert.deepEqual(diagnostic, {
    correlationId: 'ui-test-id',
    name: 'Error',
    componentStack: '\n    at TaskForm'
  })
  assert.equal(Object.hasOwn(diagnostic, 'message'), false)
})
