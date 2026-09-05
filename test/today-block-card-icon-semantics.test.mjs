import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const blockCardSource = readFileSync(
  fileURLToPath(new URL('../src/components/today/BlockCard.jsx', import.meta.url)),
  'utf8'
);

test('Today block card hides its decorative type glyph while retaining visible block text', () => {
  assert.match(
    blockCardSource,
    /<SafeIcon icon=\{getBlockIcon\(\)\} className="w-5 h-5 text-slate-600" aria-hidden="true" \/>[\s\S]*?<h3[^>]*>\{block\.label\}<\/h3>[\s\S]*?\{startTime\} - \{endTime\}/
  );
});

test('Today task block keeps its completion action named while hiding the decorative check glyph', () => {
  assert.match(
    blockCardSource,
    /aria-label=\{`Complete \$\{block\.label\}`\}[\s\S]*?<SafeIcon icon=\{FiCheck\} className="w-5 h-5" aria-hidden="true" \/>/
  );
});
