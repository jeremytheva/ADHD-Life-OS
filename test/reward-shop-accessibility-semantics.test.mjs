import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const rewardShopSource = readFileSync(
  fileURLToPath(new URL('../src/components/gamification/RewardShop.jsx', import.meta.url)),
  'utf8'
)

test('reward shop hides decorative glyphs when visible text or control names carry the meaning', () => {
  assert.match(rewardShopSource, /<SafeIcon icon=\{FiShoppingCart\} className="w-6 h-6" aria-hidden="true" \/>/)
  assert.match(rewardShopSource, /aria-label="Close Reward Shop"[\s\S]*?<SafeIcon icon=\{FiX\} className="w-6 h-6" aria-hidden="true" \/>/)
  assert.match(rewardShopSource, /<SafeIcon icon=\{cat\.icon\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?\{cat\.label\}/)
  assert.match(rewardShopSource, /<div className="text-5xl mb-2" aria-hidden="true">\{reward\.icon\}<\/div>[\s\S]*?\{reward\.name\}[\s\S]*?\{reward\.description\}/)
  assert.match(rewardShopSource, /<SafeIcon icon=\{FiCheck\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?Owned/)
  assert.match(rewardShopSource, /<SafeIcon icon=\{FiLock\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?Locked/)
  assert.match(rewardShopSource, /<span aria-hidden="true">💰<\/span> \{currency\.coins\} coins/)
  assert.match(rewardShopSource, /<span aria-hidden="true">💰<\/span> \{reward\.cost\}/)
})

test('reward shop exposes purchase success as an atomic polite status', () => {
  assert.match(rewardShopSource, /\{purchaseSuccess && \([\s\S]*?role="status"[\s\S]*?aria-live="polite"[\s\S]*?aria-atomic="true"/)
  assert.match(rewardShopSource, /<SafeIcon icon=\{FiCheck\} className="w-6 h-6" aria-hidden="true" \/>[\s\S]*?\{purchaseSuccess\.message\}[\s\S]*?\{purchaseSuccess\.remaining_coins\} coins remaining/)
})
