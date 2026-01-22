import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/userService'
import DaySetup from './DaySetup'

const Settings = () => {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const data = await userService.getUserPreferences()
      setPreferences(data)
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePreferences = async (updates) => {
    try {
      const updated = await userService.updateUserPreferences(updates)
      setPreferences(updated)
    } catch (error) {
      console.error('Error updating preferences:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-600">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium text-slate-900">Settings</h1>

      <div className="space-y-6">
        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-slate-200 p-6"
        >
          <h2 className="text-lg font-medium text-slate-900 mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <p className="text-slate-900">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Day Setup */}
        {preferences && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DaySetup
              preferences={preferences}
              onUpdate={handleUpdatePreferences}
            />
          </motion.div>
        )}

        {/* App Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-slate-200 p-6"
        >
          <h2 className="text-lg font-medium text-slate-900 mb-4">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Theme
              </label>
              <select
                value={preferences?.theme || 'low-stim'}
                onChange={(e) => handleUpdatePreferences({ theme: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="low-stim">Low Stimulation</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                checked={preferences?.notifications_enabled || false}
                onChange={(e) => handleUpdatePreferences({ notifications_enabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="notifications" className="ml-2 text-sm text-slate-700">
                Enable notifications
              </label>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Settings