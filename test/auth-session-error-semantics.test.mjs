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
    /<div ref=\{alertRef\} role="alert" aria-atomic="true" tabIndex=\{-1\}>[\s\S]*?<h1[^>]*>We couldn't verify your session<\/h1>[\s\S]*?<p[^>]*>\{error\?\.message \|\| 'Please check your connection and try again\.'\}<\/p>[\s\S]*?<\/div>\s*<button type="button" onClick=\{onRetry\}[^>]*>Try again<\/button>/
  );
});

test('session verification failure recovers keyboard focus into the replacement error state', () => {
  assert.match(appSource, /const alertRef = useRef\(null\)/);
  assert.match(
    appSource,
    /useEffect\(\(\) => \{\s*alertRef\.current\?\.focus\(\)\s*\}, \[\]\)/
  );
});
