import authHandler from '../auth/[...path].js'

// The NoCodeBackend proxy deliberately shares the server-only credential handling
// used by auth, while forwarding this route to its /data namespace.
export default function handler(req, res) {
  req.query.path = ['data', ...(req.query.path ?? [])]
  return authHandler(req, res)
}
