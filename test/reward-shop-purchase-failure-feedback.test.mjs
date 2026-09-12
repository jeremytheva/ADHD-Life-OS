import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const rewardShopSource = readFileSync(
  fileURLToPath(new URL('../src/components/gamification/RewardShop.jsx', import.meta.url)),
  'utf8'
)

test('reward purchase failures use recoverable in-dialog feedback instead of a blocking browser alert', () => {
  assert.match(rewardShopSource, /import OperationErrorState from '\.\.\/\.\.\/common\/OperationErrorState'/)
  assert.match(rewardShopSource, /const \[purchaseError, setPurchaseError\] = useState\(''\)/)
  assert.match(rewardShopSource, /setPurchaseError\(result\.message \|\| 'This reward could not be purchased\. Please try again\.'\)/)
  assert.match(rewardShopSource, /<OperationErrorState[\s\S]*?message=\{purchaseError\}[\s\S]*?onDismiss=\{\(\) => setPurchaseError\(''\)\}/)
  assert.doesNotMatch(rewardShopSource, /\balert\s*\(/)
})

test('a new purchase attempt clears stale failure feedback before ownership and purchase evaluation', () => {
  assert.match(rewardShopSource, /const handlePurchase = \(rewardId\) => \{\s*setPurchaseError\(''\)/)

  const clearError = rewardShopSource.indexOf("setPurchaseError('')", rewardShopSource.indexOf('const handlePurchase'))
  const ownershipGuard = rewardShopSource.indexOf('if (purchasedRewardIdsRef.current.has(rewardId))')
  const purchaseCall = rewardShopSource.indexOf('gamificationService.purchaseReward(rewardId)')
  assert.ok(clearError >= 0 && ownershipGuard > clearError && purchaseCall > ownershipGuard)
})
