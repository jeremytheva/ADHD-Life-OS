import { repositories } from '../infrastructure/nocodebackend/repositories'
import { requireAuthenticatedUser } from '../infrastructure/nocodebackend/errors'
import { getCurrentUserId } from './authStorage'
import { inboxItemFormSchema } from '../domains/schemas'
import { validateFormSubmission } from '../domains/validation'

const userId = () => requireAuthenticatedUser(getCurrentUserId())
export const inboxService = {
  async getInboxItems() { return (await repositories.inboxItems.list({ user_id: userId() })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) },
  async createInboxItem(itemData) { const data = validateFormSubmission(inboxItemFormSchema, itemData, 'Invalid inbox item submission.'); return repositories.inboxItems.create({ user_id: userId(), content: data.content, category: data.category || null, status: data.status || 'captured' }) },
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
