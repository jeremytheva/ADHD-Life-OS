import assert from 'node:assert/strict'
import test from 'node:test'
import {
  inspectProviderSpec,
  ProviderSpecEvidenceError
} from '../scripts/inspect-ncb-openapi.mjs'

const openApiSpec = {
  openapi: '3.1.0',
  info: { title: 'ADHD Life OS generated data API', version: '2026-08-26' },
  servers: [{ url: 'https://api.nocodebackend.com/?secret=do-not-leak' }],
  components: {
    parameters: {
      Instance: {
        name: 'Instance',
        in: 'query',
        required: true,
        schema: { type: 'string', example: 'do-not-leak' }
      }
    }
  },
  paths: {
    '/read/tasks': {
      get: {
        operationId: 'readTasks',
        tags: ['tasks'],
        parameters: [
          { $ref: '#/components/parameters/Instance' },
          { name: 'user_id', in: 'query', required: false, example: 'do-not-leak' }
        ],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { content: { 'application/json': { schema: { type: 'object' } } } },
          401: { content: { 'application/json': {} } }
        }
      }
    },
    '/create/tasks': {
      post: {
        operationId: 'createTasks',
        tags: ['tasks'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { title: 'do-not-leak' }
            }
          }
        },
        responses: { 201: { content: { 'application/json': {} } } }
      }
    },
    '/update/tasks/{id}': {
      put: {
        operationId: 'updateTasks',
        tags: ['tasks'],
        parameters: [{ name: 'id', in: 'path', required: true }],
        responses: { 200: { content: { 'application/json': {} } } }
      }
    },
    '/read/projects': {
      get: {
        operationId: 'readProjects',
        tags: ['projects'],
        responses: { 200: { content: { 'application/json': {} } } }
      }
    }
  }
}

test('inspects matching OpenAPI operations without leaking examples or query values', () => {
  const report = inspectProviderSpec({
    spec: openApiSpec,
    collection: 'tasks',
    rawText: JSON.stringify(openApiSpec)
  })

  assert.equal(report.passed, true)
  assert.equal(report.evidence_state, 'CANDIDATE_ONLY')
  assert.equal(report.application_collection, 'tasks')
  assert.equal(report.spec.format, 'openapi')
  assert.equal(report.spec.version, '3.1.0')
  assert.equal(report.spec.sha256.length, 64)
  assert.equal(report.candidate_count, 3)

  const read = report.candidates.find((candidate) => candidate.path === '/read/tasks')
  assert.ok(read)
  assert.equal(read.provider_method, 'GET')
  assert.deepEqual(read.match_signals, ['path', 'operation_id', 'tag'])
  assert.deepEqual(read.instance_parameter, { present: true, in: 'query', required: true })
  assert.deepEqual(read.ownership_parameter, { present: true, in: 'query', required: false })
  assert.deepEqual(read.security_schemes, ['bearerAuth'])
  assert.deepEqual(read.responses.statuses, ['200', '401'])
  assert.deepEqual(read.responses.content_types, ['application/json'])
  assert.deepEqual(read.servers, ['https://api.nocodebackend.com'])

  const create = report.candidates.find((candidate) => candidate.path === '/create/tasks')
  assert.deepEqual(create.request_body, { present: true, content_types: ['application/json'] })

  const serialized = JSON.stringify(report)
  assert.equal(serialized.includes('do-not-leak'), false)
})

test('supports Swagger 2 server and response metadata without inferring an application operation', () => {
  const spec = {
    swagger: '2.0',
    info: { title: 'Generated API', version: '1.0' },
    schemes: ['https'],
    host: 'api.nocodebackend.com',
    basePath: '/v1',
    consumes: ['application/json'],
    produces: ['application/json'],
    security: [{ bearer: [] }],
    paths: {
      '/read/routines': {
        get: {
          operationId: 'readRoutines',
          parameters: [{ name: 'Instance', in: 'query', required: true }],
          responses: { 200: { description: 'ok' } }
        }
      }
    }
  }

  const report = inspectProviderSpec({ spec, collection: 'routines' })
  assert.equal(report.spec.format, 'swagger')
  assert.equal(report.candidate_count, 1)
  assert.deepEqual(report.candidates[0].servers, ['https://api.nocodebackend.com/v1'])
  assert.deepEqual(report.candidates[0].responses.content_types, ['application/json'])
  assert.deepEqual(report.candidates[0].security_schemes, ['bearer'])
  assert.equal(Object.hasOwn(report.candidates[0], 'application_operation'), false)
})

test('can surface a generic path when operation metadata names the collection', () => {
  const spec = {
    openapi: '3.0.3',
    info: { title: 'Generic generated API', version: '1.0' },
    paths: {
      '/read/{table}': {
        get: {
          operationId: 'readTasks',
          tags: ['tasks'],
          parameters: [{ name: 'table', in: 'path', required: true }],
          responses: { 200: { content: { 'application/json': {} } } }
        }
      }
    }
  }

  const report = inspectProviderSpec({ spec, collection: 'tasks' })
  assert.equal(report.candidate_count, 1)
  assert.deepEqual(report.candidates[0].match_signals, ['operation_id', 'tag'])
})

test('rejects unsupported application collections before inspecting provider paths', () => {
  assert.throws(
    () => inspectProviderSpec({ spec: openApiSpec, collection: 'unknown' }),
    (error) => error instanceof ProviderSpecEvidenceError && error.code === 'NCB_SPEC_COLLECTION_INVALID'
  )
})

test('rejects a target spec with no matching collection operations', () => {
  const spec = {
    openapi: '3.0.3',
    info: { title: 'Generated API', version: '1.0' },
    paths: {
      '/read/projects': {
        get: {
          operationId: 'readProjects',
          responses: { 200: { content: { 'application/json': {} } } }
        }
      }
    }
  }

  assert.throws(
    () => inspectProviderSpec({ spec, collection: 'tasks' }),
    (error) => error instanceof ProviderSpecEvidenceError && error.code === 'NCB_SPEC_COLLECTION_NOT_FOUND'
  )
})

test('rejects JSON objects that are not OpenAPI or Swagger documents', () => {
  assert.throws(
    () => inspectProviderSpec({ spec: { paths: {} }, collection: 'tasks' }),
    (error) => error instanceof ProviderSpecEvidenceError && error.code === 'NCB_SPEC_VERSION_MISSING'
  )
})
