import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/projects/ProjectDetailView.jsx', import.meta.url), 'utf8')

test('Project details publish only the latest asynchronous refresh', () => {
  assert.match(source, /const latestDetailRequestRef = useRef\(0\)/)
  assert.match(source, /const requestId = latestDetailRequestRef\.current \+ 1/)
  assert.match(source, /latestDetailRequestRef\.current = requestId/)
  assert.match(source, /if \(requestId !== latestDetailRequestRef\.current\) return true/)
  assert.match(source, /if \(requestId === latestDetailRequestRef\.current\) \{\s*setDetailsLoading\(false\)/)
})

test('stale detail refreshes cannot publish project, stats, or load errors', () => {
  const staleGuardIndex = source.indexOf('if (requestId !== latestDetailRequestRef.current) return true')
  const projectIndex = source.indexOf('setProject(updatedProject)')
  const statsIndex = source.indexOf('setStats(projectStats)')

  assert.ok(staleGuardIndex > -1, 'expected a stale-request guard')
  assert.ok(projectIndex > staleGuardIndex, 'project details must publish only after the stale-request guard')
  assert.ok(statsIndex > staleGuardIndex, 'project stats must publish only after the stale-request guard')

  const catchBlock = source.match(/catch \(error\) \{([\s\S]*?)\n\s{4}\} finally/)
  assert.ok(catchBlock, 'expected loadProjectDetails catch block')
  assert.match(catchBlock[1], /if \(requestId !== latestDetailRequestRef\.current\) return true/)
  assert.match(catchBlock[1], /setDetailLoadError\(true\)/)
})
