import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('secondary authenticated routes remain lazy-loaded while Today stays eager', async () => {
  const app = await read('src/App.jsx')

  assert.match(app, /import TodayView from ['"]\.\/components\/today\/TodayView['"]/)
  assert.match(app, /const TaskList = lazy\(\(\) => import\(['"]\.\/components\/tasks\/TaskList['"]\)\)/)
  assert.match(app, /const RoutineList = lazy\(\(\) => import\(['"]\.\/components\/routines\/RoutineList['"]\)\)/)
  assert.match(app, /const Projects = lazy\(\(\) => import\(['"]\.\/pages\/Projects['"]\)\)/)
  assert.match(app, /const Housework = lazy\(\(\) => import\(['"]\.\/pages\/Housework['"]\)\)/)
  assert.match(app, /const Inbox = lazy\(\(\) => import\(['"]\.\/pages\/Inbox['"]\)\)/)
  assert.match(app, /const Settings = lazy\(\(\) => import\(['"]\.\/components\/settings\/Settings['"]\)\)/)
})

test('auth and onboarding surfaces load only for the user flows that need them', async () => {
  const app = await read('src/App.jsx')

  assert.match(app, /const NCBAuth = lazy\(\(\) => import\(['"]\.\/components\/auth\/NCBAuth['"]\)\)/)
  assert.match(app, /const OnboardingFlow = lazy\(\(\) => import\(['"]\.\/components\/onboarding\/OnboardingFlow['"]\)\)/)
  assert.doesNotMatch(app, /import NCBAuth from ['"]\.\/components\/auth\/NCBAuth['"]/)
  assert.doesNotMatch(app, /import OnboardingFlow from ['"]\.\/components\/onboarding\/OnboardingFlow['"]/)
})

test('inbox service does not use a defeated dynamic taskService import', async () => {
  const inbox = await read('src/services/inboxService.js')

  assert.match(inbox, /import \{ taskService \} from ['"]\.\/taskService['"]/)
  assert.doesNotMatch(inbox, /import\(['"]\.\/taskService['"]\)/)
})
