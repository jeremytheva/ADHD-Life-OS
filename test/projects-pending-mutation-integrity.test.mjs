import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const listSource = await readFile(new URL('../src/components/projects/ProjectsList.jsx', import.meta.url), 'utf8')
const cardSource = await readFile(new URL('../src/components/projects/ProjectCard.jsx', import.meta.url), 'utf8')

test('Projects serializes parent-level mutations and exposes the pending lock', () => {
  assert.match(listSource, /const \[pendingAction, setPendingAction\] = useState\(null\)/)
  assert.match(listSource, /const mutationPending = Boolean\(pendingAction\)/)
  assert.match(listSource, /aria-busy=\{loading \|\| mutationPending\}/)
  assert.match(listSource, /Updating projects\.\.\./)

  assert.match(listSource, /const handleCreateProject = async \(projectData\) => \{\s*if \(pendingAction\) return/)
  assert.match(listSource, /const handleUpdateProject = async \(projectData\) => \{\s*if \(pendingAction \|\| !editingProject\) return/)
  assert.match(listSource, /const handleDeleteProject = async \(projectId\) => \{\s*if \(pendingAction\) return/)
  assert.match(listSource, /const handleArchiveProject = async \(projectId\) => \{\s*if \(pendingAction\) return/)
  assert.match(listSource, /const handleApplyTemplate = async \(template, type\) => \{\s*if \(type !== 'project' \|\| pendingAction\) return/)
  assert.match(listSource, /const handleQuickCapture = async \(items\) => \{\s*if \(pendingAction\) return/)
})

test('Projects disables mutation launchers and project action menus while another write owns persistence', () => {
  const disabledLaunchers = listSource.match(/disabled=\{mutationPending\}/g) ?? []
  assert.ok(disabledLaunchers.length >= 6)
  assert.match(listSource, /<ProjectCard[\s\S]*?pending=\{mutationPending\}[\s\S]*?\/>/)

  assert.match(cardSource, /pending = false/)
  assert.match(cardSource, /disabled=\{pending\}/)
  assert.match(cardSource, /\{showMenu && !pending && \(/)
  assert.match(cardSource, /if \(pending && showMenu\) setShowMenu\(false\)/)
})

test('Projects keeps read-only view switching and detail navigation available during persistence', () => {
  assert.match(listSource, /onClick=\{\(\) => setViewMode\('grid'\)\}/)
  assert.match(listSource, /onClick=\{\(\) => setViewMode\('list'\)\}/)
  assert.match(cardSource, /aria-label=\{`View details for \$\{project\.title\}`\}/)
  assert.doesNotMatch(cardSource, /aria-label=\{`View details for \$\{project\.title\}`\}[\s\S]{0,200}disabled=\{pending\}/)
})
