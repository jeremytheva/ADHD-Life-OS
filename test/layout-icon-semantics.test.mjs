import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const layoutSource = readFileSync(
  fileURLToPath(new URL('../src/components/Layout.jsx', import.meta.url)),
  'utf8'
);

test('layout hides glyphs that duplicate explicit mobile navigation control names', () => {
  assert.match(layoutSource, /aria-label="Close navigation"[\s\S]*?<SafeIcon icon=\{FiX\} className="h-5 w-5" aria-hidden="true" \/>/);
  assert.match(layoutSource, /aria-label="Open navigation"[\s\S]*?<SafeIcon icon=\{FiMenu\} className="h-6 w-6" aria-hidden="true" \/>/);
});

test('layout hides decorative navigation and account glyphs beside authoritative text', () => {
  assert.match(layoutSource, /<SafeIcon icon=\{item\.icon\} className="text-xl" aria-hidden="true" \/>[\s\S]*?<span className="font-medium">\{item\.label\}<\/span>/);
  assert.match(layoutSource, /<SafeIcon icon=\{FiEye\} className="text-xl" aria-hidden="true" \/>[\s\S]*?>Accessibility<\/span>/);
  assert.match(layoutSource, /<SafeIcon icon=\{FiUser\} aria-hidden="true" \/>[\s\S]*?\{user\?\.email\}/);
  assert.match(layoutSource, /<SafeIcon icon=\{FiLogOut\} className="text-xl" aria-hidden="true" \/>[\s\S]*?>Switch Profile<\/span>/);
});

test('layout hides decorative gamification action glyphs beside their text', () => {
  assert.match(layoutSource, /<SafeIcon icon=\{FiAward\} className="w-4 h-4 text-purple-600" aria-hidden="true" \/>[\s\S]*?Level \{stats\.level\}/);
  assert.match(layoutSource, /<SafeIcon icon=\{FiShoppingCart\} className="w-4 h-4 text-yellow-600" aria-hidden="true" \/>[\s\S]*?Reward Shop/);
});
