import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ModeProvider } from './contexts/ModeContext'
import Layout from './components/Layout'
import NCBAuth from './components/auth/NCBAuth'
import ProfileSelector from './components/auth/ProfileSelector'
import OnboardingFlow from './components/onboarding/OnboardingFlow'
import { onboardingService } from './services/onboardingService'

// Pages
import TodayView from './components/today/TodayView'
import TaskList from './components/tasks/TaskList'
import RoutineList from './components/routines/RoutineList'
import Settings from './components/settings/Settings'
import Housework from './pages/Housework'
import Inbox from './pages/Inbox'
import Projects from './pages/Projects'

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <div className="text-slate-600">Loading...</div>
    </div>
  </div>
)

const ProtectedAppShell = ({ showOnboarding, onOnboardingComplete }) => {
  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={onOnboardingComplete}
        onSkip={onOnboardingComplete}
      />
    )
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

const AppRoutes = () => {
  const { user, loading, refreshSession, clearAuthState } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isPublicAuthRoute = location.pathname === '/login' || location.pathname === '/register'
  const [checkingSession, setCheckingSession] = useState(true)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    let isMounted = true

    const verifySession = async () => {
      setCheckingSession(true)

      try {
        const currentUser = await refreshSession()

        if (!isMounted) return

        if (!currentUser) {
          clearAuthState()
          if (!isPublicAuthRoute) {
            navigate('/login', { replace: true, state: { from: location } })
          }
        }
      } catch (error) {
        if (!isMounted) return

        clearAuthState()
        if (!isPublicAuthRoute) {
          navigate('/login', { replace: true, state: { from: location } })
        }
      } finally {
        if (isMounted) {
          setCheckingSession(false)
        }
      }
    }

    verifySession()

    return () => {
      isMounted = false
    }
  }, [clearAuthState, isPublicAuthRoute, location, navigate, refreshSession])

  useEffect(() => {
    if (checkingSession) return

    if (user) {
      const completed = onboardingService.hasCompletedOnboarding()
      setShowOnboarding(!completed)
    } else {
      setShowOnboarding(false)
    }

    setCheckingOnboarding(false)
  }, [checkingSession, user])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  if (loading || checkingSession || checkingOnboarding) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <NCBAuth mode="login" />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <NCBAuth mode="register" />} />
      {import.meta.env.DEV && (
        <Route path="/dev-profiles" element={<ProfileSelector />} />
      )}
      <Route
        element={
          user ? (
            <ProtectedAppShell
              showOnboarding={showOnboarding}
              onOnboardingComplete={handleOnboardingComplete}
            />
          ) : (
            <Navigate to="/login" replace state={{ from: location }} />
          )
        }
      >
        <Route path="/" element={<TodayView />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/routines" element={<RoutineList />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/housework" element={<Housework />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace state={{ from: location }} />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <ModeProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ModeProvider>
    </AuthProvider>
  )
}

export default App
