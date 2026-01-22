import { supabase } from '../config/supabase'

// Mock Inbox Service
const MOCK_INBOX_KEY = 'adhd_lifeos_inbox'

const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('adhd_lifeos_current_user'))
    return user?.id || null
  } catch {
    return null
  }
}

const getMockInbox = () => {
  try {
    const stored = localStorage.getItem(MOCK_INBOX_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const setMockInbox = (items) => {
  localStorage.setItem(MOCK_INBOX_KEY, JSON.stringify(items))
}

export const inboxService = {
  async getInboxItems() {
    const userId = getCurrentUserId()
    if (!userId) return []
    const allItems = getMockInbox()
    return allItems
      .filter(item => item.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  async createInboxItem(itemData) {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('No user logged in')
    
    const newItem = {
      id: Date.now().toString(),
      user_id: userId,
      content: itemData.content,
      category: itemData.category || null,
      status: itemData.status || 'captured',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const items = getMockInbox()
    items.push(newItem)
    setMockInbox(items)
    return newItem
  },

  async updateInboxItem(itemId, updates) {
    const userId = getCurrentUserId()
    const items = getMockInbox()
    const index = items.findIndex(item => item.id === itemId && item.user_id === userId)
    
    if (index === -1) throw new Error('Item not found')
    
    items[index] = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    setMockInbox(items)
    return items[index]
  },

  async deleteInboxItem(itemId) {
    const userId = getCurrentUserId()
    const items = getMockInbox()
    const filtered = items.filter(item => !(item.id === itemId && item.user_id === userId))
    setMockInbox(filtered)
    return true
  },

  async convertToTask(itemId) {
    const userId = getCurrentUserId()
    const items = getMockInbox()
    const item = items.find(i => i.id === itemId && i.user_id === userId)
    
    if (!item) throw new Error('Item not found')
    
    // Dynamic import to avoid circular dependency if taskService imports inboxService
    const { taskService } = await import('./taskService')
    
    const task = await taskService.createTask({
      title: item.content,
      description: '',
      estimated_duration: 30,
      is_essential: item.category === 'urgent'
    })
    
    await this.deleteInboxItem(itemId)
    return task
  }
}