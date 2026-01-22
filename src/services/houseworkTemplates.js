// Pre-built housework task templates organized by room and frequency

export const HOUSEWORK_TEMPLATES = {
  // Kitchen tasks
  kitchen: [
    {
      title: 'Wash dishes',
      description: 'Clean all dishes, pots, and utensils',
      room: 'kitchen',
      frequency: 'daily',
      estimated_duration: 15,
      prep_time: 2,
      cleanup_time: 3,
      checklist: [
        'Scrape food into trash/compost',
        'Rinse dishes',
        'Load dishwasher or hand wash',
        'Wipe down sink',
        'Dry and put away dishes'
      ],
      required_items: ['Dish soap', 'Sponge', 'Dish towel'],
      is_essential: true,
      difficulty: 'easy'
    },
    {
      title: 'Wipe counters and table',
      description: 'Clean all kitchen surfaces',
      room: 'kitchen',
      frequency: 'daily',
      estimated_duration: 10,
      prep_time: 1,
      cleanup_time: 2,
      checklist: [
        'Clear items from surfaces',
        'Spray cleaner',
        'Wipe down counters',
        'Clean table',
        'Return items to place'
      ],
      required_items: ['All-purpose cleaner', 'Microfiber cloth'],
      is_essential: true,
      difficulty: 'easy'
    },
    {
      title: 'Clean stovetop',
      description: 'Degrease and clean cooking surface',
      room: 'kitchen',
      frequency: 'twice_weekly',
      estimated_duration: 15,
      prep_time: 2,
      cleanup_time: 3,
      checklist: [
        'Remove grates/burners',
        'Spray degreaser',
        'Let sit 5 minutes',
        'Scrub surface',
        'Wipe clean',
        'Replace grates/burners'
      ],
      required_items: ['Degreaser', 'Scrub brush', 'Cloth'],
      is_essential: false,
      difficulty: 'medium'
    },
    {
      title: 'Clean microwave',
      description: 'Remove food splatters and sanitize',
      room: 'kitchen',
      frequency: 'weekly',
      estimated_duration: 10,
      prep_time: 2,
      cleanup_time: 2,
      checklist: [
        'Heat bowl of water with lemon for 3 min',
        'Let steam sit 5 minutes',
        'Wipe interior',
        'Clean turntable',
        'Wipe exterior'
      ],
      required_items: ['Lemon', 'Microfiber cloth', 'Bowl'],
      is_essential: false,
      difficulty: 'easy'
    },
    {
      title: 'Clean refrigerator',
      description: 'Remove expired items and wipe shelves',
      room: 'kitchen',
      frequency: 'weekly',
      estimated_duration: 30,
      prep_time: 5,
      cleanup_time: 5,
      checklist: [
        'Remove expired food',
        'Take out shelves and drawers',
        'Wash removable parts',
        'Wipe interior surfaces',
        'Replace shelves',
        'Organize items'
      ],
      required_items: ['All-purpose cleaner', 'Sponge', 'Trash bag'],
      is_essential: true,
      difficulty: 'medium'
    },
    {
      title: 'Sweep and mop floor',
      description: 'Clean kitchen floor thoroughly',
      room: 'kitchen',
      frequency: 'twice_weekly',
      estimated_duration: 20,
      prep_time: 3,
      cleanup_time: 5,
      checklist: [
        'Clear floor of obstacles',
        'Sweep or vacuum',
        'Fill bucket with cleaner',
        'Mop floor',
        'Let dry',
        'Empty and rinse bucket'
      ],
      required_items: ['Broom', 'Mop', 'Floor cleaner', 'Bucket'],
      is_essential: true,
      difficulty: 'medium'
    }
  ],

  // Bathroom tasks
  bathroom: [
    {
      title: 'Clean toilet',
      description: 'Sanitize toilet bowl and exterior',
      room: 'bathroom',
      frequency: 'twice_weekly',
      estimated_duration: 10,
      prep_time: 2,
      cleanup_time: 2,
      checklist: [
        'Apply toilet bowl cleaner',
        'Let sit 5 minutes',
        'Scrub bowl with brush',
        'Flush',
        'Wipe exterior with disinfectant',
        'Clean base and behind toilet'
      ],
      required_items: ['Toilet bowl cleaner', 'Toilet brush', 'Disinfectant', 'Cloth'],
      is_essential: true,
      difficulty: 'easy'
    },
    {
      title: 'Clean sink and counter',
      description: 'Sanitize bathroom sink area',
      room: 'bathroom',
      frequency: 'twice_weekly',
      estimated_duration: 10,
      prep_time: 2,
      cleanup_time: 2,
      checklist: [
        'Clear counter items',
        'Spray cleaner',
        'Scrub sink',
        'Clean faucet',
        'Wipe counter',
        'Replace items neatly'
      ],
      required_items: ['Bathroom cleaner', 'Sponge', 'Microfiber cloth'],
      is_essential: true,
      difficulty: 'easy'
    },
    {
      title: 'Clean shower/tub',
      description: 'Remove soap scum and sanitize',
      room: 'bathroom',
      frequency: 'weekly',
      estimated_duration: 20,
      prep_time: 3,
      cleanup_time: 5,
      checklist: [
        'Remove items from shower',
        'Spray cleaner on surfaces',
        'Let sit 10 minutes',
        'Scrub walls and floor',
        'Clean fixtures',
        'Rinse thoroughly',
        'Dry surfaces'
      ],
      required_items: ['Shower cleaner', 'Scrub brush', 'Squeegee'],
      is_essential: true,
      difficulty: 'medium'
    },
    {
      title: 'Clean mirrors',
      description: 'Streak-free mirror cleaning',
      room: 'bathroom',
      frequency: 'weekly',
      estimated_duration: 5,
      prep_time: 1,
      cleanup_time: 1,
      checklist: [
        'Spray glass cleaner',
        'Wipe in circular motion',
        'Buff with dry cloth',
        'Check for streaks'
      ],
      required_items: ['Glass cleaner', 'Microfiber cloths (2)'],
      is_essential: false,
      difficulty: 'easy'
    },
    {
      title: 'Mop bathroom floor',
      description: 'Sanitize bathroom floor',
      room: 'bathroom',
      frequency: 'weekly',
      estimated_duration: 15,
      prep_time: 3,
      cleanup_time: 3,
      checklist: [
        'Remove bath mats',
        'Sweep or vacuum',
        'Prepare cleaning solution',
        'Mop floor',
        'Clean around toilet base',
        'Let dry',
        'Replace mats'
      ],
      required_items: ['Mop', 'Floor cleaner', 'Bucket'],
      is_essential: true,
      difficulty: 'easy'
    }
  ],

  // Bedroom tasks
  bedroom: [
    {
      title: 'Make bed',
      description: 'Straighten sheets and arrange pillows',
      room: 'bedroom',
      frequency: 'daily',
      estimated_duration: 5,
      prep_time: 0,
      cleanup_time: 0,
      checklist: [
        'Pull up sheets',
        'Straighten comforter',
        'Arrange pillows',
        'Smooth out wrinkles'
      ],
      required_items: [],
      is_essential: true,
      difficulty: 'easy'
    },
    {
      title: 'Change bed sheets',
      description: 'Replace with fresh linens',
      room: 'bedroom',
      frequency: 'weekly',
      estimated_duration: 15,
      prep_time: 2,
      cleanup_time: 3,
      checklist: [
        'Strip bed',
        'Put sheets in laundry',
        'Put on fitted sheet',
        'Add flat sheet',
        'Replace pillowcases',
        'Add comforter'
      ],
      required_items: ['Clean sheets', 'Pillowcases'],
      is_essential: true,
      difficulty: 'easy'
    },
    {
      title: 'Vacuum floor',
      description: 'Remove dust and debris from floor',
      room: 'bedroom',
      frequency: 'weekly',
      estimated_duration: 10,
      prep_time: 2,
      cleanup_time: 2,
      checklist: [
        'Pick up items from floor',
        'Move furniture if needed',
        'Vacuum entire floor',
        'Get under bed',
        'Vacuum corners',
        'Replace furniture'
      ],
      required_items: ['Vacuum cleaner'],
      is_essential: true,
      difficulty: 'easy'
    },
    {
      title: 'Dust surfaces',
      description: 'Dust all bedroom surfaces',
      room: 'bedroom',
      frequency: 'weekly',
      estimated_duration: 10,
      prep_time: 1,
      cleanup_time: 2,
      checklist: [
        'Dust nightstands',
        'Dust dresser',
        'Dust windowsills',
        'Dust ceiling fan/light fixtures',
        'Dust baseboards'
      ],
      required_items: ['Duster or microfiber cloth', 'Optional: furniture polish'],
      is_essential: false,
      difficulty: 'easy'
    },
    {
      title: 'Organize closet',
      description: 'Tidy and organize clothing',
      room: 'bedroom',
      frequency: 'monthly',
      estimated_duration: 30,
      prep_time: 5,
      cleanup_time: 5,
      checklist: [
        'Remove items that don\'t belong',
        'Hang up loose clothes',
        'Fold and organize drawers',
        'Arrange shoes',
        'Donate unwanted items'
      ],
      required_items: ['Donation bag', 'Hangers'],
      is_essential: false,
      difficulty: 'medium'
    }
  ],

  // Living room tasks
  living_room: [
    {
      title: 'Quick tidy',
      description: 'Return items to proper places',
      room: 'living_room',
      frequency: 'daily',
      estimated_duration: 10,
      prep_time: 0,
      cleanup_time: 0,
      checklist: [
        'Put away dishes/cups',
        'Fold throw blankets',
        'Arrange pillows',
        'Clear coffee table',
        'Return items to rooms'
      ],
      required_items: [],
      is_essential: true,
      difficulty: 'easy'
    },
    {
      title: 'Vacuum carpet/floor',
      description: 'Clean floor surfaces',
      room: 'living_room',
      frequency: 'twice_weekly',
      estimated_duration: 15,
      prep_time: 3,
      cleanup_time: 2,
      checklist: [
        'Pick up items from floor',
        'Move light furniture',
        'Vacuum entire area',
        'Get under furniture',
        'Vacuum corners',
        'Replace furniture'
      ],
      required_items: ['Vacuum cleaner'],
      is_essential: true,
      difficulty: 'easy'
    },
    {
      title: 'Dust surfaces',
      description: 'Remove dust from all surfaces',
      room: 'living_room',
      frequency: 'weekly',
      estimated_duration: 15,
      prep_time: 2,
      cleanup_time: 2,
      checklist: [
        'Dust TV and stand',
        'Dust shelves',
        'Dust coffee table',
        'Dust windowsills',
        'Dust picture frames',
        'Dust baseboards'
      ],
      required_items: ['Duster', 'Microfiber cloth', 'Optional: furniture polish'],
      is_essential: false,
      difficulty: 'easy'
    },
    {
      title: 'Vacuum/clean couch',
      description: 'Remove crumbs and pet hair',
      room: 'living_room',
      frequency: 'weekly',
      estimated_duration: 15,
      prep_time: 2,
      cleanup_time: 2,
      checklist: [
        'Remove cushions',
        'Vacuum cushions',
        'Vacuum under cushions',
        'Vacuum couch frame',
        'Use lint roller if needed',
        'Replace cushions'
      ],
      required_items: ['Vacuum with upholstery attachment', 'Optional: lint roller'],
      is_essential: false,
      difficulty: 'easy'
    }
  ],

  // General/whole house tasks
  general: [
    {
      title: 'Take out trash',
      description: 'Empty all trash bins',
      room: 'general',
      frequency: 'twice_weekly',
      estimated_duration: 10,
      prep_time: 1,
      cleanup_time: 2,
      checklist: [
        'Gather trash from all rooms',
        'Tie bags',
        'Take to outdoor bin',
        'Replace trash bags'
      ],
      required_items: ['Trash bags'],
      is_essential: true,
      difficulty: 'easy'
    },
    {
      title: 'Laundry - wash and dry',
      description: 'Complete laundry cycle',
      room: 'general',
      frequency: 'twice_weekly',
      estimated_duration: 90,
      prep_time: 5,
      cleanup_time: 5,
      checklist: [
        'Sort laundry by color',
        'Load washer',
        'Add detergent',
        'Start wash cycle',
        'Transfer to dryer',
        'Start dryer',
        'Remove when done'
      ],
      required_items: ['Laundry detergent', 'Optional: fabric softener'],
      is_essential: true,
      difficulty: 'easy'
    },
    {
      title: 'Fold and put away laundry',
      description: 'Organize clean clothes',
      room: 'general',
      frequency: 'twice_weekly',
      estimated_duration: 30,
      prep_time: 2,
      cleanup_time: 0,
      checklist: [
        'Fold all items',
        'Hang items that need hanging',
        'Sort by person/room',
        'Put away in drawers/closets',
        'Put away hangers'
      ],
      required_items: ['Hangers'],
      is_essential: true,
      difficulty: 'easy'
    },
    {
      title: 'Water plants',
      description: 'Water indoor plants',
      room: 'general',
      frequency: 'weekly',
      estimated_duration: 10,
      prep_time: 2,
      cleanup_time: 2,
      checklist: [
        'Check soil moisture',
        'Water plants as needed',
        'Remove dead leaves',
        'Rotate plants for even light'
      ],
      required_items: ['Watering can'],
      is_essential: false,
      difficulty: 'easy'
    },
    {
      title: 'Deep clean one room',
      description: 'Thorough cleaning of selected room',
      room: 'general',
      frequency: 'monthly',
      estimated_duration: 60,
      prep_time: 10,
      cleanup_time: 10,
      checklist: [
        'Move furniture',
        'Vacuum/mop behind furniture',
        'Wipe down walls',
        'Clean baseboards',
        'Dust ceiling corners',
        'Clean windows',
        'Organize items'
      ],
      required_items: ['Various cleaning supplies'],
      is_essential: false,
      difficulty: 'hard'
    }
  ]
}

// Frequency options with descriptions
export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', days: 1 },
  { value: 'every_2_days', label: 'Every 2 Days', days: 2 },
  { value: 'twice_weekly', label: 'Twice Weekly', days: 3.5 },
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'biweekly', label: 'Every 2 Weeks', days: 14 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'quarterly', label: 'Quarterly', days: 90 },
  { value: 'seasonal', label: 'Seasonal (6 months)', days: 180 }
]

// Room categories
export const ROOM_CATEGORIES = [
  { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { value: 'living_room', label: 'Living Room', icon: '🛋️' },
  { value: 'general', label: 'General/Whole House', icon: '🏠' }
]

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  easy: { label: 'Easy', color: 'green', description: 'Quick and simple' },
  medium: { label: 'Medium', color: 'yellow', description: 'Moderate effort' },
  hard: { label: 'Hard', color: 'red', description: 'Time-intensive' }
}

// Helper to get all templates
export const getAllTemplates = () => {
  return Object.values(HOUSEWORK_TEMPLATES).flat()
}

// Helper to get templates by room
export const getTemplatesByRoom = (room) => {
  return HOUSEWORK_TEMPLATES[room] || []
}

// Helper to get templates by frequency
export const getTemplatesByFrequency = (frequency) => {
  return getAllTemplates().filter(t => t.frequency === frequency)
}

// Helper to get recommended starter set
export const getStarterSet = () => {
  return getAllTemplates().filter(t => t.is_essential)
}