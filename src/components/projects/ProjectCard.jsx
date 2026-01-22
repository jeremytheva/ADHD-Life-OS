import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiMoreVertical, FiEdit2, FiTrash2, FiArchive, FiChevronRight } = FiIcons

const ProjectCard = ({ project, stats, onClick, onEdit, onDelete, onArchive }) => {
  const [showMenu, setShowMenu] = React.useState(false)

  const colorClasses = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
    pink: 'from-pink-400 to-pink-600',
    yellow: 'from-yellow-400 to-yellow-600',
    red: 'from-red-400 to-red-600',
    teal: 'from-teal-400 to-teal-600'
  }

  const bgColorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    pink: 'bg-pink-50 border-pink-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    teal: 'bg-teal-50 border-teal-200'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-lg border-2 overflow-hidden cursor-pointer ${bgColorClasses[project.color]}`}
    >
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${colorClasses[project.color]} p-4 text-white`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">{project.icon}</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{project.title}</h3>
              {project.description && (
                <p className="text-sm text-white text-opacity-90 line-clamp-1">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiMoreVertical} className="w-5 h-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                  >
                    <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                    Edit Project
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onArchive()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                  >
                    <SafeIcon icon={FiArchive} className="w-4 h-4" />
                    Archive
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {stats && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{stats.completion_percentage}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.completion_percentage}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="p-4" onClick={onClick}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-slate-900">{stats.total_tasks}</div>
              <div className="text-xs text-slate-600">Tasks</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">{stats.completed_tasks}</div>
              <div className="text-xs text-slate-600">Done</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-600">{stats.total_subtasks}</div>
              <div className="text-xs text-slate-600">Subtasks</div>
            </div>
          </div>

          {stats.estimated_time_remaining > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200 text-center">
              <div className="text-sm text-slate-600">
                ⏱️ ~{Math.round(stats.estimated_time_remaining / 60)} hours remaining
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Details */}
      <div
        onClick={onClick}
        className="p-3 border-t border-slate-200 hover:bg-white hover:bg-opacity-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-slate-700"
      >
        <span>View Details</span>
        <SafeIcon icon={FiChevronRight} className="w-4 h-4" />
      </div>
    </motion.div>
  )
}

export default ProjectCard