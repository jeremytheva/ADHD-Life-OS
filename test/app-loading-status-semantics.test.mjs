import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const appSource = readFileSync(
  fileURLToPath(new URL('../src/App.jsx', import.meta.url)),
  'utf8'
);

test('shared app loading state is announced without exposing the decorative spinner', () => {
  assert.match(appSource, /role="status"/);
  assert.match(appSource, /aria-live="polite"/);
  assert.match(appSource, /aria-atomic="true"/);
  assert.match(appSource, /aria-busy="true"/);
  assert.match(
    appSource,
    /animate-spin[\s\S]*?aria-hidden="true"/
  );
  assert.match(appSource, />Loading\.\.\.<\/div>/);
});

test('the same LoadingScreen remains the shared suspense and session/onboarding fallback', () => {
  assert.match(appSource, /<Suspense fallback=\{<LoadingScreen \/>\}>/);
  assert.match(
    appSource,
    /status === AUTH_STATUS\.INITIALIZING \|\| checkingOnboarding[\s\S]*?return <LoadingScreen \/>/
  );
});
