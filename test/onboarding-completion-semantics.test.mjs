import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Onboarding completion keeps decorative celebration semantics silent', async () => {
  const source = await read('src/components/onboarding/steps/CompletionStep.jsx')

  assert.match(source, /<motion\.div[\s\S]*?aria-hidden="true"[\s\S]*?<SafeIcon icon=\{FiCheckCircle\}/)
  assert.match(source, /You're All Set! <span aria-hidden="true">🚀<\/span>/)
  assert.match(source, /<span aria-hidden="true">💡<\/span> One Last Thought/)
  assert.match(source, /<button[\s\S]*?type="button"[\s\S]*?onClick=\{\(\) => onNext\(\{\}\)\}/)
  assert.match(source, /<SafeIcon icon=\{FiArrowRight\}[\s\S]*?aria-hidden="true"/)
})
