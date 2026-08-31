import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { createNcbHandler } from './api/ncb/handler.js'

const repositoryRoot = path.dirname(fileURLToPath(import.meta.url))

export const adaptNcbResponse = (res) => {
  res.status = (statusCode) => {
    res.statusCode = statusCode
    return res
  }
  res.json = (body) => {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
    }
    res.end(JSON.stringify(body))
    return res
  }
  res.send = (body) => {
    res.end(body)
    return res
  }
  return res
}

const ncbApiPlugin = () => ({
  name: 'ncb-api-contracts',
  configureServer(server) {
    for (const scope of ['auth', 'data']) {
      const handler = createNcbHandler(scope)
      server.middlewares.use(`/api/ncb/${scope}`, async (req, res) => {
        const url = new URL(req.url, 'http://vite.local')
        req.query = {}
        url.searchParams.forEach((value, key) => {
          req.query[key] = req.query[key] === undefined ? value : [].concat(req.query[key], value)
        })
        req.query.path = url.pathname.split('/').filter(Boolean)
        return handler(req, adaptNcbResponse(res))
      })
    }
  }
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // The development middleware invokes the production handlers directly, so
  // credentials remain server-only and route validation is identical.
  for (const name of [
    'NOCODEBACKEND_AUTH_BASE_URL',
    'NOCODEBACKEND_DATA_BASE_URL',
    'NOCODEBACKEND_SECRET_KEY',
    'NOCODEBACKEND_INSTANCE'
  ]) {
    if (env[name]) process.env[name] = env[name]
  }

  return {
    plugins: [react(), ncbApiPlugin()],
    base: './',
    resolve: { alias: { '@': path.resolve(repositoryRoot, './src') } },
    server: { historyApiFallback: true },
    build: {
      outDir: 'dist',
      // Production source maps can expose readable application source. Keep
      // them off unless an operator deliberately enables them for a controlled
      // diagnostic build.
      sourcemap: env.ENABLE_PRODUCTION_SOURCEMAPS === 'true'
    }
  }
})