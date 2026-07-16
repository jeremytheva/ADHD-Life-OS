import { repositories } from '../infrastructure/nocodebackend/repositories'
import { requireAuthenticatedUser } from '../infrastructure/nocodebackend/errors'
import { getCurrentUserId } from './authStorage'

const userId = () => requireAuthenticatedUser(getCurrentUserId())
export const inboxService = {
  async getInboxItems() { return (await repositories.inboxItems.list({ user_id: userId() })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) },
  async createInboxItem(itemData) { return repositories.inboxItems.create({ user_id: userId(), content: itemData.content, category: itemData.category || null, status: itemData.status || 'captured' }) },
  async updateInboxItem(itemId, updates) { return repositories.inboxItems.update(itemId, { ...updates, updated_at: new Date().toISOString() }, { user_id: userId() }) },
  async deleteInboxItem(itemId) { return repositories.inboxItems.remove(itemId, { user_id: userId() }) },
  async convertToTask(itemId) {
    const item = await repositories.inboxItems.get(itemId, { user_id: userId() })
    const { taskService } = await import('./taskService')
    const task = await taskService.createTask({ title: item.content, description: '', estimated_duration: 30, is_essential: item.category === 'urgent' })
    await this.deleteInboxItem(itemId)
    return task
  }
}
