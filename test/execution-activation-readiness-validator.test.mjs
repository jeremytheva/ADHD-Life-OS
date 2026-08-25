import test from 'node:test'
import assert from 'node:assert/strict'
import { validateExecutionCertificationEvidence } from '../scripts/verify-execution-activation-readiness.mjs'

const validEvidence = {
  status: 'pass',
  collection: 'execution-sessions',
  mode: 'read-write',
  expected_fields: [
    'id',
    'user_id',
    'activity_id',
    'activity_type',
    'source_id',
    'source_parent_id',
    'title_snapshot',
    'status',
    'started_at'
  ],
  read: { status: 'pass', records: 0 },
  create: { status: 'pass', record_id: 'session-1' },
  update: { status: 'pass', record_id: 'session-1' },
  cleanup: { status: 'pass', record_id: 'session-1' }
}

test('activation evidence requires successful execution-session read/create/update certification', () => {
  const result = validateExecutionCertificationEvidence(validEvidence)
  assert.equal(result.certified, true)
  assert.equal(result.required_fields_verified, true)
})

test('read-only provider evidence cannot authorize activation', () => {
  assert.throws(
    () => validateExecutionCertificationEvidence({ ...validEvidence, mode: 'read-only' }),
    /read\/write verification/
  )
})

test('evidence for another collection cannot authorize execution activation', () => {
  assert.throws(
    () => validateExecutionCertificationEvidence({ ...validEvidence, collection: 'tasks' }),
    /not for execution-sessions/
  )
})

test('required field evidence is mandatory', () => {
  const evidence = {
    ...validEvidence,
    expected_fields: validEvidence.expected_fields.filter((field) => field !== 'title_snapshot')
  }
  assert.throws(
    () => validateExecutionCertificationEvidence(evidence),
    /title_snapshot/
  )
})

test('failed create or update evidence cannot authorize activation', () => {
  assert.throws(
    () => validateExecutionCertificationEvidence({ ...validEvidence, create: { status: 'fail' } }),
    /create did not pass/
  )
  assert.throws(
    () => validateExecutionCertificationEvidence({ ...validEvidence, update: { status: 'fail' } }),
    /update did not pass/
  )
})
