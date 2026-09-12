import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const source = readFileSync(
  fileURLToPath(new URL('../src/components/projects/ProjectsList.jsx', import.meta.url)),
  'utf8'
)

const handlerSource = (name, nextName) => {
  const start = source.indexOf(`const ${name} =`)
  const end = source.indexOf(`const ${nextName} =`, start)
  assert.notEqual(start, -1, `${name} should exist`)
  assert.notEqual(end, -1, `${nextName} should follow ${name}`)
  return source.slice(start, end)
}

test('projects use one synchronous owner across persistence mutations', () => {
  assert.match(source, /const mutationOwnerRef = useRef\(null\)/)

  const quickCapture = handlerSource('handleQuickCapture', 'handleCreateProject')
  assert.match(quickCapture, /if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(quickCapture, /mutationOwnerRef\.current = mutationOwner[\s\S]*setPendingAction\('quick-capture'\)[\s\S]*await projectService\.(createProject|createTask)/)
  assert.match(quickCapture, /if \(mutationOwnerRef\.current === mutationOwner\) \{\s*mutationOwnerRef\.current = null\s*setPendingAction\(null\)/)

  const create = handlerSource('handleCreateProject', 'handleUpdateProject')
  assert.match(create, /if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(create, /mutationOwnerRef\.current = mutationOwner[\s\S]*setPendingAction\('create'\)[\s\S]*await projectService\.createProject/)
  assert.match(create, /const acceptedProjectData = \{ \.\.\.projectData \}/)

  const update = handlerSource('handleUpdateProject', 'handleDeleteProject')
  assert.match(update, /if \(mutationOwnerRef\.current !== null \|\| !editingProject\) return/)
  assert.match(update, /const projectId = editingProject\.id[\s\S]*mutationOwnerRef\.current = mutationOwner[\s\S]*await projectService\.updateProject\(projectId, acceptedProjectData\)/)

  const deleteProject = handlerSource('handleDeleteProject', 'handleArchiveProject')
  assert.match(deleteProject, /if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(deleteProject, /if \(!window\.confirm[\s\S]*mutationOwnerRef\.current = mutationOwner[\s\S]*await projectService\.deleteProject\(projectId\)/)

  const archive = handlerSource('handleArchiveProject', 'handleEditProject')
  assert.match(archive, /if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(archive, /mutationOwnerRef\.current = mutationOwner[\s\S]*await projectService\.updateProject\(projectId, \{ status: 'archived' \}\)/)

  const template = source.slice(source.indexOf('const handleApplyTemplate ='), source.indexOf('const getTotalStats ='))
  assert.match(template, /if \(type !== 'project' \|\| mutationOwnerRef\.current !== null\) return/)
  assert.match(template, /mutationOwnerRef\.current = mutationOwner[\s\S]*setPendingAction\('template'\)[\s\S]*await projectService\.createProject/)
})

test('project modal and selection paths respect synchronous mutation ownership', () => {
  assert.match(source, /const handleEditProject = \(project\) => \{\s*if \(mutationOwnerRef\.current !== null\) return/)
  assert.match(source, /QuickCaptureModal[\s\S]*onCancel=\{\(\) => \{ if \(mutationOwnerRef\.current !== null\) return; setShowQuickCapture\(false\) \}\}/)
  assert.match(source, /ProjectForm[\s\S]*onCancel=\{\(\) => \{ if \(mutationOwnerRef\.current !== null\) return; setShowForm\(false\); setEditingProject\(null\) \}\}/)
  assert.match(source, /TemplateLibrary[\s\S]*onClose=\{\(\) => \{ if \(mutationOwnerRef\.current !== null\) return; setShowTemplates\(false\) \}\}/)
})
