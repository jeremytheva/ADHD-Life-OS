import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const choreChecklistSource = readFileSync(
  fileURLToPath(new URL('../src/components/housework/ChoreChecklist.jsx', import.meta.url)),
  'utf8'
);

test('Chore Checklist hides decorative heading and status glyphs while visible text remains authoritative', () => {
  assert.match(
    choreChecklistSource,
    /<SafeIcon icon=\{FiHome\} className="w-6 h-6 text-white" aria-hidden="true" \/>[\s\S]*?<h2[^>]*>Home Chores<\/h2>/
  );
  assert.match(
    choreChecklistSource,
    /<SafeIcon icon=\{FiSun\} className="w-5 h-5 text-amber-500" aria-hidden="true" \/>Ready to Do/
  );
  assert.match(
    choreChecklistSource,
    /<SafeIcon icon=\{FiMoon\} className="w-5 h-5 text-slate-400" aria-hidden="true" \/>Upcoming/
  );
  assert.match(
    choreChecklistSource,
    /<SafeIcon icon=\{FiClock\} className="w-4 h-4" aria-hidden="true" \/><span>\{task\.estimated_duration\} min<\/span>/
  );
  assert.match(
    choreChecklistSource,
    /<SafeIcon icon=\{FiCheck\} className="w-8 h-8 text-green-600" aria-hidden="true" \/>[\s\S]*?All caught up!/
  );
});

test('Chore Checklist keeps icon-only actions named while hiding their glyphs', () => {
  assert.match(
    choreChecklistSource,
    /aria-label="Refresh chores">[\s\S]*?<SafeIcon icon=\{FiRefreshCw\} className="w-5 h-5" aria-hidden="true" \/>/
  );
  assert.match(
    choreChecklistSource,
    /aria-label=\{`Complete \$\{task\.title\}`\}>[\s\S]*?<SafeIcon icon=\{FiCheck\} className="w-5 h-5" aria-hidden="true" \/>/
  );
  assert.match(
    choreChecklistSource,
    /aria-label=\{`Move \$\{task\.title\} to tomorrow`\}>[\s\S]*?<SafeIcon icon=\{FiMoon\} className="w-4 h-4" aria-hidden="true" \/>/
  );
  assert.match(
    choreChecklistSource,
    /aria-label=\{`Open \$\{task\.title\}`\}>[\s\S]*?<SafeIcon icon=\{FiChevronRight\} className="w-5 h-5" aria-hidden="true" \/>/
  );
});
