import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcRoot = path.join(root, 'src')

const sourceFiles = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(entryPath)
    return /\.(?:js|jsx|ts|tsx)$/.test(entry.name) ? [entryPath] : []
  }))
  return nested.flat()
}

test('SafeIcon stays tree-shakeable and callers use explicit icon components', async () => {
  const safeIconPath = path.join(srcRoot, 'common', 'SafeIcon.jsx')
  const safeIcon = await fs.readFile(safeIconPath, 'utf8')

  assert.doesNotMatch(safeIcon, /import\s+\*\s+as\s+FiIcons/)
  assert.doesNotMatch(safeIcon, /FiIcons\s*\[/)

  const violations = []
  for (const file of await sourceFiles(srcRoot)) {
    const source = await fs.readFile(file, 'utf8')
    if (/<SafeIcon\b[^>]*\bname\s*=/s.test(source)) {
      violations.push(path.relative(root, file))
    }
  }

  assert.deepEqual(violations, [], `SafeIcon name-based callers prevent icon tree-shaking: ${violations.join(', ')}`)
})
