import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const celebrationSource = readFileSync(
  fileURLToPath(new URL('../src/components/common/CelebrationModal.jsx', import.meta.url)),
  'utf8'
);

test('celebration feedback is announced without exposing the decorative sparkle', () => {
  assert.match(celebrationSource, /role="status"/);
  assert.match(celebrationSource, /aria-live="polite"/);
  assert.match(celebrationSource, /aria-atomic="true"/);
  assert.match(
    celebrationSource,
    /className="text-3xl"[\s\S]*?aria-hidden="true"[\s\S]*?>\s*✨/
  );
  assert.match(celebrationSource, /<p className="font-medium">\{message\}<\/p>/);
});
