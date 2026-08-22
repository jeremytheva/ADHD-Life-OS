import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('shared operation error state is accessible and dismissible', async () => {
  const source = await read('src/common/OperationErrorState.jsx')

  assert.match(source, /role="alert"/)
  assert.match(source, /onClick=\{onDismiss\}/)
  assert.match(source, />\s*Dismiss\s*</)
})

test('routine mutations surface failures without closing recovery context', async () => {
  const source = await read('src/components/routines/RoutineList.jsx')

  assert.match(source, /const \[operationError, setOperationError\] = useState\(''\)/)
  assert.match(source, /Your form has been left open so you can review it and try again/)
  assert.match(source, /Your form remains open so you can try again/)
  assert.match(source, /It is still in your routine list/)
  assert.match(source, /setShowTemplates\(false\)/)
  assert.match(source, /<OperationErrorState/)
})

test('project mutations distinguish failed writes from failed post-write refreshes', async () => {
  const source = await read('src/components/projects/ProjectsList.jsx')

  assert.match(source, /const \[operationError, setOperationError\] = useState\(null\)/)
  assert.match(source, /project form is still open and your entries have not been discarded/)
  assert.match(source, /The project was created, but the project list could not refresh/)
  assert.match(source, /The project changes were saved, but the project list could not refresh/)
  assert.match(source, /The project was deleted, but the project list could not refresh/)
  assert.match(source, /The project was archived, but the project list could not refresh/)
  assert.match(source, /return true/)
  assert.match(source, /return false/)
  assert.match(source, /<OperationErrorState/)
})

test('quick capture preserves only unsaved tasks after a partial write failure', async () => {
  const listSource = await read('src/components/projects/ProjectsList.jsx')
  const modalSource = await read('src/components/projects/QuickCaptureModal.jsx')

  assert.match(listSource, /let savedCount = 0/)
  assert.match(listSource, /savedCount \+= 1/)
  assert.match(listSource, /const remainingItems = items\.slice\(savedCount\)/)
  assert.match(listSource, /Only the unsaved tasks remain in the capture window/)
  assert.match(listSource, /quickCaptureProjectId/)
  assert.match(modalSource, /const result = await onSave\(validItems\)/)
  assert.match(modalSource, /setItems\(result\.remainingItems\.length > 0 \? result\.remainingItems : \[''\]\)/)
  assert.match(modalSource, /const \[isSaving, setIsSaving\] = useState\(false\)/)
})

test('partially applied project templates are not presented as safe to retry', async () => {
  const source = await read('src/components/projects/ProjectsList.jsx')

  assert.match(source, /let createdTasks = 0/)
  assert.match(source, /let createdSubtasks = 0/)
  assert.match(source, /createdTasks \+= 1/)
  assert.match(source, /createdSubtasks \+= 1/)
  assert.match(source, /Do not apply the template again because that can duplicate the saved items/)
  assert.match(source, /setShowTemplates\(false\)/)
  assert.match(source, /setSelectedProject\(partialProject\)/)
})

test('housework mutations surface failures without optimistic data loss', async () => {
  const source = await read('src/components/housework/ChoreChecklist.jsx')

  assert.match(source, /const \[operationError, setOperationError\] = useState\(null\)/)
  assert.match(source, /It remains on your chore list and you can try again/)
  assert.match(source, /Its current due date has not been changed/)
  assert.match(source, /<OperationErrorState/)
})

test('project detail distinguishes stale detail state from a genuine empty project', async () => {
  const source = await read('src/components/projects/ProjectDetailView.jsx')

  assert.match(source, /const \[detailLoadError, setDetailLoadError\] = useState\(false\)/)
  assert.match(source, /title="We couldn’t refresh this project"/)
  assert.match(source, /shown below may be out of date/)
  assert.match(source, /onRetry=\{loadProjectDetails\}/)
  assert.match(source, /pendingTasks\.length === 0 && completedTasks\.length === 0 && !detailLoadError/)
})

test('project detail reports failed writes and partial-success refresh failures', async () => {
  const source = await read('src/components/projects/ProjectDetailView.jsx')

  assert.match(source, /task form is still open so you can review it and try again/)
  assert.match(source, /The task was saved, but the latest project details could not be reloaded/)
  assert.match(source, /It has not been confirmed as completed/)
  assert.match(source, /It remains in the project/)
  assert.match(source, /subtask may have been completed, but the latest project details could not be confirmed/)
  assert.match(source, /<OperationErrorState/)
})

test('project detail celebrations require confirmed refreshed state', async () => {
  const source = await read('src/components/projects/ProjectDetailView.jsx')

  assert.match(source, /const refreshed = await refreshAfterWrite\(/)
  assert.match(source, /if \(!refreshed\) return/)
  assert.match(source, /setCelebrationMessage\('Nice work on that step! 🎉'\)/)
  assert.match(source, /setCelebrationMessage\('Each small step you do is a quick win! ⭐'\)/)
})
