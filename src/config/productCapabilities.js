export const PRODUCT_CAPABILITIES = Object.freeze([
  {
    id: 'today',
    name: 'Today',
    status: 'active',
    summary: 'A calm daily view with time blocks and a realistic next-action recommendation.',
    iconKey: 'calendar',
    onboardingGroup: 'core',
    benefits: ['Daily timeline', 'Next-action guidance', 'Progressive disclosure'],
    navigation: { path: '/', label: 'Today', modes: ['all'], core: true }
  },
  {
    id: 'tasks',
    name: 'Tasks',
    status: 'active',
    summary: 'Manage tasks with energy, duration and ADHD-friendly prioritisation context.',
    iconKey: 'tasks',
    onboardingGroup: 'core',
    benefits: ['Quick Wins and Momentum', 'Energy and duration fit', 'Flexible task metadata'],
    navigation: { path: '/tasks', label: 'Tasks', modes: ['all', 'work', 'home', 'family', 'health', 'creative'], module: 'tasks' }
  },
  {
    id: 'routines',
    name: 'Routines',
    status: 'active',
    summary: 'Build and run repeatable routines with step-by-step progress.',
    iconKey: 'repeat',
    onboardingGroup: 'core',
    benefits: ['Routine steps', 'Session progress', 'Flexible repeat patterns'],
    navigation: { path: '/routines', label: 'Routines', modes: ['all', 'home', 'health'], module: 'routines' }
  },
  {
    id: 'projects',
    name: 'Projects',
    status: 'active',
    summary: 'Organise larger outcomes, subtasks, quick capture and reusable templates.',
    iconKey: 'projects',
    onboardingGroup: 'core',
    benefits: ['Project breakdown', 'Quick capture', 'Template library'],
    navigation: { path: '/projects', label: 'Projects', modes: ['all', 'work', 'creative'], core: true }
  },
  {
    id: 'housework',
    name: 'Housework',
    status: 'active',
    summary: 'Use structured home tasks and checklists without turning chores into a giant list.',
    iconKey: 'home',
    onboardingGroup: 'optional',
    benefits: ['Room-based chores', 'Checklists', 'Flexible frequency'],
    navigation: { path: '/housework', label: 'Housework', modes: ['all', 'home'], module: 'housework' }
  },
  {
    id: 'inbox',
    name: 'Brain Inbox',
    status: 'active',
    summary: 'Capture thoughts quickly, then organise or convert them when you have capacity.',
    iconKey: 'inbox',
    onboardingGroup: 'optional',
    benefits: ['Fast capture', 'Process later', 'Convert into action'],
    navigation: { path: '/inbox', label: 'Brain Inbox', modes: ['all'], module: 'inbox' }
  },
  {
    id: 'modes-accessibility',
    name: 'Modes and accessibility',
    status: 'active',
    summary: 'Adjust the app for context, visual comfort, motion, contrast and focus needs.',
    iconKey: 'sliders',
    onboardingGroup: null,
    benefits: ['Context modes', 'Reduced motion', 'Contrast and focus controls']
  },
  {
    id: 'templates',
    name: 'Templates',
    status: 'active',
    summary: 'Start common project, task and routine patterns without rebuilding them from scratch.',
    iconKey: 'book',
    onboardingGroup: null,
    benefits: ['Reusable starting points', 'Preview before applying', 'Edit before applying']
  },
  {
    id: 'rewards',
    name: 'Progress and rewards',
    status: 'active',
    summary: 'Optional lightweight progress feedback, achievements and rewards.',
    iconKey: 'award',
    onboardingGroup: null,
    benefits: ['Progress overview', 'Achievements', 'Reward shop']
  },
  {
    id: 'focus-sessions',
    name: 'Focus sessions',
    status: 'planned',
    roadmapStage: 'Stage 3',
    summary: 'Start, pause, continue and recover a next action without losing execution state.',
    iconKey: 'play',
    detail: 'The interaction direction is defined, but durable sessions remain intentionally inactive until the real provider contract is verified.'
  },
  {
    id: 'calendar-sync',
    name: 'Calendar sync',
    status: 'planned',
    roadmapStage: 'Future',
    summary: 'Bring external calendar events into planning without pretending the connection exists before it is configured.',
    iconKey: 'calendar-link',
    detail: 'External calendar and event synchronisation is planned, not currently connected.'
  },
  {
    id: 'insights',
    name: 'Insights',
    status: 'planned',
    roadmapStage: 'Future',
    summary: 'Show useful longitudinal patterns without turning the app into a performance dashboard.',
    iconKey: 'insights',
    detail: 'Richer analytics and longitudinal insight are deferred until the execution loop is stable.'
  },
  {
    id: 'ai-assistant',
    name: 'AI assistance',
    status: 'planned',
    roadmapStage: 'Future',
    summary: 'Offer optional scheduling or coaching assistance while preserving user control.',
    iconKey: 'ai',
    detail: 'Remote AI or LLM assistance is not active and will require explicit architecture and privacy review.'
  },
  {
    id: 'automations',
    name: 'Automations',
    status: 'planned',
    roadmapStage: 'Future',
    summary: 'Reduce repetitive planning work with carefully bounded background actions.',
    iconKey: 'automation',
    detail: 'Broader background automation is deferred and no background task behaviour is currently promised.'
  },
  {
    id: 'integrations',
    name: 'Productivity integrations',
    status: 'planned',
    roadmapStage: 'Future',
    summary: 'Connect selected external productivity services only where they reduce friction.',
    iconKey: 'integrations',
    detail: 'Broader productivity-service integrations are planned areas, not active connections.'
  }
])

export const ACTIVE_CAPABILITIES = Object.freeze(
  PRODUCT_CAPABILITIES.filter((capability) => capability.status === 'active')
)

export const PLANNED_CAPABILITIES = Object.freeze(
  PRODUCT_CAPABILITIES.filter((capability) => capability.status === 'planned')
)

export const CORE_ONBOARDING_CAPABILITIES = Object.freeze(
  ACTIVE_CAPABILITIES.filter((capability) => capability.onboardingGroup === 'core')
)

export const OPTIONAL_ONBOARDING_CAPABILITIES = Object.freeze(
  ACTIVE_CAPABILITIES.filter((capability) => capability.onboardingGroup === 'optional')
)

export const NAVIGABLE_CAPABILITIES = Object.freeze(
  ACTIVE_CAPABILITIES.filter((capability) => capability.navigation)
)
