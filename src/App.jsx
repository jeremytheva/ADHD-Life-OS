import React, { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AUTH_STATUS, AuthProvider, useAuth } from './contexts/AuthContext'
import { ModeProvider } from './contexts/ModeContext'
import Layout from './components/Layout'
import ProfileSelector from './components/auth/ProfileSelector'
import AppErrorBoundary from './components/common/AppErrorBoundary'
import { onboardingService } from './services/onboardingService'
import { loadOnboardingState } from './services/onboardingState'
import TodayView from './components/today/TodayView'

const NCBAuth = lazy(() => import('./components/auth/NCBAuth'))
const OnboardingFlow = lazy(() => import('./components/onboarding/OnboardingFlow'))
const TaskList = lazy(() => import('./components/tasks/TaskList'))
const RoutineList = lazy(() => import('./components/routines/RoutineList'))
const Settings = lazy(() => import('./components/settings/Settings'))
const Housework = lazy(() => import('./pages/Housework'))
const Inbox = lazy(() => import('./pages/Inbox'))
const Projects = lazy(() => import('./pages/Projects'))

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div
      className="text-center"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
    >
      <div
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        aria-hidden="true"
      ></div>
      <div className="text-slate-600">Loading...</div>
    </div>
  </div>
)

const LazyRoute = ({ children }) => (
  <Suspense fallback={<LoadingScreen />}>
    {children}
  </Suspense>
)

const ProtectedAppShell = ({ enabledModules, showOnboarding, onOnboardingComplete }) => {
  if (showOnboarding) {
    return (
      <LazyRoute>
        <OnboardingFlow
          onComplete={onOnboardingComplete}
          onSkip={onOnboardingComplete}
        />
      </LazyRoute>
    )
  }

  return (
    <AppErrorBoundary>
      <Layout enabledModules={enabledModules}>
        <Outlet />
      </Layout>
    </AppErrorBoundary>
  )
}

const AuthErrorScreen = ({ error, onRetry }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="max-w-md rounded-lg bg-white p-6 text-center shadow">
      <h1 className="text-xl font-semibold text-slate-900">We couldn't verify your session</h1>
      <p className="mt-2 text-slate-600">{error?.message || 'Please check your connection and try again.'}</p>
      <button type="button" onClick={onRetry} className="mt-5 rounded bg-blue-600 px-4 py-2 text-white">Try again</button>
    </div>
  </div>
)

const AppRoutes = () => {
  const { status, error, retrySessionVerification } = useAuth()
  const location = useLocation()
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [enabledModules, setEnabledModules] = useState([])

  useEffect(() => {
    if (status === AUTH_STATUS.INITIALIZING) return
    if (status !== AUTH_STATUS.AUTHENTICATED) {
      setShowOnboarding(false)
      setEnabledModules([])
      setCheckingOnboarding(false)
      return
    }

    let active = true
    loadOnboardingState(onboardingService.getOnboardingData)
      .then(({ enabledModules: savedModules, showOnboarding: shouldShowOnboarding }) => {
        if (!active) return
        setEnabledModules(savedModules)
        setShowOnboarding(shouldShowOnboarding)
      })
      .catch((error) => {
        console.error('Error checking onboarding status:', error)
        if (active) setShowOnboarding(true)
      })
      .finally(() => active && setCheckingOnboarding(false))
    return () => { active = false }
  }, [status])

  const handleOnboardingComplete = (onboardingData) => {
    setEnabledModules(onboardingData?.enabledModules ?? [])
    setShowOnboarding(false)
  }

  if (status === AUTH_STATUS.INITIALIZING || checkingOnboarding) {
    return <LoadingScreen />
  }

  if (status === AUTH_STATUS.ERROR) {
    return <AuthErrorScreen error={error} onRetry={retrySessionVerification} />
  }

  const isAuthenticated = status === AUTH_STATUS.AUTHENTICATED
  const isAnonymous = status === AUTH_STATUS.ANONYMOUS

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LazyRoute><NCBAuth mode="login" /></LazyRoute>}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LazyRoute><NCBAuth mode="register" /></LazyRoute>}
      />
      {import.meta.env.DEV && (
        <Route path="/dev-profiles" element={<ProfileSelector />} />
      )}
      <Route
        element={
          isAuthenticated ? (
            <ProtectedAppShell
              enabledModules={enabledModules}
              showOnboarding={showOnboarding}
              onOnboardingComplete={handleOnboardingComplete}
            />
          ) : isAnonymous ? (
            <Navigate to="/login" replace state={{ from: location }} />
          ) : (
            <LoadingScreen />
          )
        }
      >
        <Route path="/" element={<TodayView />} />
        <Route path="/tasks" element={<LazyRoute><TaskList /></LazyRoute>} />
        <Route path="/routines" element={<LazyRoute><RoutineList /></LazyRoute>} />
        <Route path="/projects" element={<LazyRoute><Projects /></LazyRoute>} />
        <Route path="/housework" element={<LazyRoute><Housework /></LazyRoute>} />
        <Route path="/inbox" element={<LazyRoute><Inbox /></LazyRoute>} />
        <Route path="/settings" element={<LazyRoute><Settings /></LazyRoute>} />
      </Route>
      <Route
        path="*"
        element={
          isAuthenticated ? <Navigate to="/" replace />
            : isAnonymous ? <Navigate to="/login" replace state={{ from: location }} />
              : <LoadingScreen />
        }
      />
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
