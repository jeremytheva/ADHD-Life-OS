import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const profileSource = readFileSync(
  fileURLToPath(new URL('../src/components/auth/ProfileSelector.jsx', import.meta.url)),
  'utf8'
);

test('development profile failures use the shared recoverable alert state', () => {
  assert.match(
    profileSource,
    /<OperationErrorState message=\{error\} onDismiss=\{\(\) => setError\(''\)\} \/>/
  );
});

test('only the profile being switched exposes busy and live status semantics', () => {
  assert.match(profileSource, /const \[loadingEmail, setLoadingEmail\] = useState\(null\)/);
  assert.match(profileSource, /const isLoading = loadingEmail === profile\.email/);
  assert.match(profileSource, /aria-busy=\{isLoading\}/);
  assert.match(
    profileSource,
    /\{isLoading && \([\s\S]*?role="status" aria-live="polite"[\s\S]*?Switching to \{profile\.name\}/
  );
});

test('current profile and decorative glyph semantics are explicit', () => {
  assert.match(profileSource, /aria-current=\{isActive \? 'true' : undefined\}/);
  assert.match(profileSource, /\{isActive && <span className="sr-only">Current profile<\/span>\}/);
  assert.match(profileSource, /<SafeIcon icon=\{profile\.icon\}[^>]*aria-hidden="true" \/>/);
  assert.match(profileSource, /<SafeIcon icon=\{FiAlertCircle\}[^>]*aria-hidden="true" \/>/);
});

test('development copy reflects the configured remote auth boundary', () => {
  assert.doesNotMatch(profileSource, /No Backend Required|Works entirely in your browser/);
  assert.match(profileSource, /Profile switching uses the configured NoCodeBackend authentication boundary/);
  assert.match(profileSource, /Available only in the Vite development build/);
});