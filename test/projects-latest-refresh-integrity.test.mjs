import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/projects/ProjectsList.jsx', import.meta.url), 'utf8')

test('Projects publishes only the latest asynchronous refresh', () => {
  assert.match(source, /const latestProjectsRequestRef = useRef\(0\)/)
  assert.match(source, /const requestId = latestProjectsRequestRef\.current \+ 1/)
  assert.match(source, /latestProjectsRequestRef\.current = requestId/)
  assert.match(source, /if \(requestId !== latestProjectsRequestRef\.current\) return true/)
  assert.match(source, /if \(requestId === latestProjectsRequestRef\.current\) \{\s*setLoading\(false\)/)
})

test('stale project refreshes cannot publish projects, stats, quick capture identity, or errors', () => {
  const staleGuardIndex = source.indexOf('if (requestId !== latestProjectsRequestRef.current) return true')
  const projectsIndex = source.indexOf('setProjects(filteredData)')
  const statsIndex = source.indexOf('setProjectStats(stats)')
  const quickCaptureIndex = source.indexOf("setQuickCaptureProjectId(quickCaptureProject?.id || null)")

  assert.ok(staleGuardIndex > -1, 'expected a stale-request guard')
  assert.ok(projectsIndex > staleGuardIndex, 'projects must publish only after the stale-request guard')
  assert.ok(statsIndex > staleGuardIndex, 'project stats must publish only after the stale-request guard')
  assert.ok(quickCaptureIndex > staleGuardIndex, 'Quick Capture identity must publish only after the stale-request guard')

  const catchBlock = source.match(/catch \(error\) \{([\s\S]*?)\n\s{4}\} finally/)
  assert.ok(catchBlock, 'expected loadProjects catch block')
  assert.match(catchBlock[1], /if \(requestId !== latestProjectsRequestRef\.current\) return true/)
  assert.match(catchBlock[1], /setLoadError\(error\)/)
})
