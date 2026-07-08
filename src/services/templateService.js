// Template Library Service
// Manages pre-built templates for tasks and routines

import { getCurrentUserId } from './authStorage'
import { safeRead, safeWrite } from './storageService'

const TEMPLATES_STORAGE_KEY = 'adhd_lifeos_templates'
const USER_TEMPLATES_STORAGE_KEY = 'adhd_lifeos_user_templates'

// Master Template Library (Read-only)
const MASTER_TEMPLATES = {
  routines: [
    {
      id: 'morning-adhd-friendly',
      name: 'ADHD-Friendly Morning Routine',
      description: 'Gentle morning routine with built-in buffer time and sensory regulation',
      category: 'morning',
      tags: ['morning', 'daily', 'essential'],
      repeat_pattern: 'daily',
      is_active: true,
      steps: [
        { name: 'Wake up alarm + 5 min snooze buffer', duration_minutes: 5, order_index: 0, is_essential: true, preferred_time: '07:00' },
        { name: 'Drink water (keep by bed)', duration_minutes: 2, order_index: 1, is_essential: true },
        { name: 'Take morning medication', duration_minutes: 3, order_index: 2, is_essential: true },
        { name: 'Simple stretching or movement', duration_minutes: 5, order_index: 3, is_essential: false },
        { name: 'Shower with sensory-friendly products', duration_minutes: 15, order_index: 4, is_essential: true },
        { name: 'Get dressed (outfit prepared night before)', duration_minutes: 10, order_index: 5, is_essential: true },
        { name: 'Simple breakfast (pre-planned)', duration_minutes: 15, order_index: 6, is_essential: true },
        { name: 'Check daily schedule and top 3 tasks', duration_minutes: 5, order_index: 7, is_essential: true }
      ]
    },
    {
      id: 'evening-wind-down',
      name: 'Evening Wind-Down Routine',
      description: 'Calming evening routine to prepare for restful sleep',
      category: 'evening',
      tags: ['evening', 'daily', 'sleep'],
      repeat_pattern: 'daily',
      is_active: true,
      steps: [
        { name: 'Set tomorrow alarm', duration_minutes: 2, order_index: 0, is_essential: true, preferred_time: '21:00' },
        { name: 'Prepare tomorrow outfit and essentials', duration_minutes: 10, order_index: 1, is_essential: true },
        { name: 'Quick tidy (10-minute timer)', duration_minutes: 10, order_index: 2, is_essential: false },
        { name: 'Evening hygiene routine', duration_minutes: 15, order_index: 3, is_essential: true },
        { name: 'Journal or brain dump', duration_minutes: 10, order_index: 4, is_essential: false },
        { name: 'Calming activity (reading, music)', duration_minutes: 20, order_index: 5, is_essential: false },
        { name: 'Lights out', duration_minutes: 5, order_index: 6, is_essential: true, preferred_time: '22:00' }
      ]
    },
    {
      id: 'work-from-home-structure',
      name: 'Work From Home Daily Structure',
      description: 'Structured work routine with breaks and transitions',
      category: 'work',
      tags: ['work', 'weekdays', 'focus'],
      repeat_pattern: 'weekdays',
      is_active: true,
      steps: [
        { name: 'Morning work setup (desk, coffee, music)', duration_minutes: 10, order_index: 0, is_essential: true, preferred_time: '08:30' },
        { name: 'Review calendar and priorities', duration_minutes: 10, order_index: 1, is_essential: true },
        { name: 'Deep work block 1', duration_minutes: 90, order_index: 2, is_essential: true },
        { name: 'Movement break', duration_minutes: 10, order_index: 3, is_essential: true },
        { name: 'Email and communication check', duration_minutes: 30, order_index: 4, is_essential: false },
        { name: 'Lunch break (away from desk)', duration_minutes: 45, order_index: 5, is_essential: true, preferred_time: '12:00' },
        { name: 'Deep work block 2', duration_minutes: 90, order_index: 6, is_essential: true },
        { name: 'Quick break and snack', duration_minutes: 15, order_index: 7, is_essential: true },
        { name: 'Administrative tasks and planning', duration_minutes: 45, order_index: 8, is_essential: false },
        { name: 'End-of-day review and shutdown', duration_minutes: 15, order_index: 9, is_essential: true, preferred_time: '17:00' }
      ]
    },
    {
      id: 'adhd-cleaning-routine',
      name: 'ADHD-Friendly Cleaning Routine',
      description: 'Short, manageable cleaning tasks to prevent overwhelm',
      category: 'household',
      tags: ['cleaning', 'weekend', 'maintenance'],
      repeat_pattern: 'weekends',
      is_active: true,
      steps: [
        { name: 'Set timer for 15 minutes', duration_minutes: 1, order_index: 0, is_essential: true },
        { name: 'Kitchen quick clean', duration_minutes: 15, order_index: 1, is_essential: true },
        { name: '5-minute break', duration_minutes: 5, order_index: 2, is_essential: true },
        { name: 'Bathroom quick clean', duration_minutes: 15, order_index: 3, is_essential: true },
        { name: '5-minute break', duration_minutes: 5, order_index: 4, is_essential: true },
        { name: 'Living areas pickup', duration_minutes: 15, order_index: 5, is_essential: false },
        { name: 'Reward activity', duration_minutes: 20, order_index: 6, is_essential: false }
      ]
    },
    {
      id: 'exercise-routine-adhd',
      name: 'ADHD Exercise Routine',
      description: 'Varied exercise routine to maintain interest and energy',
      category: 'health',
      tags: ['exercise', 'daily', 'energy'],
      repeat_pattern: 'daily',
      is_active: true,
      steps: [
        { name: 'Choose today activity (variety is key)', duration_minutes: 2, order_index: 0, is_essential: true },
        { name: 'Warm-up movement', duration_minutes: 5, order_index: 1, is_essential: true },
        { name: 'Main exercise (dance, walk, sport, gym)', duration_minutes: 30, order_index: 2, is_essential: true },
        { name: 'Cool down stretches', duration_minutes: 5, order_index: 3, is_essential: true },
        { name: 'Hydrate and note how you feel', duration_minutes: 3, order_index: 4, is_essential: false }
      ]
    },
    {
      id: 'meal-prep-sunday',
      name: 'Sunday Meal Prep Session',
      description: 'Weekly meal preparation to reduce daily decision fatigue',
      category: 'food',
      tags: ['meal-prep', 'weekend', 'planning'],
      repeat_pattern: 'weekends',
      is_active: true,
      steps: [
        { name: 'Review meal plan for week', duration_minutes: 10, order_index: 0, is_essential: true },
        { name: 'Check pantry and make shopping list', duration_minutes: 15, order_index: 1, is_essential: true },
        { name: 'Grocery shopping trip', duration_minutes: 60, order_index: 2, is_essential: true },
        { name: 'Prep vegetables and proteins', duration_minutes: 45, order_index: 3, is_essential: true },
        { name: 'Cook base meals', duration_minutes: 90, order_index: 4, is_essential: true },
        { name: 'Portion and store meals', duration_minutes: 30, order_index: 5, is_essential: true },
        { name: 'Clean up kitchen', duration_minutes: 20, order_index: 6, is_essential: true }
      ]
    }
  ],
  
  tasks: [
    {
      id: 'weekly-planning',
      title: 'Weekly Planning Session',
      description: 'Review upcoming week, set priorities, and schedule important tasks',
      category: 'planning',
      tags: ['planning', 'weekly', 'essential'],
      estimated_duration: 45,
      is_essential: true,
      recurrence: 'weekly'
    },
    {
      id: 'medication-refill',
      title: 'Check Medication Supply',
      description: 'Review medication supply and refill if needed (set reminder 1 week before running out)',
      category: 'health',
      tags: ['health', 'medication', 'essential'],
      estimated_duration: 15,
      is_essential: true,
      recurrence: 'monthly'
    },
    {
      id: 'bills-review',
      title: 'Review and Pay Bills',
      description: 'Check all bills due this month and set up payments',
      category: 'finance',
      tags: ['finance', 'bills', 'essential'],
      estimated_duration: 30,
      is_essential: true,
      recurrence: 'monthly'
    },
    {
      id: 'inbox-zero',
      title: 'Email Inbox Processing',
      description: 'Process emails: delete, archive, respond, or add to task list',
      category: 'productivity',
      tags: ['email', 'organization'],
      estimated_duration: 30,
      is_essential: false,
      recurrence: 'daily'
    },
    {
      id: 'desk-organization',
      title: 'Desk Reset and Organization',
      description: 'Clear desk surface, file papers, return items to proper places',
      category: 'organization',
      tags: ['organization', 'workspace'],
      estimated_duration: 15,
      is_essential: false,
      recurrence: 'daily'
    },
    {
      id: 'social-connection',
      title: 'Reach Out to Friend or Family',
      description: 'Send a message or call someone you care about',
      category: 'social',
      tags: ['social', 'relationships'],
      estimated_duration: 20,
      is_essential: false,
      recurrence: 'weekly'
    },
    {
      id: 'brain-dump',
      title: 'Brain Dump Session',
      description: 'Write down all thoughts, worries, and ideas to clear mental space',
      category: 'mental-health',
      tags: ['mental-health', 'clarity'],
      estimated_duration: 15,
      is_essential: false,
      recurrence: 'daily'
    },
    {
      id: 'appointment-scheduling',
      title: 'Schedule Overdue Appointments',
      description: 'Call to schedule dentist, doctor, or other needed appointments',
      category: 'health',
      tags: ['health', 'appointments'],
      estimated_duration: 30,
      is_essential: true,
      recurrence: 'as-needed'
    },
    {
      id: 'car-maintenance',
      title: 'Car Maintenance Check',
      description: 'Check oil, tire pressure, and schedule any needed maintenance',
      category: 'maintenance',
      tags: ['car', 'maintenance'],
      estimated_duration: 45,
      is_essential: false,
      recurrence: 'monthly'
    },
    {
      id: 'digital-declutter',
      title: 'Digital Declutter Session',
      description: 'Organize computer files, clear downloads folder, update apps',
      category: 'organization',
      tags: ['digital', 'organization'],
      estimated_duration: 30,
      is_essential: false,
      recurrence: 'weekly'
    },
    {
      id: 'gratitude-practice',
      title: 'Gratitude Journaling',
      description: 'Write down 3 things you\'re grateful for today',
      category: 'mental-health',
      tags: ['mental-health', 'mindfulness'],
      estimated_duration: 10,
      is_essential: false,
      recurrence: 'daily'
    },
    {
      id: 'laundry-day',
      title: 'Laundry Day',
      description: 'Wash, dry, fold, and put away all laundry',
      category: 'household',
      tags: ['cleaning', 'household'],
      estimated_duration: 120,
      is_essential: false,
      recurrence: 'weekly'
    }
  ]
}


// Get user's applied templates
const getUserTemplates = () => safeRead(USER_TEMPLATES_STORAGE_KEY, {})

// Set user's applied templates
const setUserTemplates = (templates) => {
  safeWrite(USER_TEMPLATES_STORAGE_KEY, templates)
}

export const templateService = {
  // Get all master templates
  getMasterTemplates() {
    return MASTER_TEMPLATES
  },

  // Get routine templates by category
  getRoutineTemplates(category = null) {
    if (category) {
      return MASTER_TEMPLATES.routines.filter(r => r.category === category)
    }
    return MASTER_TEMPLATES.routines
  },

  // Get task templates by category
  getTaskTemplates(category = null) {
    if (category) {
      return MASTER_TEMPLATES.tasks.filter(t => t.category === category)
    }
    return MASTER_TEMPLATES.tasks
  },

  // Get all categories
  getCategories() {
    const routineCategories = [...new Set(MASTER_TEMPLATES.routines.map(r => r.category))]
    const taskCategories = [...new Set(MASTER_TEMPLATES.tasks.map(t => t.category))]
    
    return {
      routines: routineCategories,
      tasks: taskCategories,
      all: [...new Set([...routineCategories, ...taskCategories])]
    }
  },

  // Check if user has applied a template
  hasAppliedTemplate(templateId) {
    const userId = getCurrentUserId()
    if (!userId) return false

    const userTemplates = getUserTemplates()
    const applied = userTemplates[userId] || []
    return applied.includes(templateId)
  },

  // Mark template as applied
  markTemplateAsApplied(templateId) {
    const userId = getCurrentUserId()
    if (!userId) return

    const userTemplates = getUserTemplates()
    if (!userTemplates[userId]) {
      userTemplates[userId] = []
    }

    if (!userTemplates[userId].includes(templateId)) {
      userTemplates[userId].push(templateId)
      setUserTemplates(userTemplates)
    }
  },

  // Get user's applied templates
  getUserAppliedTemplates() {
    const userId = getCurrentUserId()
    if (!userId) return []

    const userTemplates = getUserTemplates()
    return userTemplates[userId] || []
  },

  // Search templates
  searchTemplates(query) {
    const searchTerm = query.toLowerCase()
    
    const routines = MASTER_TEMPLATES.routines.filter(r =>
      r.name.toLowerCase().includes(searchTerm) ||
      r.description.toLowerCase().includes(searchTerm) ||
      r.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )

    const tasks = MASTER_TEMPLATES.tasks.filter(t =>
      t.title.toLowerCase().includes(searchTerm) ||
      t.description.toLowerCase().includes(searchTerm) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )

    return { routines, tasks }
  },

  // Get template by ID
  getTemplateById(templateId) {
    const routine = MASTER_TEMPLATES.routines.find(r => r.id === templateId)
    if (routine) return { type: 'routine', template: routine }

    const task = MASTER_TEMPLATES.tasks.find(t => t.id === templateId)
    if (task) return { type: 'task', template: task }

    return null
  }
}