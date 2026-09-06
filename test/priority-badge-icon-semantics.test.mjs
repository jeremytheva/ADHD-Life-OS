import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const priorityBadgeSource = readFileSync(
  fileURLToPath(new URL('../src/components/tasks/PriorityBadge.jsx', import.meta.url)),
  'utf8'
);

test('priority badge hides its decorative icon while retaining explicit priority text', () => {
  assert.match(
    priorityBadgeSource,
    /<SafeIcon icon=\{config\.icon\} className="w-3 h-3" aria-hidden="true" \/>[\s\S]*?<span>\{config\.label\}<\/span>[\s\S]*?<span className="opacity-75">\(\{score\}\)<\/span>/
  );
});
