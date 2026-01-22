import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import SubtaskList from './SubtaskList'

const {
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiTrash2,
  FiPlus,
  FiStar
} = FiIcons

const TaskItem = ({
  task,
  index,
  onComplete,
  onDelete,
  onUpdate,
  onCompleteSubtask
}) => {
  const [expanded, setExpanded] = useState(false)
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)

  const completedSubtasks = task.subtasks?.filter(st => st.is_completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0
  const hasSubtasks = totalSubtasks > 0
  const allSubtasksComplete = hasSubtasks && completedSubtasks === totalSubtasks

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-lg border-2 transition-all ${
        allSubtasksComplete
          ? 'border-green-300 bg-green-50'
          : 'border-slate-200 hover:border-blue-300'
      }`}
    >
      {/* Main Task */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onComplete}
            className={`mt-1 p-2 rounded-lg transition-colors ${
              allSubtasksComplete
                ? 'text-green-600 hover:bg-green-100'
                : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <SafeIcon icon={FiCheck} className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 mb-1">
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-slate-600">{task.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {task.is_essential && (
                  <span
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"
                    title="Essential task"
                  >
                    <SafeIcon icon={FiStar} className="w-3 h-3" />
                    Essential
                  </span>
                )}
                <button
                  onClick={onDelete}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Task Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-3">
              {task.estimated_duration && (
                <div className="flex items-center gap-1">
                  <SafeIcon icon={FiClock} className="w-4 h-4" />
                  <span>{task.estimated_duration} min</span>
                </div>
              )}
              {hasSubtasks && (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-purple-600">
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                  <span>subtasks done</span>
                </div>
              )}
            </div>

            {/* Progress Bar for Subtasks */}
            {hasSubtasks && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>Subtask Progress</span>
                  <span>
                    {Math.round((completedSubtasks / totalSubtasks) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(completedSubtasks / totalSubtasks) * 100}%`
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-purple-600 rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Expand/Collapse Button */}
            <div className="flex items-center gap-2">
              {hasSubtasks && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  <SafeIcon
                    icon={expanded ? FiChevronDown : FiChevronRight}
                    className="w-4 h-4"
                  />
                  {expanded ? 'Hide' : 'Show'} Subtasks ({totalSubtasks})
                </button>
              )}
              {!hasSubtasks && (
                <button
                  onClick={() => setShowSubtaskInput(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                  Add Subtasks
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtasks */}
      <AnimatePresence>
        {(expanded || showSubtaskInput) && (
          <SubtaskList
            taskId={task.id}
            subtasks={task.subtasks || []}
            onCompleteSubtask={onCompleteSubtask}
            showInput={showSubtaskInput}
            onHideInput={() => setShowSubtaskInput(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default TaskItem