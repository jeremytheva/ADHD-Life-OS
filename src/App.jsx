import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProfileSelector from './components/auth/ProfileSelector'
import TodayView from './components/today/TodayView'
import TaskList from './components/tasks/TaskList'
import RoutineList from './components/routines/RoutineList'
import Settings from './components/settings/Settings'
import Housework from './pages/Housework'

const AppRoutes = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-slate-600">Loading...</div>
        </div>
      </div>
    )
  }

  // Show profile selector if no user is logged in
  if (!user) {
    return <ProfileSelector />
  }

  // Show main app if user is logged in
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TodayView />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/routines" element={<RoutineList />} />
        <Route path="/housework" element={<Housework />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App