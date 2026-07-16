import { repositories } from '../infrastructure/nocodebackend/repositories'
import { requireAuthenticatedUser } from '../infrastructure/nocodebackend/errors'
import { getDatabaseUserId } from './authStorage'

const defaults = { wake_time: '07:00', sleep_time: '22:00', work_start_time: null, work_end_time: null, theme: 'low-stim', notifications_enabled: true }
const userId = () => requireAuthenticatedUser(getDatabaseUserId())

export const userService = {
  async getPreferences() {
    const preferences = await repositories.preferences.list({ user_id: userId() })
    return preferences[0] ?? defaults
  },
  async updatePreferences(preferences) {
    const id = userId()
    const existing = await repositories.preferences.list({ user_id: id })
    const record = { ...defaults, ...preferences, user_id: id, updated_at: new Date().toISOString() }
    return existing[0] ? repositories.preferences.update(existing[0].id, record, { user_id: id }) : repositories.preferences.create(record)
  }
}
