import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiMoreVertical, FiEdit2, FiTrash2, FiArchive, FiChevronRight } = FiIcons

const ProjectCard = ({ project, stats, onClick, onEdit, onDelete, onArchive }) => {
  const [showMenu, setShowMenu] = React.useState(false)
  const menuTriggerRef = React.useRef(null)
  const menuItemRefs = React.useRef([])

  React.useEffect(() => {
    if (showMenu) menuItemRefs.current[0]?.focus()
  }, [showMenu])

  const closeMenu = ({ restoreFocus = false } = {}) => {
    setShowMenu(false)
    if (restoreFocus) requestAnimationFrame(() => menuTriggerRef.current?.focus())
  }

  const handleMenuKeyDown = (event) => {
    const items = menuItemRefs.current.filter(Boolean)
    const currentIndex = items.indexOf(document.activeElement)

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeMenu({ restoreFocus: true })
      return
    }

    let nextIndex = null
    if (event.key === 'ArrowDown') nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length
    if (event.key === 'ArrowUp') nextIndex = currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = items.length - 1

    if (nextIndex !== null) {
      event.preventDefault()
      items[nextIndex]?.focus()
    }
  }

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

  const actions = [
    { label: 'Edit Project', icon: FiEdit2, onSelect: onEdit, className: 'text-slate-700 hover:bg-slate-100' },
    { label: 'Archive', icon: FiArchive, onSelect: onArchive, className: 'text-slate-700 hover:bg-slate-100' },
    { label: 'Delete Project', icon: FiTrash2, onSelect: onDelete, className: 'text-red-600 hover:bg-red-50' }
  ]

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-lg border-2 overflow-hidden ${bgColorClasses[project.color]}`}
    >
      <div className={`bg-gradient-to-r ${colorClasses[project.color]} p-4 text-white`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl" aria-hidden="true">{project.icon}</span>
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
              ref={menuTriggerRef}
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setShowMenu((open) => !open)
              }}
              aria-label={`Project actions for ${project.title}`}
              aria-expanded={showMenu}
              aria-haspopup="menu"
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiMoreVertical} className="w-5 h-5" aria-hidden="true" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(event) => {
                    event.stopPropagation()
                    closeMenu()
                  }}
                />
                <motion.div
                  role="menu"
                  aria-label={`Project actions for ${project.title}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-20"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={handleMenuKeyDown}
                >
                  {actions.map((action, index) => (
                    <button
                      ref={(element) => { menuItemRefs.current[index] = element }}
                      type="button"
                      role="menuitem"
                      key={action.label}
                      onClick={(event) => {
                        event.stopPropagation()
                        closeMenu()
                        action.onSelect()
                      }}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${action.className}`}
                    >
                      <SafeIcon icon={action.icon} className="w-4 h-4" aria-hidden="true" />
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </div>

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

      {stats && (
        <div className="p-4">
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

      <button
        type="button"
        onClick={onClick}
        aria-label={`View details for ${project.title}`}
        className="w-full p-3 border-t border-slate-200 hover:bg-white hover:bg-opacity-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-slate-700"
      >
        <span>View Details</span>
        <SafeIcon icon={FiChevronRight} className="w-4 h-4" aria-hidden="true" />
      </button>
    </motion.div>
  )
}

export default ProjectCard
