import React, { useState } from 'react'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import ChoreChecklist from './ChoreChecklist'
import ChoreDetailView from './ChoreDetailView'
import HouseworkSetup from './HouseworkSetup'

const { FiPlus } = FiIcons

const HomeModeTaskContainer = () => {
  const [selectedTask, setSelectedTask] = useState(null)
  const [showSetup, setShowSetup] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTaskComplete = () => {
    setRefreshKey(prev => prev + 1)
    setSelectedTask(null)
  }

  const handleSetupComplete = ({ close = true } = {}) => {
    setRefreshKey(prev => prev + 1)
    if (close) setShowSetup(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowSetup(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"><SafeIcon icon={FiPlus} className="w-4 h-4" aria-hidden="true" /><span>Add Chores</span></button>
      </div>

      <ChoreChecklist key={refreshKey} onSelectTask={setSelectedTask} mode="home" />

      {selectedTask && <ChoreDetailView task={selectedTask} onClose={() => setSelectedTask(null)} onComplete={handleTaskComplete} />}
      {showSetup && <HouseworkSetup onClose={() => setShowSetup(false)} onComplete={handleSetupComplete} />}
    </div>
  )
}

export default HomeModeTaskContainer
