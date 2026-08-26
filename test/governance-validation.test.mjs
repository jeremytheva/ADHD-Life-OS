import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('canonical platform validation composes governance, application and browser checks', async () => {
  const packageJson = JSON.parse(await read('package.json'))
  const command = packageJson.scripts['platform:validate']

  assert.match(command, /npm audit --audit-level=moderate/)
  assert.match(command, /npm run validate:governance/)
  assert.match(command, /npm run validate/)
  assert.match(command, /npm run test:e2e/)
})

test('project continuity documents and canonical provider configuration are declared', async () => {
  const [project, status, envExample] = await Promise.all([
    read('PROJECT.md'),
    read('STATUS.md'),
    read('.env.example')
  ])

  assert.match(project, /ROADMAP\.md/)
  assert.match(project, /SYSTEM_MAP\.md/)
  assert.match(status, /Current gate/)
  assert.match(status, /Gate state/)

  for (const name of [
    'NOCODEBACKEND_AUTH_BASE_URL',
    'NOCODEBACKEND_DATA_BASE_URL',
    'NOCODEBACKEND_SECRET_KEY',
    'NOCODEBACKEND_INSTANCE'
  ]) {
    assert.match(envExample, new RegExp(`^${name}=`, 'm'))
  }
})
