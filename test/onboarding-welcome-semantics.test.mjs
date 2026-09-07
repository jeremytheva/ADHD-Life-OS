import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Onboarding welcome keeps decorative artwork silent and action explicit', async () => {
  const source = await read('src/components/onboarding/steps/WelcomeStep.jsx')

  assert.match(source, /className="w-24 h-24[^"]*" aria-hidden="true"[\s\S]*?<SafeIcon icon=\{FiHeart\}/)
  assert.match(source, /icon=\{FiStar\}[\s\S]*?aria-hidden="true"|aria-hidden="true"[\s\S]*?icon=\{FiStar\}/)
  assert.match(source, /icon=\{FiZap\}[\s\S]*?aria-hidden="true"|aria-hidden="true"[\s\S]*?icon=\{FiZap\}/)
  assert.match(source, /icon=\{FiSmile\}[\s\S]*?aria-hidden="true"|aria-hidden="true"[\s\S]*?icon=\{FiSmile\}/)
  assert.match(source, /Life-OS! <span aria-hidden="true">🎉<\/span>/)
  assert.match(source, /Ready\? <span aria-hidden="true">🚀<\/span>/)
  assert.match(source, /<button[\s\S]*?type="button"[\s\S]*?onClick=\{\(\) => onNext\(\{\}\)\}/)
  assert.match(source, /Let's Get Started! <span aria-hidden="true">→<\/span>/)
})

test('Onboarding welcome exposes its key messages as one named list', async () => {
  const source = await read('src/components/onboarding/steps/WelcomeStep.jsx')

  assert.match(source, /<motion\.ul[\s\S]*?aria-label="What ADHD Life-OS is designed to support"/)
  assert.equal((source.match(/<li className=/g) || []).length, 3)
  assert.match(source, /ADHD is Not a Flaw/)
  assert.match(source, /Built for Your Success/)
  assert.match(source, /Treat Yourself with Kindness/)
  assert.match(source, /<\/motion\.ul>/)
})
