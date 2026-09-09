import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const projectFormSource = readFileSync(
  fileURLToPath(new URL('../src/components/projects/ProjectForm.jsx', import.meta.url)),
  'utf8'
);

test('project form close action keeps its explicit name while hiding the decorative glyph', () => {
  assert.match(
    projectFormSource,
    /aria-label="Close project form"[\s\S]*?<SafeIcon icon=\{FiX\} className="w-5 h-5" aria-hidden="true" \/>/
  );
});

test('project form submit action hides the decorative save glyph while retaining visible action text', () => {
  assert.match(
    projectFormSource,
    /<SafeIcon icon=\{FiSave\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?\{project \? 'Update' : 'Create'\} Project/
  );
});
