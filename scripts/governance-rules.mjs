export const canonicalEnvironmentNames = Object.freeze([
  'NOCODEBACKEND_AUTH_BASE_URL',
  'NOCODEBACKEND_DATA_BASE_URL',
  'NOCODEBACKEND_SECRET_KEY',
  'NOCODEBACKEND_INSTANCE',
  'NOCODEBACKEND_USER_EMAIL',
  'NOCODEBACKEND_USER_SECRET_KEY',
  'NOCODEBACKEND_ADMIN_EMAIL',
  'NOCODEBACKEND_ADMIN_SECRET_KEY'
])

const sorted = (values) => [...new Set(values)].sort()
const sameSet = (left, right) => JSON.stringify(sorted(left)) === JSON.stringify(sorted(right))

export const validateEnvironmentContract = ({ envExample, providerOperations }) => {
  const failures = []
  for (const name of canonicalEnvironmentNames) {
    if (!new RegExp(`^${name}=`, 'm').test(envExample)) failures.push(`.env.example is missing canonical environment variable ${name}`)
    if (!providerOperations.includes(name)) failures.push(`Provider operation register is missing canonical environment variable ${name}`)
  }
  if (/NOCODEBACKEND\s+_[A-Z_]+|NOCODEBACKEND_[A-Z]+\s+_[A-Z_]+/.test(envExample)) {
    failures.push('NoCodeBackend environment variable names must not contain spaces.')
  }
  return failures
}

const workflowHeader = (content) => content.split(/\njobs:\s*\n/)[0]

export const validateLifecycleWorkflow = (content) => {
  const failures = []
  const header = workflowHeader(content)
  if (content.includes('pull_request_target:')) failures.push('PR lifecycle workflow must not use pull_request_target for ordinary lifecycle metadata.')
  if (!content.includes('pull_request:')) failures.push('PR lifecycle workflow must use pull_request for ordinary lifecycle metadata.')
  if (!/^permissions:\s*\{\}\s*$/m.test(header)) failures.push('PR lifecycle workflow must default top-level permissions to none.')
  if (/^\s{2,}(?:contents|actions|issues|pull-requests):\s*write\s*$/m.test(header)) failures.push('PR lifecycle workflow must not grant top-level write permissions.')
  if (!content.includes('add_label_best_effort') || !content.includes('::warning::')) failures.push('PR lifecycle label synchronization must be best-effort and warn on refusal.')
  if (!/set_state_best_effort\(\)[\s\S]*?add_label_best_effort "\$target"[\s\S]*?for label in state:implementing/.test(content)) {
    failures.push('PR lifecycle state replacement must add the target label before removing prior state metadata.')
  }
  if (!content.includes('direct authorised repository operations remain the primary merge path')) failures.push('PR lifecycle workflow must preserve the direct-authorised-operation fallback.')
  return failures
}

export const validateValidationWorkflow = (content) => {
  const failures = []
  const header = workflowHeader(content)
  if (!/^permissions:\s*\{\}\s*$/m.test(header)) failures.push('Application validation workflow must default top-level permissions to none.')
  if (/^\s{2,}(?:contents|actions|issues|pull-requests):\s*write\s*$/m.test(header)) failures.push('Application validation workflow must not grant top-level write permissions.')
  if (!/validate:[\s\S]*?permissions:[\s\S]*?contents:\s*read[\s\S]*?pull-requests:\s*read/.test(content)) failures.push('Application validation job must declare only the read permissions it needs.')
  if (!content.includes('npm run platform:validate')) failures.push('Application validation workflow must invoke npm run platform:validate.')
  return failures
}

export const validateMergeFinalizerWorkflow = (content) => {
  const failures = []
  const header = workflowHeader(content)
  if (!/^permissions:\s*\{\}\s*$/m.test(header)) failures.push('PR merge finalizer must default top-level permissions to none.')
  for (const job of ['gate:', 'mark-mergeable:', 'merge:', 'cleanup:']) {
    if (!content.includes(`  ${job}`)) failures.push(`PR merge finalizer is missing separated job ${job.slice(0, -1)}.`)
  }
  for (const marker of ['expectedHeadOid', 'reviewThreads', 'compare/main...', 'git/ref/heads/main']) {
    if (!content.includes(marker)) failures.push(`PR merge finalizer is missing gate marker ${marker}.`)
  }
  if (!content.includes('"$head_repo" != "$REPO"') || !content.includes('"$head_ref" == "$base_ref"') || !content.includes('branch preserved')) {
    failures.push('PR branch cleanup must be limited to safely merged same-repository non-default branches and preserve the branch on cleanup failure.')
  }
  if (!content.includes('metadata is advisory') || !content.includes('best-effort')) failures.push('PR merge metadata and cleanup must remain advisory/best-effort.')
  return failures
}

const parseRouteEntries = (section, prefix) => {
  const routes = []
  const entryPattern = /\{\s*path:\s*\[([^\]]*)\][\s\S]*?methods:\s*\{([^}]*)\}\s*\}/g
  for (const match of section.matchAll(entryPattern)) {
    const parts = match[1].split(',').map((part) => part.trim()).filter(Boolean).map((part) => {
      const quoted = part.match(/^['"](.+)['"]$/)
      if (quoted) return quoted[1]
      if (part === 'collectionSchema') return '<collection>'
      if (part === 'identifierSchema') return '<id>'
      return `<${part}>`
    })
    for (const methodMatch of match[2].matchAll(/\b(GET|POST|PATCH|DELETE):/g)) {
      routes.push(`${methodMatch[1]} ${prefix}/${parts.join('/')}`)
    }
  }
  return routes
}

export const extractHandlerRouteMap = (handler) => {
  const auth = handler.match(/auth:\s*\[([\s\S]*?)\]\s*,\s*data:/)?.[1] ?? ''
  const data = handler.match(/data:\s*\[([\s\S]*?)\]\s*\}\)/)?.[1] ?? ''
  return sorted([
    ...parseRouteEntries(auth, '/api/ncb/auth'),
    ...parseRouteEntries(data, '/api/ncb/data')
  ])
}

export const extractDocumentedRouteMap = (systemMap) => {
  const block = systemMap.match(/<!-- ROUTE_MAP_START -->([\s\S]*?)<!-- ROUTE_MAP_END -->/)?.[1] ?? ''
  return sorted([...block.matchAll(/`(GET|POST|PATCH|DELETE)\s+(\/api\/ncb\/[^`]+)`/g)].map((match) => `${match[1]} ${match[2]}`))
}

export const validateRouteMap = ({ handler, systemMap }) => {
  const codeRoutes = extractHandlerRouteMap(handler)
  const documentedRoutes = extractDocumentedRouteMap(systemMap)
  if (codeRoutes.length === 0) return ['Could not extract current NoCodeBackend application routes from api/ncb/handler.js.']
  if (!sameSet(codeRoutes, documentedRoutes)) {
    return [`SYSTEM_MAP current NoCodeBackend routes disagree with api/ncb/handler.js. Code: ${codeRoutes.join(', ')}; map: ${documentedRoutes.join(', ')}`]
  }
  return []
}

export const extractHandlerCollections = (handler) => {
  const body = handler.match(/const COLLECTIONS = \[([^\]]+)\]/)?.[1] ?? ''
  return sorted([...body.matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1]))
}

export const extractSchemaCollections = (schemas) => {
  const body = schemas.match(/domainSchemasByCollection\s*=\s*Object\.freeze\(\{([^}]+)\}\)/)?.[1] ?? ''
  const keys = []
  for (const match of body.matchAll(/(?:'([^']+)'|"([^"]+)"|([A-Za-z][A-Za-z0-9_-]*))\s*:/g)) {
    keys.push(match[1] ?? match[2] ?? match[3])
  }
  return sorted(keys)
}

export const extractDataModelCollections = (dataModel) => {
  const section = dataModel.match(/## 3\. Current logical collections([\s\S]*?)## 4\./)?.[1] ?? ''
  return sorted([...section.matchAll(/^\|\s*`([^`]+)`\s*\|/gm)].map((match) => match[1]))
}

export const validateCollectionContract = ({ handler, schemas, dataModel }) => {
  const handlerCollections = extractHandlerCollections(handler)
  const schemaCollections = extractSchemaCollections(schemas)
  const modelCollections = extractDataModelCollections(dataModel)
  const failures = []
  if (handlerCollections.length === 0 || schemaCollections.length === 0 || modelCollections.length === 0) {
    failures.push('Could not extract all current collection sets for drift validation.')
    return failures
  }
  if (!sameSet(handlerCollections, schemaCollections)) failures.push(`Server collection allowlist disagrees with domain schema registry: ${handlerCollections.join(', ')} vs ${schemaCollections.join(', ')}`)
  if (!sameSet(schemaCollections, modelCollections)) failures.push(`Domain schema registry disagrees with DATA_MODEL current collections: ${schemaCollections.join(', ')} vs ${modelCollections.join(', ')}`)
  return failures
}

export const validateBlockerOwnership = ({ project, roadmap, systemMap }) => {
  const failures = []
  for (const [name, content] of Object.entries({ PROJECT: project, ROADMAP: roadmap, SYSTEM_MAP: systemMap })) {
    if (/^#{1,6}\s+.*\bblockers?\b.*$/im.test(content)) failures.push(`${name} must not define a competing current blocker list; STATUS.md owns current blockers.`)
  }
  return failures
}
