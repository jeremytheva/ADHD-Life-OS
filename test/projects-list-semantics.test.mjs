import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Projects exposes the current project collection as one labelled semantic list', async () => {
  const source = await read('src/components/projects/ProjectsList.jsx')

  assert.match(source, /role="list"/)
  assert.match(source, /aria-label="Projects"/)
  assert.match(source, /projects\.map\(\(project, index\) =>/)
  assert.match(source, /<motion\.div role="listitem" key=\{project\.id\}/)
})
