import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const readSource = (path) => readFileSync(
  fileURLToPath(new URL(path, import.meta.url)),
  'utf8'
);

const templateEditSource = readSource('../src/components/templates/TemplateEditModal.jsx');
const templatePreviewSource = readSource('../src/components/templates/TemplatePreview.jsx');

const decorativeTypeIconPattern = /<SafeIcon icon=\{isRoutine \? FiRefreshCw : FiCheckSquare\} className=\{`w-6 h-6 \$\{isRoutine \? 'text-purple-600' : 'text-green-600'\}`\} aria-hidden="true" \/>/;

test('template editor hides its decorative template-type icon from assistive technology', () => {
  assert.match(templateEditSource, decorativeTypeIconPattern);
});

test('template preview hides its decorative template-type icon from assistive technology', () => {
  assert.match(templatePreviewSource, decorativeTypeIconPattern);
});
