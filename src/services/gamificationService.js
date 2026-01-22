// Enhanced Gamification Service with Currency System
// Manages points, coins, badges, streaks, and adaptive rewards for ADHD users

const GAMIFICATION_KEY = 'adhd_lifeos_gamification'
const ACHIEVEMENTS_KEY = 'adhd_lifeos_achievements'
const CURRENCY_KEY = 'adhd_lifeos_currency'
const REWARDS_KEY = 'adhd_lifeos_rewards'

// Helper to get current user ID
const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('adhd_lifeos_current_user'))
    return user?.id || null
  } catch {
    return null
  }
}

// Get user gamification data
const getUserData = () => {
  try {
    const userId = getCurrentUserId()
    if (!userId) return null

    const allData = JSON.parse(localStorage.getItem(GAMIFICATION_KEY) || '{}')
    return allData[userId] || getDefaultUserData()
  } catch {
    return getDefaultUserData()
  }
}

// Set user gamification data
const setUserData = (data) => {
  const userId = getCurrentUserId()
  if (!userId) return

  const allData = JSON.parse(localStorage.getItem(GAMIFICATION_KEY) || '{}')
  allData[userId] = {
    ...data,
    updated_at: new Date().toISOString()
  }
  localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(allData))
}

// Get user currency data
const getCurrencyData = () => {
  try {
    const userId = getCurrentUserId()
    if (!userId) return null

    const allData = JSON.parse(localStorage.getItem(CURRENCY_KEY) || '{}')
    return allData[userId] || getDefaultCurrencyData()
  } catch {
    return getDefaultCurrencyData()
  }
}

// Set user currency data
const setCurrencyData = (data) => {
  const userId = getCurrentUserId()
  if (!userId) return

  const allData = JSON.parse(localStorage.getItem(CURRENCY_KEY) || '{}')
  allData[userId] = {
    ...data,
    updated_at: new Date().toISOString()
  }
  localStorage.setItem(CURRENCY_KEY, JSON.stringify(allData))
}

// Get user rewards data
const getRewardsData = () => {
  try {
    const userId = getCurrentUserId()
    if (!userId) return null

    const allData = JSON.parse(localStorage.getItem(REWARDS_KEY) || '{}')
    return allData[userId] || { purchased_rewards: [], unlocked_themes: ['default'] }
  } catch {
    return { purchased_rewards: [], unlocked_themes: ['default'] }
  }
}

// Set user rewards data
const setRewardsData = (data) => {
  const userId = getCurrentUserId()
  if (!userId) return

  const allData = JSON.parse(localStorage.getItem(REWARDS_KEY) || '{}')
  allData[userId] = {
    ...data,
    updated_at: new Date().toISOString()
  }
  localStorage.setItem(REWARDS_KEY, JSON.stringify(allData))
}

// Default user data
const getDefaultUserData = () => ({
  points: 0,
  level: 1,
  xp: 0,
  xp_to_next_level: 100,
  current_streak: 0,
  longest_streak: 0,
  last_activity_date: null,
  total_tasks_completed: 0,
  total_subtasks_completed: 0,
  total_projects_completed: 0,
  achievements: [],
  daily_task_count: 0,
  weekly_task_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
})

// Default currency data
const getDefaultCurrencyData = () => ({
  coins: 0,
  gems: 0,
  lifetime_coins_earned: 0,
  lifetime_coins_spent: 0,
  coin_multiplier: 1.0,
  last_coin_award: null
})

// Point values (XP)
const POINT_VALUES = {
  TASK_COMPLETE: 10,
  SUBTASK_COMPLETE: 5,
  PROJECT_COMPLETE: 50,
  ESSENTIAL_TASK_BONUS: 5,
  STREAK_DAY_BONUS: 2,
  FIRST_TASK_OF_DAY: 15,
  QUICK_WIN: 8,
  BRAVE_FROG: 15,
  TEMPLATE_APPLIED: 5,
  BRAIN_DUMP: 3,
  HOUSEWORK_COMPLETE: 12,
  ROUTINE_COMPLETE: 20
}

// Coin values (Currency)
const COIN_VALUES = {
  TASK_COMPLETE: 5,
  SUBTASK_COMPLETE: 2,
  PROJECT_COMPLETE: 25,
  ESSENTIAL_TASK_BONUS: 3,
  STREAK_MILESTONE_3: 10,
  STREAK_MILESTONE_7: 25,
  STREAK_MILESTONE_30: 100,
  FIRST_TASK_OF_DAY: 8,
  QUICK_WIN: 4,
  BRAVE_FROG: 10,
  HOUSEWORK_COMPLETE: 6,
  ROUTINE_COMPLETE: 15,
  ACHIEVEMENT_UNLOCK: 20,
  LEVEL_UP: 50
}

// Achievement definitions
const ACHIEVEMENTS = [
  // Starter achievements
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first task',
    icon: '🎯',
    points: 10,
    coins: 20,
    requirement: { type: 'tasks_completed', value: 1 }
  },
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Complete 5 tasks',
    icon: '🌟',
    points: 25,
    coins: 30,
    requirement: { type: 'tasks_completed', value: 5 }
  },
  {
    id: 'task_warrior',
    name: 'Task Warrior',
    description: 'Complete 25 tasks',
    icon: '⚔️',
    points: 50,
    coins: 50,
    requirement: { type: 'tasks_completed', value: 25 }
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 tasks',
    icon: '💯',
    points: 100,
    coins: 100,
    requirement: { type: 'tasks_completed', value: 100 }
  },

  // Streak achievements
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Complete tasks for 3 days in a row',
    icon: '🔥',
    points: 20,
    coins: 40,
    requirement: { type: 'streak', value: 3 }
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Complete tasks for 7 days in a row',
    icon: '🔥🔥',
    points: 50,
    coins: 80,
    requirement: { type: 'streak', value: 7 }
  },
  {
    id: 'streak_30',
    name: 'Month Master',
    description: 'Complete tasks for 30 days in a row',
    icon: '🔥🔥🔥',
    points: 150,
    coins: 200,
    requirement: { type: 'streak', value: 30 }
  },

  // Subtask achievements
  {
    id: 'detail_oriented',
    name: 'Detail Oriented',
    description: 'Complete 10 subtasks',
    icon: '📋',
    points: 20,
    coins: 25,
    requirement: { type: 'subtasks_completed', value: 10 }
  },
  {
    id: 'micro_master',
    name: 'Micro Master',
    description: 'Complete 50 subtasks',
    icon: '✨',
    points: 50,
    coins: 60,
    requirement: { type: 'subtasks_completed', value: 50 }
  },

  // Project achievements
  {
    id: 'project_starter',
    name: 'Project Starter',
    description: 'Complete your first project',
    icon: '🎨',
    points: 30,
    coins: 50,
    requirement: { type: 'projects_completed', value: 1 }
  },
  {
    id: 'project_master',
    name: 'Project Master',
    description: 'Complete 5 projects',
    icon: '🏆',
    points: 100,
    coins: 150,
    requirement: { type: 'projects_completed', value: 5 }
  },

  // Special achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a task before 9 AM',
    icon: '🌅',
    points: 15,
    coins: 20,
    requirement: { type: 'special', value: 'early_bird' }
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a task after 9 PM',
    icon: '🌙',
    points: 15,
    coins: 20,
    requirement: { type: 'special', value: 'night_owl' }
  },
  {
    id: 'quick_starter',
    name: 'Quick Starter',
    description: 'Complete 3 tasks in one day',
    icon: '⚡',
    points: 25,
    coins: 35,
    requirement: { type: 'daily_tasks', value: 3 }
  },
  {
    id: 'productive_day',
    name: 'Productive Day',
    description: 'Complete 5 tasks in one day',
    icon: '🚀',
    points: 40,
    coins: 50,
    requirement: { type: 'daily_tasks', value: 5 }
  },
  {
    id: 'brain_dumper',
    name: 'Brain Dumper',
    description: 'Capture 10 items in Brain Inbox',
    icon: '🧠',
    points: 20,
    coins: 25,
    requirement: { type: 'brain_dump', value: 10 }
  },
  {
    id: 'organizer',
    name: 'Organizer',
    description: 'Categorize 20 inbox items',
    icon: '📦',
    points: 30,
    coins: 40,
    requirement: { type: 'organized_items', value: 20 }
  }
]

// Available rewards for purchase
const AVAILABLE_REWARDS = [
  // Themes
  {
    id: 'theme_ocean',
    name: 'Ocean Theme',
    description: 'Calming blue and teal color scheme',
    icon: '🌊',
    cost: 100,
    type: 'theme',
    category: 'appearance'
  },
  {
    id: 'theme_forest',
    name: 'Forest Theme',
    description: 'Peaceful green nature theme',
    icon: '🌲',
    cost: 100,
    type: 'theme',
    category: 'appearance'
  },
  {
    id: 'theme_sunset',
    name: 'Sunset Theme',
    description: 'Warm orange and pink gradient',
    icon: '🌅',
    cost: 100,
    type: 'theme',
    category: 'appearance'
  },
  {
    id: 'theme_galaxy',
    name: 'Galaxy Theme',
    description: 'Dark purple space theme',
    icon: '🌌',
    cost: 150,
    type: 'theme',
    category: 'appearance'
  },
  
  // Avatar Items
  {
    id: 'avatar_crown',
    name: 'Crown',
    description: 'Show off your achievements',
    icon: '👑',
    cost: 75,
    type: 'avatar',
    category: 'appearance'
  },
  {
    id: 'avatar_sunglasses',
    name: 'Cool Sunglasses',
    description: 'Look cool while being productive',
    icon: '😎',
    cost: 50,
    type: 'avatar',
    category: 'appearance'
  },
  
  // Power-ups
  {
    id: 'powerup_2x_coins',
    name: '2x Coins (1 Hour)',
    description: 'Double coin earnings for 1 hour',
    icon: '💰',
    cost: 50,
    type: 'powerup',
    category: 'boost',
    duration: 3600000 // 1 hour in ms
  },
  {
    id: 'powerup_streak_freeze',
    name: 'Streak Freeze',
    description: 'Protect your streak for 1 day',
    icon: '🧊',
    cost: 75,
    type: 'powerup',
    category: 'protection'
  },
  
  // Real-life rewards (suggestions)
  {
    id: 'reward_break_15',
    name: '15-Minute Break',
    description: 'Enjoy a guilt-free break!',
    icon: '☕',
    cost: 20,
    type: 'real_life',
    category: 'break'
  },
  {
    id: 'reward_break_30',
    name: '30-Minute Break',
    description: 'Take a longer relaxation break',
    icon: '🛋️',
    cost: 40,
    type: 'real_life',
    category: 'break'
  },
  {
    id: 'reward_treat',
    name: 'Treat Yourself',
    description: 'Enjoy your favorite snack or drink',
    icon: '🍪',
    cost: 30,
    type: 'real_life',
    category: 'treat'
  },
  {
    id: 'reward_hobby',
    name: 'Hobby Time',
    description: '1 hour of guilt-free hobby time',
    icon: '🎮',
    cost: 60,
    type: 'real_life',
    category: 'activity'
  }
]

export const gamificationService = {
  // Get user stats
  getUserStats() {
    return getUserData()
  },

  // Get currency data
  getCurrency() {
    return getCurrencyData()
  },

  // Get rewards data
  getRewards() {
    return getRewardsData()
  },

  // Award points and coins
  awardPointsAndCoins(xpAmount, coinAmount, reason) {
    const data = getUserData()
    const currency = getCurrencyData()
    const oldLevel = data.level

    // Add XP
    data.points += xpAmount
    data.xp += xpAmount

    // Add coins with multiplier
    const actualCoins = Math.round(coinAmount * currency.coin_multiplier)
    currency.coins += actualCoins
    currency.lifetime_coins_earned += actualCoins
    currency.last_coin_award = new Date().toISOString()

    // Check for level up
    let leveledUp = false
    while (data.xp >= data.xp_to_next_level) {
      data.xp -= data.xp_to_next_level
      data.level += 1
      data.xp_to_next_level = Math.floor(data.xp_to_next_level * 1.5)
      leveledUp = true
      
      // Bonus coins for leveling up
      currency.coins += COIN_VALUES.LEVEL_UP
      currency.lifetime_coins_earned += COIN_VALUES.LEVEL_UP
    }

    setUserData(data)
    setCurrencyData(currency)

    return {
      xp_awarded: xpAmount,
      coins_awarded: actualCoins,
      bonus_coins: leveledUp ? COIN_VALUES.LEVEL_UP : 0,
      total_points: data.points,
      total_coins: currency.coins,
      level: data.level,
      leveled_up: leveledUp,
      xp: data.xp,
      xp_to_next_level: data.xp_to_next_level,
      reason
    }
  },

  // Task completed
  onTaskComplete(task) {
    const data = getUserData()
    let xp = POINT_VALUES.TASK_COMPLETE
    let coins = COIN_VALUES.TASK_COMPLETE

    // Bonus for essential tasks
    if (task.is_essential) {
      xp += POINT_VALUES.ESSENTIAL_TASK_BONUS
      coins += COIN_VALUES.ESSENTIAL_TASK_BONUS
    }

    // First task of day bonus
    const today = new Date().toISOString().split('T')[0]
    if (data.last_activity_date !== today) {
      xp += POINT_VALUES.FIRST_TASK_OF_DAY
      coins += COIN_VALUES.FIRST_TASK_OF_DAY
      data.daily_task_count = 0
    }

    // Update counters
    data.total_tasks_completed += 1
    data.daily_task_count += 1
    data.weekly_task_count += 1
    data.last_activity_date = today

    // Update streak
    this.updateStreak(data, today)

    // Streak bonus
    if (data.current_streak > 0) {
      xp += data.current_streak * POINT_VALUES.STREAK_DAY_BONUS
    }

    // Streak milestone coins
    if (data.current_streak === 3) {
      coins += COIN_VALUES.STREAK_MILESTONE_3
    } else if (data.current_streak === 7) {
      coins += COIN_VALUES.STREAK_MILESTONE_7
    } else if (data.current_streak === 30) {
      coins += COIN_VALUES.STREAK_MILESTONE_30
    }

    setUserData(data)

    // Award points and coins
    const result = this.awardPointsAndCoins(xp, coins, 'Task completed')
    const newAchievements = this.checkAchievements()

    // Suggest adaptive reward
    const suggestedReward = this.suggestAdaptiveReward(task, result)

    return {
      ...result,
      new_achievements: newAchievements,
      streak: data.current_streak,
      suggested_reward: suggestedReward
    }
  },

  // Subtask completed
  onSubtaskComplete() {
    const data = getUserData()
    data.total_subtasks_completed += 1
    setUserData(data)

    const result = this.awardPointsAndCoins(
      POINT_VALUES.SUBTASK_COMPLETE,
      COIN_VALUES.SUBTASK_COMPLETE,
      'Subtask completed'
    )
    const newAchievements = this.checkAchievements()

    return {
      ...result,
      new_achievements: newAchievements,
      message: 'Each small step you take is a quick win! ⭐'
    }
  },

  // Project completed
  onProjectComplete() {
    const data = getUserData()
    data.total_projects_completed += 1
    setUserData(data)

    const result = this.awardPointsAndCoins(
      POINT_VALUES.PROJECT_COMPLETE,
      COIN_VALUES.PROJECT_COMPLETE,
      'Project completed'
    )
    const newAchievements = this.checkAchievements()

    // Big achievement deserves big reward suggestion
    const suggestedReward = {
      type: 'celebration',
      message: '🎉 Amazing work completing this project! You deserve a reward!',
      suggestions: [
        AVAILABLE_REWARDS.find(r => r.id === 'reward_hobby'),
        AVAILABLE_REWARDS.find(r => r.id === 'reward_break_30')
      ]
    }

    return {
      ...result,
      new_achievements: newAchievements,
      suggested_reward: suggestedReward
    }
  },

  // Housework completed
  onHouseworkComplete() {
    return this.awardPointsAndCoins(
      POINT_VALUES.HOUSEWORK_COMPLETE,
      COIN_VALUES.HOUSEWORK_COMPLETE,
      'Housework completed'
    )
  },

  // Routine completed
  onRoutineComplete() {
    return this.awardPointsAndCoins(
      POINT_VALUES.ROUTINE_COMPLETE,
      COIN_VALUES.ROUTINE_COMPLETE,
      'Routine completed'
    )
  },

  // Quick win completed
  onQuickWin() {
    return this.awardPointsAndCoins(
      POINT_VALUES.QUICK_WIN,
      COIN_VALUES.QUICK_WIN,
      'Quick win! 🚀'
    )
  },

  // Brave frog completed
  onBraveFrog() {
    const result = this.awardPointsAndCoins(
      POINT_VALUES.BRAVE_FROG,
      COIN_VALUES.BRAVE_FROG,
      'Brave frog conquered! 🐸'
    )

    // Extra reward for tackling aversive task
    const suggestedReward = {
      type: 'brave_frog_bonus',
      message: '🐸 You tackled a tough one! Time for a reward!',
      suggestions: [
        AVAILABLE_REWARDS.find(r => r.id === 'reward_treat'),
        AVAILABLE_REWARDS.find(r => r.id === 'reward_break_15')
      ]
    }

    return {
      ...result,
      suggested_reward: suggestedReward
    }
  },

  // Brain dump item
  onBrainDumpItem() {
    return this.awardPointsAndCoins(
      POINT_VALUES.BRAIN_DUMP,
      1, // Small coin reward for capturing thoughts
      'Thought captured'
    )
  },

  // Update streak
  updateStreak(data, today) {
    const lastDate = data.last_activity_date
    
    if (!lastDate) {
      data.current_streak = 1
    } else if (lastDate === today) {
      return
    } else {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastDate === yesterdayStr) {
        data.current_streak += 1
        if (data.current_streak > data.longest_streak) {
          data.longest_streak = data.current_streak
        }
      } else {
        data.current_streak = 1
      }
    }
  },

  // Check for new achievements
  checkAchievements() {
    const data = getUserData()
    const currency = getCurrencyData()
    const newAchievements = []

    ACHIEVEMENTS.forEach(achievement => {
      if (data.achievements.includes(achievement.id)) {
        return
      }

      let earned = false

      switch (achievement.requirement.type) {
        case 'tasks_completed':
          earned = data.total_tasks_completed >= achievement.requirement.value
          break
        case 'subtasks_completed':
          earned = data.total_subtasks_completed >= achievement.requirement.value
          break
        case 'projects_completed':
          earned = data.total_projects_completed >= achievement.requirement.value
          break
        case 'streak':
          earned = data.current_streak >= achievement.requirement.value
          break
        case 'daily_tasks':
          earned = data.daily_task_count >= achievement.requirement.value
          break
        default:
          break
      }

      if (earned) {
        data.achievements.push(achievement.id)
        newAchievements.push(achievement)
        data.points += achievement.points
        
        // Award achievement coins
        currency.coins += achievement.coins + COIN_VALUES.ACHIEVEMENT_UNLOCK
        currency.lifetime_coins_earned += achievement.coins + COIN_VALUES.ACHIEVEMENT_UNLOCK
      }
    })

    if (newAchievements.length > 0) {
      setUserData(data)
      setCurrencyData(currency)
    }

    return newAchievements
  },

  // Suggest adaptive reward based on task completion
  suggestAdaptiveReward(task, result) {
    const duration = task.estimated_duration || 30
    const isEssential = task.is_essential
    const currency = getCurrencyData()

    // Big task = bigger reward suggestion
    if (duration >= 90) {
      return {
        type: 'big_task',
        message: '🎉 Wow! That was a big task! You deserve a substantial reward!',
        suggestions: [
          AVAILABLE_REWARDS.find(r => r.id === 'reward_break_30'),
          AVAILABLE_REWARDS.find(r => r.id === 'reward_hobby')
        ]
      }
    }

    // Essential task = important reward
    if (isEssential) {
      return {
        type: 'essential_task',
        message: '⭐ You completed an essential task! Great work!',
        suggestions: [
          AVAILABLE_REWARDS.find(r => r.id === 'reward_treat'),
          AVAILABLE_REWARDS.find(r => r.id === 'reward_break_15')
        ]
      }
    }

    // Quick task = quick reward
    if (duration <= 15) {
      return {
        type: 'quick_win',
        message: '⚡ Quick win! Keep the momentum going!',
        suggestions: [
          AVAILABLE_REWARDS.find(r => r.id === 'reward_treat')
        ]
      }
    }

    // Default reward suggestion
    return {
      type: 'standard',
      message: '✨ Nice work! You earned some coins!',
      suggestions: [
        AVAILABLE_REWARDS.find(r => r.id === 'reward_break_15')
      ]
    }
  },

  // Purchase reward
  purchaseReward(rewardId) {
    const reward = AVAILABLE_REWARDS.find(r => r.id === rewardId)
    if (!reward) {
      throw new Error('Reward not found')
    }

    const currency = getCurrencyData()
    const rewards = getRewardsData()

    // Check if user has enough coins
    if (currency.coins < reward.cost) {
      return {
        success: false,
        message: 'Not enough coins!',
        needed: reward.cost - currency.coins
      }
    }

    // Deduct coins
    currency.coins -= reward.cost
    currency.lifetime_coins_spent += reward.cost

    // Add to purchased rewards
    if (!rewards.purchased_rewards) {
      rewards.purchased_rewards = []
    }
    rewards.purchased_rewards.push({
      reward_id: rewardId,
      purchased_at: new Date().toISOString(),
      used: false
    })

    // Handle theme unlocks
    if (reward.type === 'theme') {
      if (!rewards.unlocked_themes) {
        rewards.unlocked_themes = ['default']
      }
      rewards.unlocked_themes.push(rewardId)
    }

    // Handle powerups
    if (reward.type === 'powerup') {
      if (rewardId === 'powerup_2x_coins') {
        currency.coin_multiplier = 2.0
        currency.multiplier_expires_at = new Date(Date.now() + reward.duration).toISOString()
      }
    }

    setCurrencyData(currency)
    setRewardsData(rewards)

    return {
      success: true,
      message: `${reward.name} purchased!`,
      reward: reward,
      remaining_coins: currency.coins
    }
  },

  // Get available rewards
  getAvailableRewards() {
    const currency = getCurrencyData()
    const rewards = getRewardsData()

    return AVAILABLE_REWARDS.map(reward => ({
      ...reward,
      affordable: currency.coins >= reward.cost,
      purchased: rewards.purchased_rewards?.some(r => r.reward_id === reward.id) || false
    }))
  },

  // Get personalized task recommendations
  getPersonalizedRecommendations(tasks, userRoles, enabledModules) {
    const data = getUserData()
    const now = new Date()
    const hour = now.getHours()

    // Morning recommendations (6-10 AM)
    if (hour >= 6 && hour < 10) {
      return {
        time_of_day: 'morning',
        message: '☀️ Good morning! Start your day with these tasks:',
        recommendations: tasks
          .filter(t => !t.completed && t.estimated_duration <= 30)
          .slice(0, 3)
      }
    }

    // Midday recommendations (10 AM - 2 PM)
    if (hour >= 10 && hour < 14) {
      return {
        time_of_day: 'midday',
        message: '🎯 Peak productivity time! Tackle these:',
        recommendations: tasks
          .filter(t => !t.completed && t.is_essential)
          .slice(0, 3)
      }
    }

    // Afternoon recommendations (2-6 PM)
    if (hour >= 14 && hour < 18) {
      return {
        time_of_day: 'afternoon',
        message: '⚡ Keep the momentum! Try these tasks:',
        recommendations: tasks
          .filter(t => !t.completed && t.estimated_duration <= 60)
          .slice(0, 3)
      }
    }

    // Evening recommendations (6 PM+)
    return {
      time_of_day: 'evening',
      message: '🌙 Wind down with these lighter tasks:',
      recommendations: tasks
        .filter(t => !t.completed && t.estimated_duration <= 20)
        .slice(0, 3)
    }
  },

  // Get all achievements
  getAllAchievements() {
    const data = getUserData()
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      earned: data.achievements.includes(achievement.id)
    }))
  },

  // Get earned achievements
  getEarnedAchievements() {
    const data = getUserData()
    return ACHIEVEMENTS.filter(a => data.achievements.includes(a.id))
  },

  // Get achievement progress
  getAchievementProgress(achievementId) {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievement) return null

    const data = getUserData()
    let current = 0

    switch (achievement.requirement.type) {
      case 'tasks_completed':
        current = data.total_tasks_completed
        break
      case 'subtasks_completed':
        current = data.total_subtasks_completed
        break
      case 'projects_completed':
        current = data.total_projects_completed
        break
      case 'streak':
        current = data.current_streak
        break
      case 'daily_tasks':
        current = data.daily_task_count
        break
      default:
        break
    }

    const target = achievement.requirement.value
    const progress = Math.min(100, Math.round((current / target) * 100))

    return {
      current,
      target,
      progress,
      earned: data.achievements.includes(achievementId)
    }
  },

  // Get motivational message
  getStreakMessage(streak) {
    if (streak === 0) return null
    if (streak === 1) return "Great start! Keep the momentum going! 🎯"
    if (streak === 3) return "3 days in a row! You're building a habit! 🔥 (+10 bonus coins!)"
    if (streak === 7) return "A full week! You're on fire! 🔥🔥 (+25 bonus coins!)"
    if (streak === 14) return "Two weeks strong! Amazing consistency! 🌟"
    if (streak === 30) return "30 days! You're a productivity champion! 🏆 (+100 bonus coins!)"
    if (streak > 30) return `${streak} days! Incredible dedication! 👑`
    return `${streak}-day streak! Keep it up! 💪`
  },

  // Get level progress
  getLevelProgress() {
    const data = getUserData()
    const progress = Math.round((data.xp / data.xp_to_next_level) * 100)
    return {
      level: data.level,
      xp: data.xp,
      xp_to_next_level: data.xp_to_next_level,
      progress
    }
  }
}