import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const rewardShopSource = await readFile(
  new URL('../src/components/gamification/RewardShop.jsx', import.meta.url),
  'utf8'
)

test('Reward Shop rejects an already-owned reward before charging it again', () => {
  assert.match(rewardShopSource, /const purchasedRewardIdsRef = useRef\(new Set\(\)\)/)
  assert.match(rewardShopSource, /purchasedRewardIdsRef\.current = new Set\(/)
  assert.match(rewardShopSource, /availableRewards\.filter\(reward => reward\.purchased\)\.map\(reward => reward\.id\)/)
  assert.match(rewardShopSource, /if \(purchasedRewardIdsRef\.current\.has\(rewardId\)\) \{[\s\S]*?coin balance was not changed/)
  assert.match(rewardShopSource, /const result = gamificationService\.purchaseReward\(rewardId\)/)
  assert.match(rewardShopSource, /if \(result\.success\) \{\s*purchasedRewardIdsRef\.current\.add\(rewardId\)/)

  const ownershipGuard = rewardShopSource.indexOf('if (purchasedRewardIdsRef.current.has(rewardId))')
  const purchaseCall = rewardShopSource.indexOf('gamificationService.purchaseReward(rewardId)')
  assert.ok(ownershipGuard >= 0 && purchaseCall >= 0 && ownershipGuard < purchaseCall)
})
