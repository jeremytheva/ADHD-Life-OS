import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const rewardSource = readFileSync(
  fileURLToPath(new URL('../src/components/gamification/AdaptiveRewardSuggestion.jsx', import.meta.url)),
  'utf8'
);

test('adaptive reward suggestion exposes a live named region and dismiss control without decorative icon noise', () => {
  assert.match(rewardSource, /role="region"/);
  assert.match(rewardSource, /aria-label="Reward suggestion"/);
  assert.match(rewardSource, /aria-live="polite"/);
  assert.match(rewardSource, /<button[\s\S]*?type="button"[\s\S]*?onClick=\{handleClose\}[\s\S]*?aria-label="Dismiss reward suggestion"/);
  assert.match(rewardSource, /icon=\{FiGift\}[\s\S]*?aria-hidden="true"/);
  assert.match(rewardSource, /icon=\{FiX\}[\s\S]*?aria-hidden="true"/);
  assert.match(rewardSource, /className="text-2xl" aria-hidden="true">\{suggestion\.icon\}/);
  assert.match(rewardSource, /<span aria-hidden="true">💰<\/span> \{suggestion\.cost\}/);
});

test('adaptive reward suggestions are a named list of explicit button controls', () => {
  assert.match(rewardSource, /<ul aria-label="Suggested rewards"[\s\S]*?<li key=\{index\}>/);
  assert.match(rewardSource, /<motion\.button[\s\S]*?type="button"[\s\S]*?onClick=\{\(\) => handleClaim\(suggestion\)\}/);
  assert.match(rewardSource, /<\/motion\.button>[\s\S]*?<\/li>/);
});

test('dismiss and claim restore focus to the control active before the suggestion appeared', () => {
  assert.match(rewardSource, /const previousFocusRef = useRef\(null\)/);
  assert.match(rewardSource, /previousFocusRef\.current = activeElement instanceof HTMLElement && activeElement !== document\.body/);
  assert.match(rewardSource, /const restorePreviousFocus = \(\) => \{[\s\S]*previousFocus\?\.isConnected[\s\S]*window\.requestAnimationFrame[\s\S]*previousFocus\.focus\(\)/);
  assert.match(rewardSource, /const handleClose = \(\) => \{\s*onClose\(\)\s*restorePreviousFocus\(\)\s*\}/);
  assert.match(rewardSource, /const handleClaim = \(suggestion\) => \{\s*onClaim\?\.\(suggestion\)\s*restorePreviousFocus\(\)\s*\}/);
});
