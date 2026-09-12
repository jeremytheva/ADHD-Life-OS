import React, { useCallback, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import LoadErrorState from '../../common/LoadErrorState'
import OperationErrorState from '../../common/OperationErrorState'
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
  const [hasLoaded, setHasLoaded] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [operationError, setOperationError] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [quickCaptureProjectId, setQuickCaptureProjectId] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [selectedProject, setSelectedProject] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showQuickCapture, setShowQuickCapture] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const latestProjectsRequestRef = useRef(0)
  const mutationOwnerRef = useRef(null)

  getModePreferences(currentMode.id)
  const mutationPending = Boolean(pendingAction)

  const loadProjects = useCallback(async () => {
    const requestId = latestProjectsRequestRef.current + 1
    latestProjectsRequestRef.current = requestId

    try {
      setLoading(true)
      setLoadError(null)
      const data = await projectService.getProjects()
      const filteredData = filterByMode(data, 'project')

      const stats = {}
      for (const project of filteredData) {
        stats[project.id] = await projectService.getProjectStats(project.id)
      }

      if (requestId !== latestProjectsRequestRef.current) return true

      setProjects(filteredData)
      const quickCaptureProject = filteredData.find((project) => project.title === '📥 Quick Capture')
      setQuickCaptureProjectId(quickCaptureProject?.id || null)
      setProjectStats(stats)
      setHasLoaded(true)
      return true
    } catch (error) {
      if (requestId !== latestProjectsRequestRef.current) return true
      console.error('Error loading projects:', error)
      setLoadError(error)
      return false
    } finally {
      if (requestId === latestProjectsRequestRef.current) {
        setLoading(false)
      }
    }
  }, [filterByMode])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleQuickCapture = async (items) => {
    if (mutationOwnerRef.current !== null) return { savedCount: 0, remainingItems: items }

    const mutationOwner = { type: 'quick-capture' }
    mutationOwnerRef.current = mutationOwner
    const acceptedItems = [...items]
    setOperationError(null)
    setPendingAction('quick-capture')
    let projectId = projects.find((project) => project.title === '📥 Quick Capture')?.id || quickCaptureProjectId
    let savedCount = 0

    try {
      if (!projectId) {
        const quickProject = await projectService.createProject({
          title: '📥 Quick Capture',
          description: 'Tasks captured quickly without overthinking',
          color: 'green',
          icon: '📥',
          status: 'active',
          mode: currentMode.id !== 'all' ? currentMode.id : null
        })
        projectId = quickProject.id
        setQuickCaptureProjectId(projectId)
      }

      for (const item of acceptedItems) {
        await projectService.createTask(projectId, {
          title: item,
          description: '',
          estimated_duration: 30,
          is_essential: false
        })
        savedCount += 1
      }
    } catch (error) {
      console.error('Error in quick capture:', error)
      const remainingItems = acceptedItems.slice(savedCount)
      await loadProjects()

      if (projectId) {
        setOperationError(
          `${savedCount} of ${acceptedItems.length} quick-capture tasks were saved before the interruption. Only the unsaved tasks remain in the capture window, so retrying will not duplicate the saved tasks.`
        )
      } else {
        setOperationError('We couldn’t create the Quick Capture project. None of these tasks were saved, and your list is still available to retry.')
      }

      return { savedCount, remainingItems }
    } finally {
      if (mutationOwnerRef.current === mutationOwner) {
        mutationOwnerRef.current = null
        setPendingAction(null)
      }
    }

    setShowQuickCapture(false)
    const refreshed = await loadProjects()
    if (!refreshed) {
      setOperationError(`All ${acceptedItems.length} quick-capture tasks were saved, but the project list could not refresh. Reload Projects before adding the same tasks again.`)
      return { savedCount, remainingItems: [] }
    }

    try {
      const updatedProject = await projectService.getProject(projectId)
      setSelectedProject(updatedProject)
    } catch (refreshError) {
      console.error('Error opening completed quick capture:', refreshError)
      setOperationError(`All ${acceptedItems.length} quick-capture tasks were saved, but the project view could not open. Reload Projects before adding the same tasks again.`)
    }

    return { savedCount, remainingItems: [] }
  }

  const handleCreateProject = async (projectData) => {
    if (mutationOwnerRef.current !== null) return

    const mutationOwner = { type: 'create' }
    mutationOwnerRef.current = mutationOwner
    const acceptedProjectData = { ...projectData }
    setOperationError(null)
    setPendingAction('create')
    try {
      await projectService.createProject({
        ...acceptedProjectData,
        mode: currentMode.id !== 'all' ? currentMode.id : null
      })
      setShowForm(false)
      setEditingProject(null)
      const refreshed = await loadProjects()
      if (!refreshed) {
        setOperationError('The project was created, but the project list could not refresh. Reload Projects before creating it again.')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      setOperationError('We couldn’t create that project. The project form is still open and your entries have not been discarded.')
    } finally {
      if (mutationOwnerRef.current === mutationOwner) {
        mutationOwnerRef.current = null
        setPendingAction(null)
      }
    }
  }

  const handleUpdateProject = async (projectData) => {
    if (mutationOwnerRef.current !== null || !editingProject) return

    const projectId = editingProject.id
    const mutationOwner = { type: 'update', id: projectId }
    mutationOwnerRef.current = mutationOwner
    const acceptedProjectData = { ...projectData }
    setOperationError(null)
    setPendingAction(`update:${projectId}`)
    try {
      await projectService.updateProject(projectId, acceptedProjectData)
      setShowForm(false)
      setEditingProject(null)
      const refreshed = await loadProjects()
      if (!refreshed) {
        setOperationError('The project changes were saved, but the project list could not refresh. Reload Projects before editing it again.')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      setOperationError('We couldn’t save those project changes. The project form is still open so you can try again.')
    } finally {
      if (mutationOwnerRef.current === mutationOwner) {
        mutationOwnerRef.current = null
        setPendingAction(null)
      }
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (mutationOwnerRef.current !== null) return
    if (!window.confirm('Are you sure you want to delete this project? All tasks and subtasks will be deleted.')) return

    const mutationOwner = { type: 'delete', id: projectId }
    mutationOwnerRef.current = mutationOwner
    setOperationError(null)
    setPendingAction(`delete:${projectId}`)
    try {
      await projectService.deleteProject(projectId)
      const refreshed = await loadProjects()
      if (!refreshed) {
        setOperationError('The project was deleted, but the project list could not refresh. Reload Projects before taking another action on the stale entry.')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      setOperationError('We couldn’t delete that project. It has not been removed from your project list.')
    } finally {
      if (mutationOwnerRef.current === mutationOwner) {
        mutationOwnerRef.current = null
        setPendingAction(null)
      }
    }
  }

  const handleArchiveProject = async (projectId) => {
    if (mutationOwnerRef.current !== null) return

    const mutationOwner = { type: 'archive', id: projectId }
    mutationOwnerRef.current = mutationOwner
    setOperationError(null)
    setPendingAction(`archive:${projectId}`)
    try {
      await projectService.updateProject(projectId, { status: 'archived' })
      const refreshed = await loadProjects()
      if (!refreshed) {
        setOperationError('The project was archived, but the project list could not refresh. Reload Projects before acting on the stale entry.')
      }
    } catch (error) {
      console.error('Error archiving project:', error)
      setOperationError('We couldn’t archive that project. It is still active and has not been removed from this list.')
    } finally {
      if (mutationOwnerRef.current === mutationOwner) {
        mutationOwnerRef.current = null
        setPendingAction(null)
      }
    }
  }

  const handleEditProject = (project) => {
    if (mutationOwnerRef.current !== null) return
    setOperationError(null)
    setEditingProject(project)
    setShowForm(true)
  }

  const handleApplyTemplate = async (template, type) => {
    if (type !== 'project' || mutationOwnerRef.current !== null) return

    const mutationOwner = { type: 'template' }
    mutationOwnerRef.current = mutationOwner
    setOperationError(null)
    setPendingAction('template')
    let newProject = null
    let createdTasks = 0
    let createdSubtasks = 0
    const totalTasks = template.tasks?.length || 0
    const totalSubtasks = template.tasks?.reduce(
      (total, task) => total + (task.subtasks?.length || 0),
      0
    ) || 0

    try {
      newProject = await projectService.createProject({
        title: template.name,
        description: template.description,
        color: template.color,
        icon: template.icon,
        status: 'active',
        mode: currentMode.id !== 'all' ? currentMode.id : null
      })

      if (template.tasks?.length) {
        for (const taskTemplate of template.tasks) {
          const task = await projectService.createTask(newProject.id, {
            title: taskTemplate.title,
            description: taskTemplate.description || '',
            estimated_duration: taskTemplate.estimated_duration || 30,
            is_essential: taskTemplate.is_essential || false
          })
          createdTasks += 1

          if (taskTemplate.subtasks?.length) {
            for (const subtaskTemplate of taskTemplate.subtasks) {
              await projectService.createSubtask(task.id, {
                title: subtaskTemplate.title,
                description: subtaskTemplate.description || '',
                estimated_duration: subtaskTemplate.estimated_duration || null
              })
              createdSubtasks += 1
            }
          }
        }
      }
    } catch (error) {
      console.error('Error applying template:', error)

      if (!newProject) {
        setOperationError('We couldn’t create the project for that template. Nothing from the template was saved, so it is safe to try again.')
        return
      }

      setShowTemplates(false)
      const refreshed = await loadProjects()
      if (refreshed) {
        try {
          const partialProject = await projectService.getProject(newProject.id)
          setSelectedProject(partialProject)
        } catch (refreshError) {
          console.error('Error opening partially applied template:', refreshError)
        }
      }

      setOperationError(
        `The project was created, but the template was only partly applied: ${createdTasks} of ${totalTasks} tasks and ${createdSubtasks} of ${totalSubtasks} subtasks were saved. Do not apply the template again because that can duplicate the saved items. Open the project and finish the missing steps manually.`
      )
      return
    } finally {
      if (mutationOwnerRef.current === mutationOwner) {
        mutationOwnerRef.current = null
        setPendingAction(null)
      }
    }

    setShowTemplates(false)
    const refreshed = await loadProjects()
    if (!refreshed) {
      setOperationError('The template was fully saved, but the project list could not refresh. Reload Projects before applying the same template again.')
    }
  }

  const getTotalStats = () => {
    const total = { projects: projects.length, tasks: 0, completed: 0, completion: 0 }
    Object.values(projectStats).forEach((stats) => {
      if (stats) {
        total.tasks += stats.total_tasks
        total.completed += stats.completed_tasks
      }
    })
    if (total.tasks > 0) total.completion = Math.round((total.completed / total.tasks) * 100)
    return total
  }

  const totalStats = getTotalStats()

  if (loading && !hasLoaded) {
    return (
      <div className="p-6">
        <div
          className="bg-white rounded-lg border border-slate-200 p-8 text-center"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-busy="true"
        >
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"
            aria-hidden="true"
          ></div>
          <p className="text-slate-600">Loading your projects...</p>
        </div>
      </div>
    )
  }

  if (loadError && !hasLoaded) {
    return (
      <div className="p-6">
        <LoadErrorState
          title="We couldn’t load your projects"
          message="Your projects and tasks have not been removed. Please try loading them again."
          onRetry={loadProjects}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" aria-busy={loading || mutationPending}>
      {loading && (
        <p className="sr-only" role="status" aria-live="polite">
          Refreshing projects...
        </p>
      )}
      {mutationPending && (
        <p className="sr-only" role="status" aria-live="polite">
          Updating projects...
        </p>
      )}

      {currentMode.id !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${currentMode.gradient} text-white rounded-lg p-4`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentMode.icon}</span>
            <div>
              <div className="font-medium">Viewing {currentMode.label} Projects</div>
              <div className="text-xs text-white text-opacity-90">Showing only {currentMode.label.toLowerCase()}-related projects</div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600 mt-1">Organize your goals into manageable steps</p>
        </div>
        <div className="flex items-center gap-2">
          <button disabled={mutationPending} onClick={() => { if (mutationOwnerRef.current !== null) return; setOperationError(null); setShowQuickCapture(true) }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
            <SafeIcon icon={FiZap} className="w-4 h-4" /> Quick Capture
          </button>
          <button disabled={mutationPending} onClick={() => { if (mutationOwnerRef.current !== null) return; setOperationError(null); setShowTemplates(true) }} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
            <SafeIcon icon={FiBookOpen} className="w-4 h-4" /> Templates
          </button>
          <button disabled={mutationPending} onClick={() => { if (mutationOwnerRef.current !== null) return; setOperationError(null); setShowForm(true) }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
            <SafeIcon icon={FiPlus} className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {loadError && !operationError && (
        <LoadErrorState
          title="We couldn’t refresh your projects"
          message="Your existing project list is still available. Try refreshing again before relying on new changes."
          onRetry={loadProjects}
        />
      )}
      <OperationErrorState message={operationError} onDismiss={() => setOperationError(null)} />

      {projects.length === 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0"><SafeIcon icon={FiZap} className="w-6 h-6 text-white" /></div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-2">🧠 Brain Dump First, Organize Later!</h3>
              <p className="text-green-800 mb-4">Feeling overwhelmed? Use <strong>Quick Capture</strong> to dump all your tasks out of your head first. Don't worry about organizing - just get everything written down!</p>
              <button disabled={mutationPending} onClick={() => { if (mutationOwnerRef.current !== null) return; setOperationError(null); setShowQuickCapture(true) }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"><SafeIcon icon={FiZap} className="w-4 h-4" /> Start Brain Dump</button>
            </div>
          </div>
        </motion.div>
      )}

      {projects.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center gap-3 mb-4"><SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-purple-600" /><h2 className="text-lg font-bold text-slate-900">Your Progress</h2></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center"><div className="text-3xl font-bold text-purple-600">{totalStats.projects}</div><div className="text-sm text-slate-600">Active Projects</div></div>
            <div className="bg-white rounded-lg p-4 text-center"><div className="text-3xl font-bold text-blue-600">{totalStats.tasks}</div><div className="text-sm text-slate-600">Total Tasks</div></div>
            <div className="bg-white rounded-lg p-4 text-center"><div className="text-3xl font-bold text-green-600">{totalStats.completed}</div><div className="text-sm text-slate-600">Completed</div></div>
            <div className="bg-white rounded-lg p-4 text-center"><div className="text-3xl font-bold text-indigo-600">{totalStats.completion}%</div><div className="text-sm text-slate-600">Overall Progress</div></div>
          </div>
        </motion.div>
      )}

      {projects.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">{projects.length} project{projects.length !== 1 ? 's' : ''}{currentMode.id !== 'all' && <span className="ml-2 text-xs text-slate-500">(filtered by {currentMode.label} mode)</span>}</div>
          <div role="group" aria-label="Project view" className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button type="button" onClick={() => setViewMode('grid')} aria-label="Grid view" aria-pressed={viewMode === 'grid'} className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}><SafeIcon icon={FiGrid} className="w-4 h-4" /></button>
            <button type="button" onClick={() => setViewMode('list')} aria-label="List view" aria-pressed={viewMode === 'list'} className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}><SafeIcon icon={FiList} className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {projects.length > 0 ? (
        <div role="list" aria-label="Projects" className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {projects.map((project, index) => (
            <motion.div role="listitem" key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <ProjectCard project={project} stats={projectStats[project.id]} onClick={() => { if (mutationOwnerRef.current === null) setSelectedProject(project) }} onEdit={() => handleEditProject(project)} onDelete={() => handleDeleteProject(project.id)} onArchive={() => handleArchiveProject(project.id)} pending={mutationPending} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"><SafeIcon icon={FiGrid} className="w-8 h-8 text-purple-600" /></div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">{currentMode.id !== 'all' ? `No ${currentMode.label.toLowerCase()} projects yet` : 'No projects yet'}</h3>
          <p className="text-slate-600 mb-4">Break down overwhelming tasks into manageable projects</p>
          <div className="flex gap-3 justify-center">
            <button disabled={mutationPending} onClick={() => { if (mutationOwnerRef.current !== null) return; setOperationError(null); setShowQuickCapture(true) }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"><SafeIcon icon={FiZap} className="w-4 h-4" /> Quick Brain Dump</button>
            <button disabled={mutationPending} onClick={() => { if (mutationOwnerRef.current !== null) return; setOperationError(null); setShowForm(true) }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50">Create Project</button>
            <button disabled={mutationPending} onClick={() => { if (mutationOwnerRef.current !== null) return; setOperationError(null); setShowTemplates(true) }} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50">Browse Templates</button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showQuickCapture && <QuickCaptureModal onSave={handleQuickCapture} onCancel={() => { if (mutationOwnerRef.current !== null) return; setShowQuickCapture(false) }} />}
        {showForm && <ProjectForm project={editingProject} onSave={editingProject ? handleUpdateProject : handleCreateProject} onCancel={() => { if (mutationOwnerRef.current !== null) return; setShowForm(false); setEditingProject(null) }} />}
        {selectedProject && <ProjectDetailView project={selectedProject} onClose={() => { if (mutationOwnerRef.current !== null) return; setSelectedProject(null) }} onUpdate={loadProjects} />}
        {showTemplates && <TemplateLibrary onApplyTemplate={handleApplyTemplate} onClose={() => { if (mutationOwnerRef.current !== null) return; setShowTemplates(false) }} />}
      </AnimatePresence>
    </div>
  )
}

export default ProjectsList
