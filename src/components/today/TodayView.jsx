import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { timelineService } from '../../services/timelineService'
import { taskService } from '../../services/taskService'
import BlockCard from './BlockCard'

const { FiRefreshCw } = FiIcons

const TodayView = () => {
  const [timeline, setTimeline] = useState({ blocks: [], unscheduledTasks: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTimeline()
  }, [])

  const loadTimeline = async () => {
    try {
      setLoading(true)
      const today = new Date()
      const schedule = await timelineService.getTimeline(today)
      setTimeline(schedule)
    } catch (error) {
      setError('Failed to load timeline')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (blockId, taskId) => {
    try {
      await taskService.completeTask(taskId)
      await loadTimeline() // Refresh timeline
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const groupBlocksByTimeOfDay = (blocks) => {
    const groups = {
      morning: [],
      midday: [],
      afternoon: [],
      evening: []
    }

    blocks.forEach(block => {
      const hour = parseISO(block.start_at).getHours()
      
      if (hour < 12) {
        groups.morning.push(block)
      } else if (hour < 15) {
        groups.midday.push(block)
      } else if (hour < 18) {
        groups.afternoon.push(block)
      } else {
        groups.evening.push(block)
      }
    })

    return groups
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <SafeIcon icon={FiRefreshCw} className="w-8 h-8 text-slate-400 mx-auto mb-4 animate-spin" />
        <p className="text-slate-600">Loading your day...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-600 mb-4">{error}</p>
        <button
          onClick={loadTimeline}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  const groupedBlocks = groupBlocksByTimeOfDay(timeline.blocks)
  const timeGroups = [
    { name: 'Morning', key: 'morning', blocks: groupedBlocks.morning },
    { name: 'Midday', key: 'midday', blocks: groupedBlocks.midday },
    { name: 'Afternoon', key: 'afternoon', blocks: groupedBlocks.afternoon },
    { name: 'Evening', key: 'evening', blocks: groupedBlocks.evening }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-slate-900">Today</h1>
          <p className="text-slate-600">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <button
          onClick={loadTimeline}
          className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <SafeIcon icon={FiRefreshCw} className="w-5 h-5" />
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {timeGroups.map(group => (
          <motion.div
            key={group.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {group.blocks.length > 0 && (
              <>
                <h2 className="text-lg font-medium text-slate-900 mb-4">{group.name}</h2>
                <div className="space-y-3">
                  {group.blocks.map((block, index) => (
                    <BlockCard
                      key={`${block.ref_type}-${block.ref_id}-${index}`}
                      block={block}
                      onComplete={handleCompleteTask}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Unscheduled Tasks */}
      {timeline.unscheduledTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-6"
        >
          <h2 className="text-lg font-medium text-amber-900 mb-4">Unscheduled Tasks</h2>
          <div className="space-y-2">
            {timeline.unscheduledTasks.map(task => (
              <div key={task.id} className="text-amber-800">
                • {task.title}
              </div>
            ))}
          </div>
          <p className="text-sm text-amber-700 mt-4">
            These tasks couldn't fit in today's schedule. Consider moving some to tomorrow or adjusting their duration.
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default TodayView