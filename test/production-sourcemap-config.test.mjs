import assert from 'node:assert/strict'
import test from 'node:test'
import viteConfig from '../vite.config.js'

const resolveConfig = async () => {
  const config = typeof viteConfig === 'function'
    ? await viteConfig({ command: 'build', mode: 'production', isSsrBuild: false, isPreview: false })
    : viteConfig
  return config
}

test('production source maps are disabled by default', async () => {
  const previous = process.env.ENABLE_PRODUCTION_SOURCEMAPS
  delete process.env.ENABLE_PRODUCTION_SOURCEMAPS
  try {
    const config = await resolveConfig()
    assert.equal(config.build.sourcemap, false)
  } finally {
    if (previous === undefined) delete process.env.ENABLE_PRODUCTION_SOURCEMAPS
    else process.env.ENABLE_PRODUCTION_SOURCEMAPS = previous
  }
})

test('production source maps require the explicit true override', async () => {
  const previous = process.env.ENABLE_PRODUCTION_SOURCEMAPS
  process.env.ENABLE_PRODUCTION_SOURCEMAPS = 'true'
  try {
    const config = await resolveConfig()
    assert.equal(config.build.sourcemap, true)
  } finally {
    if (previous === undefined) delete process.env.ENABLE_PRODUCTION_SOURCEMAPS
    else process.env.ENABLE_PRODUCTION_SOURCEMAPS = previous
  }
})
