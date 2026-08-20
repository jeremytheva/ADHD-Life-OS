export const createUiCorrelationId = () =>
  globalThis.crypto?.randomUUID?.() ?? `ui-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const buildUiErrorDiagnostic = (error, info, correlationId) => ({
  correlationId,
  name: error?.name || 'Error',
  componentStack: info?.componentStack || undefined
})
