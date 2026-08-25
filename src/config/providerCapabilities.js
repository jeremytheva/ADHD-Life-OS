export const providerCapabilities = Object.freeze({
  executionSessions: false
})

export const isProviderCapabilityEnabled = (name) => providerCapabilities[name] === true

export default providerCapabilities
