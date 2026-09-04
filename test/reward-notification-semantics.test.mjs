import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const rewardSource = readFileSync(
  fileURLToPath(new URL('../src/components/gamification/RewardNotification.jsx', import.meta.url)),
  'utf8'
);

test('reward feedback is announced and exposes XP progress without decorative icon noise', () => {
  assert.match(rewardSource, /role="status"/);
  assert.match(rewardSource, /aria-live="polite"/);
  assert.match(rewardSource, /aria-atomic="true"/);
  assert.match(rewardSource, /role="progressbar"/);
  assert.match(rewardSource, /aria-label=\{`Level \$\{reward\.level\} XP progress`\}/);
  assert.match(rewardSource, /aria-valuemin=\{0\}/);
  assert.match(rewardSource, /aria-valuemax=\{reward\.xp_to_next_level\}/);
  assert.match(rewardSource, /aria-valuenow=\{reward\.xp\}/);
  assert.match(rewardSource, /className="text-4xl"[\s\S]*?aria-hidden="true"[\s\S]*?>\s*🎉/);
  assert.match(rewardSource, /<span aria-hidden="true">🔥<\/span>/);
  assert.match(rewardSource, /className="text-3xl"[\s\S]*?aria-hidden="true"[\s\S]*?>\s*\{achievement\.icon\}/);
});
