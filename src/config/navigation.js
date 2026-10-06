import { NAVIGABLE_CAPABILITIES } from './productCapabilities'

const capabilityNavigation = NAVIGABLE_CAPABILITIES.map((capability) => ({
  ...capability.navigation
}))

export const navigationConfig = Object.freeze([
  ...capabilityNavigation,
  { path: '/features', label: 'Features', modes: ['all'], core: true },
  { path: '/settings', label: 'Settings', modes: ['all'], core: true }
])

export const getVisibleNavigationItems = (enabledModules, modeId) => navigationConfig.filter((item) =>
  (item.core || enabledModules.includes(item.module)) &&
  (item.modes.includes('all') || item.modes.includes(modeId))
)
