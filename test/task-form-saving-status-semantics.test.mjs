import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Task Form exposes saving progress to assistive technology', async () => {
  const source = await read('src/components/tasks/TaskForm.jsx')

  assert.match(source, /<form[^>]+aria-busy=\{saving \? 'true' : 'false'\}/)
  assert.match(source, /type="submit"[\s\S]*?disabled=\{saving\}[\s\S]*?aria-busy=\{saving \? 'true' : 'false'\}/)
  assert.match(source, /className="sr-only"\s+role="status"\s+aria-live="polite"\s+aria-atomic="true"/)
  assert.match(source, /Saving task changes\.\.\./)
  assert.match(source, /saving \? 'Saving\.\.\.' : task \? 'Update' : 'Create'/)
})
