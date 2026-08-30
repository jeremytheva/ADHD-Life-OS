import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('ProjectDetailView exposes overall completion as labelled progress', async () => {
  const source = await read('src/components/projects/ProjectDetailView.jsx')

  assert.match(source, /id="project-overall-progress-label">Overall Progress<\/span>/)
  assert.match(source, /role="progressbar"\s+aria-labelledby="project-overall-progress-label"/)
  assert.match(source, /aria-valuemin=\{0\}/)
  assert.match(source, /aria-valuemax=\{100\}/)
  assert.match(source, /aria-valuenow=\{Math\.round\(stats\.completion_percentage\)\}/)
})
