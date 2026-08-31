import test from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { adaptNcbResponse } from '../vite.config.js'

const createResponse = () => {
  const headers = new Map()
  return {
    statusCode: 200,
    body: undefined,
    setHeader(name, value) {
      headers.set(name.toLowerCase(), value)
    },
    getHeader(name) {
      return headers.get(name.toLowerCase())
    },
    end(body) {
      this.body = body
    }
  }
}

test('Vite NCB middleware adapts native responses to the handler status/json contract', () => {
  const res = adaptNcbResponse(createResponse())

  const returned = res.status(503).json({ error: { code: 'NCB_PROVIDER_CONTRACT_UNVERIFIED' } })

  assert.equal(returned, res)
  assert.equal(res.statusCode, 503)
  assert.equal(res.getHeader('Content-Type'), 'application/json; charset=utf-8')
  assert.equal(res.body, '{"error":{"code":"NCB_PROVIDER_CONTRACT_UNVERIFIED"}}')
})

test('Vite NCB middleware adapts native responses to the handler status/send contract', () => {
  const res = adaptNcbResponse(createResponse())
  const payload = Buffer.from('{"data":[]}')

  const returned = res.status(200).send(payload)

  assert.equal(returned, res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.body, payload)
})
