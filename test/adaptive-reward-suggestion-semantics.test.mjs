import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const rewardSource = readFileSync(
  fileURLToPath(new URL('../src/components/gamification/AdaptiveRewardSuggestion.jsx', import.meta.url)),
  'utf8'
);

test('adaptive reward suggestion exposes its region and dismiss control without decorative icon noise', () => {
  assert.match(rewardSource, /role="region"/);
  assert.match(rewardSource, /aria-label="Reward suggestion"/);
  assert.match(rewardSource, /<button[\s\S]*?type="button"[\s\S]*?aria-label="Dismiss reward suggestion"/);
  assert.match(rewardSource, /icon=\{FiGift\}[\s\S]*?aria-hidden="true"/);
  assert.match(rewardSource, /icon=\{FiX\}[\s\S]*?aria-hidden="true"/);
  assert.match(rewardSource, /className="text-2xl" aria-hidden="true">\{suggestion\.icon\}/);
  assert.match(rewardSource, /<span aria-hidden="true">💰<\/span> \{suggestion\.cost\}/);
});

test('adaptive reward suggestions are a named list of explicit button controls', () => {
  assert.match(rewardSource, /<ul aria-label="Suggested rewards"[\s\S]*?<li key=\{index\}>/);
  assert.match(rewardSource, /<motion\.button[\s\S]*?type="button"[\s\S]*?onClick=\{\(\) => onClaim && onClaim\(suggestion\)\}/);
  assert.match(rewardSource, /<\/motion\.button>[\s\S]*?<\/li>/);
});
