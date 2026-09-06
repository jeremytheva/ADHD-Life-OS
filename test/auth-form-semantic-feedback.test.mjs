import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const authSource = readFileSync(
  fileURLToPath(new URL('../src/components/auth/NCBAuth.jsx', import.meta.url)),
  'utf8'
);

test('authentication failures are announced atomically without exposing the decorative alert glyph', () => {
  assert.match(
    authSource,
    /className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"\s+role="alert"\s+aria-atomic="true"[\s\S]*?<SafeIcon icon=\{FiAlertCircle\} className="flex-shrink-0" aria-hidden="true" \/>[\s\S]*?\{error\}/
  );
});

test('auth field and submit glyphs remain presentation-only beside explicit labels', () => {
  assert.match(
    authSource,
    /<label htmlFor="auth-email"[\s\S]*?>\s*Email\s*<\/label>[\s\S]*?<SafeIcon icon=\{FiMail\}[^>]*aria-hidden="true" \/>[\s\S]*?id="auth-email"/
  );
  assert.match(
    authSource,
    /<label htmlFor="auth-password"[\s\S]*?>\s*Password\s*<\/label>[\s\S]*?<SafeIcon icon=\{FiLock\}[^>]*aria-hidden="true" \/>[\s\S]*?id="auth-password"/
  );
  assert.match(
    authSource,
    /<SafeIcon icon=\{isRegister \? FiUserPlus : FiLogIn\} aria-hidden="true" \/>[\s\S]*?\{copy\.submitLabel\}/
  );
});
