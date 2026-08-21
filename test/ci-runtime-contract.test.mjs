import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const workflow = await fs.readFile(new URL('../.github/workflows/pull-request-validation.yml', import.meta.url), 'utf8')

test('validation workflow uses current Node-backed GitHub actions', () => {
  assert.match(workflow, /uses: actions\/checkout@v7/)
  assert.match(workflow, /uses: actions\/setup-node@v7/)
  assert.doesNotMatch(workflow, /actions\/(?:checkout|setup-node)@v4/)
})

test('validation workflow runs the application on Node 24', () => {
  assert.match(workflow, /node-version:\s*24/)
})
