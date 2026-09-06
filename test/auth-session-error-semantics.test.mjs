import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const appSource = readFileSync(
  fileURLToPath(new URL('../src/App.jsx', import.meta.url)),
  'utf8'
);

test('session verification failures are announced atomically while retry remains a separate action', () => {
  assert.match(
    appSource,
    /<div role="alert" aria-atomic="true">[\s\S]*?<h1[^>]*>We couldn't verify your session<\/h1>[\s\S]*?<p[^>]*>\{error\?\.message \|\| 'Please check your connection and try again\.'\}<\/p>[\s\S]*?<\/div>\s*<button type="button" onClick=\{onRetry\}[^>]*>Try again<\/button>/
  );
});
