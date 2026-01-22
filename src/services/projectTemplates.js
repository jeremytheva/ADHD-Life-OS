// Project Templates
// Pre-built project templates for common goals

export const PROJECT_TEMPLATES = [
  {
    id: 'organize-home',
    name: 'Organize Home',
    description: 'Declutter and organize your living space room by room',
    category: 'home',
    color: 'green',
    icon: '🏠',
    tasks: [
      {
        title: 'Organize Bedroom',
        description: 'Declutter and organize bedroom',
        estimated_duration: 120,
        is_essential: true,
        subtasks: [
          { title: 'Sort clothes and donate unused items', estimated_duration: 30 },
          { title: 'Organize closet and drawers', estimated_duration: 45 },
          { title: 'Clean under bed and surfaces', estimated_duration: 20 },
          { title: 'Arrange nightstand and dresser', estimated_duration: 25 }
        ]
      },
      {
        title: 'Organize Kitchen',
        description: 'Declutter and organize kitchen',
        estimated_duration: 150,
        is_essential: true,
        subtasks: [
          { title: 'Clear countertops', estimated_duration: 20 },
          { title: 'Organize pantry and cabinets', estimated_duration: 60 },
          { title: 'Sort through refrigerator', estimated_duration: 30 },
          { title: 'Arrange utensils and dishes', estimated_duration: 40 }
        ]
      },
      {
        title: 'Organize Living Room',
        description: 'Declutter and organize common areas',
        estimated_duration: 90,
        subtasks: [
          { title: 'Remove clutter and put items away', estimated_duration: 30 },
          { title: 'Organize entertainment center', estimated_duration: 30 },
          { title: 'Arrange bookshelves', estimated_duration: 30 }
        ]
      }
    ]
  },
  {
    id: 'job-search',
    name: 'Job Search',
    description: 'Complete job search process from resume to interviews',
    category: 'career',
    color: 'blue',
    icon: '💼',
    tasks: [
      {
        title: 'Update Resume',
        description: 'Revise and modernize resume',
        estimated_duration: 120,
        is_essential: true,
        subtasks: [
          { title: 'Review current resume', estimated_duration: 15 },
          { title: 'Add recent experience and skills', estimated_duration: 45 },
          { title: 'Reformat for modern style', estimated_duration: 30 },
          { title: 'Proofread and get feedback', estimated_duration: 30 }
        ]
      },
      {
        title: 'Build LinkedIn Profile',
        description: 'Create or update LinkedIn presence',
        estimated_duration: 90,
        is_essential: true,
        subtasks: [
          { title: 'Update profile photo and headline', estimated_duration: 15 },
          { title: 'Write compelling summary', estimated_duration: 30 },
          { title: 'Add work experience and skills', estimated_duration: 30 },
          { title: 'Request recommendations', estimated_duration: 15 }
        ]
      },
      {
        title: 'Research Target Companies',
        description: 'Identify and research potential employers',
        estimated_duration: 120,
        subtasks: [
          { title: 'List 10 target companies', estimated_duration: 30 },
          { title: 'Research company culture and values', estimated_duration: 60 },
          { title: 'Find connections at companies', estimated_duration: 30 }
        ]
      },
      {
        title: 'Apply to Jobs',
        description: 'Submit job applications',
        estimated_duration: 180,
        is_essential: true,
        subtasks: [
          { title: 'Customize resume for each role', estimated_duration: 60 },
          { title: 'Write cover letters', estimated_duration: 90 },
          { title: 'Submit applications', estimated_duration: 30 }
        ]
      },
      {
        title: 'Prepare for Interviews',
        description: 'Practice and prepare for interviews',
        estimated_duration: 150,
        subtasks: [
          { title: 'Research common interview questions', estimated_duration: 30 },
          { title: 'Prepare STAR stories', estimated_duration: 60 },
          { title: 'Practice with friend or family', estimated_duration: 60 }
        ]
      }
    ]
  },
  {
    id: 'learn-skill',
    name: 'Learn New Skill',
    description: 'Structured approach to learning a new skill',
    category: 'personal-development',
    color: 'purple',
    icon: '📚',
    tasks: [
      {
        title: 'Research and Choose Skill',
        description: 'Decide what skill to learn',
        estimated_duration: 60,
        is_essential: true,
        subtasks: [
          { title: 'List skills you want to learn', estimated_duration: 15 },
          { title: 'Research difficulty and time commitment', estimated_duration: 30 },
          { title: 'Choose one skill to focus on', estimated_duration: 15 }
        ]
      },
      {
        title: 'Find Learning Resources',
        description: 'Gather courses, books, and materials',
        estimated_duration: 90,
        is_essential: true,
        subtasks: [
          { title: 'Research online courses and tutorials', estimated_duration: 30 },
          { title: 'Find recommended books or articles', estimated_duration: 20 },
          { title: 'Join online communities', estimated_duration: 20 },
          { title: 'Purchase or enroll in chosen resources', estimated_duration: 20 }
        ]
      },
      {
        title: 'Create Learning Schedule',
        description: 'Plan regular practice time',
        estimated_duration: 45,
        subtasks: [
          { title: 'Set weekly learning goals', estimated_duration: 15 },
          { title: 'Block time in calendar', estimated_duration: 15 },
          { title: 'Set up practice space', estimated_duration: 15 }
        ]
      },
      {
        title: 'Complete First Module',
        description: 'Finish first section of learning',
        estimated_duration: 180,
        subtasks: [
          { title: 'Watch/read introductory material', estimated_duration: 60 },
          { title: 'Take notes and practice', estimated_duration: 90 },
          { title: 'Complete exercises', estimated_duration: 30 }
        ]
      },
      {
        title: 'Build Practice Project',
        description: 'Apply skills to real project',
        estimated_duration: 300,
        subtasks: [
          { title: 'Choose project idea', estimated_duration: 30 },
          { title: 'Plan project structure', estimated_duration: 60 },
          { title: 'Build project incrementally', estimated_duration: 180 },
          { title: 'Get feedback and iterate', estimated_duration: 30 }
        ]
      }
    ]
  },
  {
    id: 'plan-event',
    name: 'Plan Event',
    description: 'Organize a party, gathering, or celebration',
    category: 'social',
    color: 'pink',
    icon: '🎉',
    tasks: [
      {
        title: 'Set Event Details',
        description: 'Decide date, time, location, and guest count',
        estimated_duration: 60,
        is_essential: true,
        subtasks: [
          { title: 'Choose date and time', estimated_duration: 15 },
          { title: 'Decide on location', estimated_duration: 15 },
          { title: 'Estimate number of guests', estimated_duration: 15 },
          { title: 'Set budget', estimated_duration: 15 }
        ]
      },
      {
        title: 'Create Guest List',
        description: 'List and contact invitees',
        estimated_duration: 90,
        is_essential: true,
        subtasks: [
          { title: 'List all potential guests', estimated_duration: 20 },
          { title: 'Create invitations', estimated_duration: 40 },
          { title: 'Send invitations', estimated_duration: 20 },
          { title: 'Track RSVPs', estimated_duration: 10 }
        ]
      },
      {
        title: 'Plan Menu',
        description: 'Decide food and drinks',
        estimated_duration: 75,
        subtasks: [
          { title: 'Choose menu items', estimated_duration: 30 },
          { title: 'Check for dietary restrictions', estimated_duration: 15 },
          { title: 'Create shopping list', estimated_duration: 30 }
        ]
      },
      {
        title: 'Shop for Supplies',
        description: 'Purchase food, decorations, and supplies',
        estimated_duration: 120,
        is_essential: true,
        subtasks: [
          { title: 'Buy decorations', estimated_duration: 30 },
          { title: 'Buy food and drinks', estimated_duration: 60 },
          { title: 'Buy plates, cups, utensils', estimated_duration: 30 }
        ]
      },
      {
        title: 'Prepare Venue',
        description: 'Set up space for event',
        estimated_duration: 90,
        is_essential: true,
        subtasks: [
          { title: 'Clean and organize space', estimated_duration: 45 },
          { title: 'Decorate', estimated_duration: 30 },
          { title: 'Set up tables and chairs', estimated_duration: 15 }
        ]
      },
      {
        title: 'Prepare Food',
        description: 'Cook or prepare menu items',
        estimated_duration: 180,
        is_essential: true,
        subtasks: [
          { title: 'Prep ingredients', estimated_duration: 60 },
          { title: 'Cook dishes', estimated_duration: 90 },
          { title: 'Set up serving area', estimated_duration: 30 }
        ]
      }
    ]
  },
  {
    id: 'fitness-journey',
    name: 'Start Fitness Journey',
    description: 'Begin a sustainable fitness routine',
    category: 'health',
    color: 'orange',
    icon: '💪',
    tasks: [
      {
        title: 'Set Fitness Goals',
        description: 'Define clear, achievable fitness goals',
        estimated_duration: 45,
        is_essential: true,
        subtasks: [
          { title: 'Identify main fitness goal', estimated_duration: 15 },
          { title: 'Set specific, measurable targets', estimated_duration: 20 },
          { title: 'Set timeline', estimated_duration: 10 }
        ]
      },
      {
        title: 'Choose Workout Plan',
        description: 'Select appropriate exercise program',
        estimated_duration: 90,
        is_essential: true,
        subtasks: [
          { title: 'Research beginner workout plans', estimated_duration: 30 },
          { title: 'Choose program that fits schedule', estimated_duration: 30 },
          { title: 'Watch tutorial videos', estimated_duration: 30 }
        ]
      },
      {
        title: 'Get Necessary Equipment',
        description: 'Purchase or gather workout gear',
        estimated_duration: 60,
        subtasks: [
          { title: 'List needed equipment', estimated_duration: 15 },
          { title: 'Buy workout clothes', estimated_duration: 30 },
          { title: 'Get basic equipment (weights, mat)', estimated_duration: 15 }
        ]
      },
      {
        title: 'Schedule Workouts',
        description: 'Plan workout days and times',
        estimated_duration: 30,
        is_essential: true,
        subtasks: [
          { title: 'Choose workout days', estimated_duration: 10 },
          { title: 'Block time in calendar', estimated_duration: 10 },
          { title: 'Set reminders', estimated_duration: 10 }
        ]
      },
      {
        title: 'Complete First Week',
        description: 'Finish initial week of workouts',
        estimated_duration: 210,
        is_essential: true,
        subtasks: [
          { title: 'Workout Day 1', estimated_duration: 30 },
          { title: 'Workout Day 2', estimated_duration: 30 },
          { title: 'Workout Day 3', estimated_duration: 30 },
          { title: 'Track progress and adjust', estimated_duration: 20 }
        ]
      }
    ]
  },
  {
    id: 'move-house',
    name: 'Move to New Home',
    description: 'Organize and execute a house move',
    category: 'home',
    color: 'teal',
    icon: '📦',
    tasks: [
      {
        title: 'Plan Move',
        description: 'Set moving date and create timeline',
        estimated_duration: 60,
        is_essential: true,
        subtasks: [
          { title: 'Set moving date', estimated_duration: 10 },
          { title: 'Research moving companies or rent truck', estimated_duration: 30 },
          { title: 'Create moving checklist', estimated_duration: 20 }
        ]
      },
      {
        title: 'Declutter and Donate',
        description: 'Sort belongings and reduce items',
        estimated_duration: 240,
        is_essential: true,
        subtasks: [
          { title: 'Sort through each room', estimated_duration: 120 },
          { title: 'Create donate/sell/trash piles', estimated_duration: 60 },
          { title: 'Drop off donations', estimated_duration: 60 }
        ]
      },
      {
        title: 'Get Packing Supplies',
        description: 'Gather boxes and materials',
        estimated_duration: 90,
        is_essential: true,
        subtasks: [
          { title: 'Estimate number of boxes needed', estimated_duration: 15 },
          { title: 'Buy or collect boxes', estimated_duration: 45 },
          { title: 'Get tape, markers, bubble wrap', estimated_duration: 30 }
        ]
      },
      {
        title: 'Pack Non-Essentials',
        description: 'Pack items not needed daily',
        estimated_duration: 360,
        is_essential: true,
        subtasks: [
          { title: 'Pack books and decorations', estimated_duration: 90 },
          { title: 'Pack seasonal items', estimated_duration: 60 },
          { title: 'Pack extra dishes and linens', estimated_duration: 90 },
          { title: 'Label all boxes', estimated_duration: 60 }
        ]
      },
      {
        title: 'Change Address',
        description: 'Update address with services',
        estimated_duration: 90,
        is_essential: true,
        subtasks: [
          { title: 'Set up mail forwarding', estimated_duration: 20 },
          { title: 'Update address with bank, work, etc.', estimated_duration: 40 },
          { title: 'Transfer utilities to new home', estimated_duration: 30 }
        ]
      },
      {
        title: 'Pack Essentials',
        description: 'Pack items needed for first days',
        estimated_duration: 60,
        is_essential: true,
        subtasks: [
          { title: 'Pack clothes for first week', estimated_duration: 20 },
          { title: 'Pack toiletries and medications', estimated_duration: 15 },
          { title: 'Pack important documents', estimated_duration: 15 },
          { title: 'Pack basic kitchen items', estimated_duration: 10 }
        ]
      },
      {
        title: 'Moving Day',
        description: 'Execute the move',
        estimated_duration: 480,
        is_essential: true,
        subtasks: [
          { title: 'Load moving truck', estimated_duration: 180 },
          { title: 'Final walkthrough of old home', estimated_duration: 30 },
          { title: 'Drive to new home', estimated_duration: 60 },
          { title: 'Unload truck', estimated_duration: 180 },
          { title: 'Set up beds and essentials', estimated_duration: 30 }
        ]
      },
      {
        title: 'Unpack and Settle',
        description: 'Unpack and organize new home',
        estimated_duration: 600,
        subtasks: [
          { title: 'Unpack kitchen', estimated_duration: 120 },
          { title: 'Unpack bedrooms', estimated_duration: 180 },
          { title: 'Unpack bathrooms', estimated_duration: 60 },
          { title: 'Unpack living areas', estimated_duration: 180 },
          { title: 'Hang pictures and decorate', estimated_duration: 60 }
        ]
      }
    ]
  }
]

export const getTemplateById = (templateId) => {
  return PROJECT_TEMPLATES.find(t => t.id === templateId) || null
}

export const getTemplatesByCategory = (category) => {
  if (!category || category === 'all') {
    return PROJECT_TEMPLATES
  }
  return PROJECT_TEMPLATES.filter(t => t.category === category)
}

export const getAllCategories = () => {
  return [...new Set(PROJECT_TEMPLATES.map(t => t.category))]
}