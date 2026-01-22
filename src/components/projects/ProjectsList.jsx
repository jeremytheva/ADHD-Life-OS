import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { projectService } from '../../services/projectService'
import { useMode } from '../../contexts/ModeContext'
import ProjectCard from './ProjectCard'
import ProjectDetailView from './ProjectDetailView'
import ProjectForm from './ProjectForm'
import QuickCaptureModal from './QuickCaptureModal'
import TemplateLibrary from '../templates/TemplateLibrary'

const {
  FiPlus,
  FiGrid,
  FiList,
  FiBookOpen,
  FiTrendingUp,
  FiZap
} = FiIcons

const ProjectsList = () => {
  const { currentMode, filterByMode, getModePreferences } = useMode()
  const [projects, setProjects] = useState([])
  const [projectStats, setProjectStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [selectedProject, setSelectedProject] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showQuickCapture, setShowQuickCapture] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  const modePrefs = getModePreferences(currentMode.id)

  useEffect(() => {
    loadProjects()
  }, [currentMode])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await projectService.getProjects()
      
      // Apply mode filtering
      const filteredData = filterByMode(data, 'project')
      
      setProjects(filteredData)

      // Load stats for each project
      const stats = {}
      for (const project of filteredData) {
        const projectStats = await projectService.getProjectStats(project.id)
        stats[project.id] = projectStats
      }
      setProjectStats(stats)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickCapture = async (items) => {
    try {
      // Create a new "Quick Capture" project if it doesn't exist
      let quickProject = projects.find((p) => p.title === '📥 Quick Capture')

      if (!quickProject) {
        quickProject = await projectService.createProject({
          title: '📥 Quick Capture',
          description: 'Tasks captured quickly without overthinking',
          color: 'green',
          icon: '📥',
          status: 'active',
          mode: currentMode.id !== 'all' ? currentMode.id : null
        })
      }

      // Add all captured items as tasks
      for (const item of items) {
        await projectService.createTask(quickProject.id, {
          title: item,
          description: '',
          estimated_duration: 30,
          is_essential: false
        })
      }

      setShowQuickCapture(false)
      await loadProjects()

      // Open the quick capture project
      const updatedProject = await projectService.getProject(quickProject.id)
      setSelectedProject(updatedProject)
    } catch (error) {
      console.error('Error in quick capture:', error)
    }
  }

  const handleCreateProject = async (projectData) => {
    try {
      // Auto-tag with current mode
      const projectWithMode = {
        ...projectData,
        mode: currentMode.id !== 'all' ? currentMode.id : null
      }
      
      await projectService.createProject(projectWithMode)
      setShowForm(false)
      setEditingProject(null)
      loadProjects()
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleUpdateProject = async (projectData) => {
    try {
      await projectService.updateProject(editingProject.id, projectData)
      setShowForm(false)
      setEditingProject(null)
      loadProjects()
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this project? All tasks and subtasks will be deleted.'
      )
    ) {
      return
    }

    try {
      await projectService.deleteProject(projectId)
      loadProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleArchiveProject = async (projectId) => {
    try {
      await projectService.updateProject(projectId, { status: 'archived' })
      loadProjects()
    } catch (error) {
      console.error('Error archiving project:', error)
    }
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setShowForm(true)
  }

  const handleApplyTemplate = async (template, type) => {
    if (type !== 'project') return

    try {
      const projectData = {
        title: template.name,
        description: template.description,
        color: template.color,
        icon: template.icon,
        status: 'active',
        mode: currentMode.id !== 'all' ? currentMode.id : null
      }

      const newProject = await projectService.createProject(projectData)

      if (template.tasks && template.tasks.length > 0) {
        for (const taskTemplate of template.tasks) {
          const task = await projectService.createTask(newProject.id, {
            title: taskTemplate.title,
            description: taskTemplate.description || '',
            estimated_duration: taskTemplate.estimated_duration || 30,
            is_essential: taskTemplate.is_essential || false
          })

          if (taskTemplate.subtasks && taskTemplate.subtasks.length > 0) {
            for (const subtaskTemplate of taskTemplate.subtasks) {
              await projectService.createSubtask(task.id, {
                title: subtaskTemplate.title,
                description: subtaskTemplate.description || '',
                estimated_duration: subtaskTemplate.estimated_duration || null
              })
            }
          }
        }
      }

      setShowTemplates(false)
      loadProjects()
    } catch (error) {
      console.error('Error applying template:', error)
    }
  }

  const getTotalStats = () => {
    const total = {
      projects: projects.length,
      tasks: 0,
      completed: 0,
      completion: 0
    }

    Object.values(projectStats).forEach((stats) => {
      if (stats) {
        total.tasks += stats.total_tasks
        total.completed += stats.completed_tasks
      }
    })

    if (total.tasks > 0) {
      total.completion = Math.round((total.completed / total.tasks) * 100)
    }

    return total
  }

  const totalStats = getTotalStats()

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Mode Context Banner */}
      {currentMode.id !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${currentMode.gradient} text-white rounded-lg p-4`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentMode.icon}</span>
            <div>
              <div className="font-medium">
                Viewing {currentMode.label} Projects
              </div>
              <div className="text-xs text-white text-opacity-90">
                Showing only {currentMode.label.toLowerCase()}-related projects
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600 mt-1">
            Organize your goals into manageable steps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickCapture(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiZap} className="w-4 h-4" />
            Quick Capture
          </button>
          <button
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiBookOpen} className="w-4 h-4" />
            Templates
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Quick Capture Tip */}
      {projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <SafeIcon icon={FiZap} className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-2">
                🧠 Brain Dump First, Organize Later!
              </h3>
              <p className="text-green-800 mb-4">
                Feeling overwhelmed? Use <strong>Quick Capture</strong> to dump
                all your tasks out of your head first. Don't worry about
                organizing - just get everything written down!
              </p>
              <button
                onClick={() => setShowQuickCapture(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <SafeIcon icon={FiZap} className="w-4 h-4" />
                Start Brain Dump
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Overall Stats */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-bold text-slate-900">Your Progress</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {totalStats.projects}
              </div>
              <div className="text-sm text-slate-600">Active Projects</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {totalStats.tasks}
              </div>
              <div className="text-sm text-slate-600">Total Tasks</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {totalStats.completed}
              </div>
              <div className="text-sm text-slate-600">Completed</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {totalStats.completion}%
              </div>
              <div className="text-sm text-slate-600">Overall Progress</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* View Mode Toggle */}
      {projects.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
            {currentMode.id !== 'all' && (
              <span className="ml-2 text-xs text-slate-500">
                (filtered by {currentMode.label} mode)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
              }`}
            >
              <SafeIcon icon={FiGrid} className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
              }`}
            >
              <SafeIcon icon={FiList} className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid/List */}
      {projects.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProjectCard
                project={project}
                stats={projectStats[project.id]}
                onClick={() => setSelectedProject(project)}
                onEdit={() => handleEditProject(project)}
                onDelete={() => handleDeleteProject(project.id)}
                onArchive={() => handleArchiveProject(project.id)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiGrid} className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {currentMode.id !== 'all'
              ? `No ${currentMode.label.toLowerCase()} projects yet`
              : 'No projects yet'
            }
          </h3>
          <p className="text-slate-600 mb-4">
            Break down overwhelming tasks into manageable projects
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowQuickCapture(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <SafeIcon icon={FiZap} className="w-4 h-4" />
              Quick Brain Dump
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Templates
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showQuickCapture && (
          <QuickCaptureModal
            onSave={handleQuickCapture}
            onCancel={() => setShowQuickCapture(false)}
          />
        )}

        {showForm && (
          <ProjectForm
            project={editingProject}
            onSave={editingProject ? handleUpdateProject : handleCreateProject}
            onCancel={() => {
              setShowForm(false)
              setEditingProject(null)
            }}
          />
        )}

        {selectedProject && (
          <ProjectDetailView
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onUpdate={loadProjects}
          />
        )}

        {showTemplates && (
          <TemplateLibrary
            onApplyTemplate={handleApplyTemplate}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProjectsList