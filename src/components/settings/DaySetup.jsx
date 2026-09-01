import React, { useState } from 'react'
import { motion } from 'framer-motion'

const DaySetup = ({ preferences, onUpdate }) => {
  const [formData, setFormData] = useState({
    wake_time: preferences.wake_time || '07:00',
    sleep_time: preferences.sleep_time || '22:00',
    work_start_time: preferences.work_start_time || '',
    work_end_time: preferences.work_end_time || ''
  })

  const [saving, setSaving] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // Empty optional time inputs are represented as null in the canonical
      // preferences schema instead of the browser's empty-string value.
      await onUpdate({
        ...formData,
        work_start_time: formData.work_start_time || null,
        work_end_time: formData.work_end_time || null
      })
    } catch (error) {
      console.error('Error updating day setup:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-lg font-medium text-slate-900 mb-4">Day Setup</h2>
      <p className="text-sm text-slate-600 mb-6">
        Configure your daily schedule to help the system plan your day effectively.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={saving ? 'true' : 'false'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="day-setup-wake-time" className="block text-sm font-medium text-slate-700 mb-2">
              Wake Time
            </label>
            <input
              id="day-setup-wake-time"
              type="time"
              value={formData.wake_time}
              onChange={(e) => handleChange('wake_time', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="day-setup-sleep-time" className="block text-sm font-medium text-slate-700 mb-2">
              Sleep Time
            </label>
            <input
              id="day-setup-sleep-time"
              type="time"
              value={formData.sleep_time}
              onChange={(e) => handleChange('sleep_time', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Work Hours (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="day-setup-work-start-time" className="block text-sm font-medium text-slate-700 mb-2">
                Work Start Time
              </label>
              <input
                id="day-setup-work-start-time"
                type="time"
                value={formData.work_start_time}
                onChange={(e) => handleChange('work_start_time', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="day-setup-work-end-time" className="block text-sm font-medium text-slate-700 mb-2">
                Work End Time
              </label>
              <input
                id="day-setup-work-end-time"
                type="time"
                value={formData.work_end_time}
                onChange={(e) => handleChange('work_end_time', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            aria-busy={saving ? 'true' : 'false'}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {saving ? 'Saving day setup changes...' : ''}
          </span>
        </div>
      </form>
    </div>
  )
}

export default DaySetup
