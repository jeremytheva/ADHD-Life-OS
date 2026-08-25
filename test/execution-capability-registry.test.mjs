import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const capabilitySource = fs.readFileSync(new URL('../src/config/providerCapabilities.js', import.meta.url), 'utf8')
const repositorySource = fs.readFileSync(new URL('../src/infrastructure/nocodebackend/repositories.js', import.meta.url), 'utf8')
const handlerSource = fs.readFileSync(new URL('../api/ncb/handler.js', import.meta.url), 'utf8')

test('execution sessions remain disabled by the central provider capability', () => {
  assert.match(capabilitySource, /executionSessions:\s*false/)
})

test('production repository registration is gated by the executionSessions capability', () => {
  assert.match(repositorySource, /executionSessions:\s*isProviderCapabilityEnabled\('executionSessions'\)\s*\?\s*executionSessionRepository\s*:\s*null/)
})

test('server proxy still excludes execution-sessions before certification', () => {
  const collectionsDeclaration = handlerSource.match(/const COLLECTIONS = \[(.*?)\]/s)?.[1] || ''
  assert.doesNotMatch(collectionsDeclaration, /execution-sessions/)
})
