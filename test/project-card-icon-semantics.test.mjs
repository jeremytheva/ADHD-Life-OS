import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const projectCardSource = readFileSync(
  fileURLToPath(new URL('../src/components/projects/ProjectCard.jsx', import.meta.url)),
  'utf8'
);

test('project card keeps its named menu trigger while hiding the decorative trigger glyph', () => {
  assert.match(projectCardSource, /aria-label=\{`Project actions for \$\{project\.title\}`\}[\s\S]*?<SafeIcon icon=\{FiMoreVertical\} className="w-5 h-5" aria-hidden="true" \/>/);
});

test('project card menu actions hide decorative glyphs while retaining visible action labels', () => {
  assert.match(projectCardSource, /<SafeIcon icon=\{action\.icon\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?\{action\.label\}/);
});

test('project card details action hides the decorative chevron while retaining its explicit name', () => {
  assert.match(projectCardSource, /aria-label=\{`View details for \$\{project\.title\}`\}[\s\S]*?<span>View Details<\/span>[\s\S]*?<SafeIcon icon=\{FiChevronRight\} className="w-4 h-4" aria-hidden="true" \/>/);
});
