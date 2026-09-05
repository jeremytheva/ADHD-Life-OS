import React, { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { getFocusableElements } from '../common/useModalDialog'
import { useAuth } from '../contexts/AuthContext'
import { useMode } from '../contexts/ModeContext'
import ModeSwitcher from './mode/ModeSwitcher'
import { gamificationService } from '../services/gamificationService'
import { getVisibleNavigationItems } from '../config/navigation'

const ModePreferences = lazy(() => import('./mode/ModePreferences'))
const AccessibilitySettings = lazy(() => import('./accessibility/AccessibilitySettings'))
const GamificationDashboard = lazy(() => import('./gamification/GamificationDashboard'))
const RewardShop = lazy(() => import('./gamification/RewardShop'))

const {
  FiCalendar,
  FiCheckSquare,
  FiRepeat,
  FiHome,
  FiInbox,
  FiGrid,
  FiSettings,
  FiLogOut,
  FiUser,
  FiAward,
  FiShoppingCart,
  FiEye,
  FiMenu,
  FiX
} = FiIcons

const iconByPath = {
  '/': FiCalendar, '/tasks': FiCheckSquare, '/routines': FiRepeat, '/projects': FiGrid,
  '/housework': FiHome, '/inbox': FiInbox, '/settings': FiSettings
}

const ModalLoadingFallback = () => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-40" role="status" aria-live="polite">
    <div className="rounded-lg bg-white px-5 py-4 text-sm text-slate-600 shadow-lg">
      Loading…
    </div>
  </div>
)

const SidebarContent = ({
  visibleNavItems,
  stats,
  currency,
  user,
  onOpenGamification,
  onOpenRewardShop,
  onOpenAccessibility,
  onSignOut,
  onNavigate,
  showCloseButton = false,
  onClose,
  closeButtonRef
}) => (
  <>
    <div className="p-6 border-b border-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ADHD Life-OS</h1>
          <p className="text-sm text-slate-500 mt-1">Your daily companion</p>
        </div>
        {showCloseButton && (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="-mr-2 -mt-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <SafeIcon icon={FiX} className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>

    <div className="p-4 border-b border-slate-200">
      <ModeSwitcher />
    </div>

    <div className="p-4 border-b border-slate-200">
      <button
        type="button"
        onClick={onOpenGamification}
        className="w-full bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-200 hover:shadow-md transition-all mb-3"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <SafeIcon icon={FiAward} className="w-4 h-4 text-purple-600" aria-hidden="true" />
            <span className="text-sm font-medium text-purple-900">
              Level {stats.level}
            </span>
          </div>
          <span className="text-xs text-purple-700">{stats.points} pts</span>
        </div>

        <div className="w-full bg-purple-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all"
            style={{
              width: `${Math.round((stats.xp / stats.xp_to_next_level) * 100)}%`
            }}
          />
        </div>

        {stats.current_streak > 0 && (
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-orange-600">
            <span>🔥</span>
            <span>{stats.current_streak}-day streak</span>
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={onOpenRewardShop}
        className="w-full bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-3 border border-yellow-200 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SafeIcon icon={FiShoppingCart} className="w-4 h-4 text-yellow-600" aria-hidden="true" />
            <span className="text-sm font-medium text-yellow-900">
              Reward Shop
            </span>
          </div>
          <div className="flex items-center gap-1 text-yellow-700">
            <span className="text-xs">💰</span>
            <span className="text-xs font-bold">{currency.coins}</span>
          </div>
        </div>
      </button>
    </div>

    <nav aria-label="Primary navigation" className="flex-1 p-4 space-y-1 overflow-y-auto">
      {visibleNavItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`
          }
        >
          <SafeIcon icon={item.icon} className="text-xl" aria-hidden="true" />
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>

    <div className="p-4 border-t border-slate-200 space-y-2">
      <button
        type="button"
        onClick={onOpenAccessibility}
        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <SafeIcon icon={FiEye} className="text-xl" aria-hidden="true" />
        <span className="font-medium text-sm">Accessibility</span>
      </button>

      <div className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 bg-slate-50 rounded-lg">
        <SafeIcon icon={FiUser} aria-hidden="true" />
        <span className="truncate flex-1">{user?.email}</span>
      </div>

      <button
        type="button"
        onClick={onSignOut}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <SafeIcon icon={FiLogOut} className="text-xl" aria-hidden="true" />
        <span className="font-medium">Switch Profile</span>
      </button>
    </div>
  </>
)

const Layout = ({ children, enabledModules = [] }) => {
  const { user, signOut } = useAuth()
  const { currentMode } = useMode()
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [showGamification, setShowGamification] = useState(false)
  const [showRewardShop, setShowRewardShop] = useState(false)
  const [showModePreferences, setShowModePreferences] = useState(false)
  const [showAccessibility, setShowAccessibility] = useState(false)
  const mobileMenuButtonRef = useRef(null)
  const mobileCloseButtonRef = useRef(null)
  const mobileNavigationRef = useRef(null)
  const stats = gamificationService.getUserStats()
  const currency = gamificationService.getCurrency()

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileNavOpen) return undefined

    mobileCloseButtonRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMobileNavOpen(false)
        window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus())
        return
      }

      if (event.key !== 'Tab') return

      const navigation = mobileNavigationRef.current
      if (!navigation) return

      const focusable = getFocusableElements(navigation)
      if (focusable.length === 0) {
        event.preventDefault()
        navigation.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !navigation.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !navigation.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileNavOpen])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const closeMobileNavigation = (restoreFocus = false) => {
    setMobileNavOpen(false)
    if (restoreFocus) {
      window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus())
    }
  }

  const visibleNavItems = getVisibleNavigationItems(enabledModules, currentMode.id).map((item) => ({ ...item, icon: iconByPath[item.path] }))
  const sidebarProps = {
    visibleNavItems,
    stats,
    currency,
    user,
    onOpenGamification: () => setShowGamification(true),
    onOpenRewardShop: () => setShowRewardShop(true),
    onOpenAccessibility: () => setShowAccessibility(true),
    onSignOut: handleSignOut
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900 focus:shadow-lg"
      >
        Skip to main content
      </a>

      <aside className="hidden min-h-screen w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent {...sidebarProps} />
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-app-navigation"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <SafeIcon icon={FiMenu} className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-slate-900">ADHD Life-OS</div>
            <div className="truncate text-xs text-slate-500">{currentMode.label} mode</div>
          </div>
        </header>

        <main id="main-content" tabIndex="-1" className="min-w-0 overflow-auto">
          {children}
        </main>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => closeMobileNavigation(true)}
            className="absolute inset-0 bg-black bg-opacity-40"
          />
          <aside
            ref={mobileNavigationRef}
            id="mobile-app-navigation"
            aria-label="Mobile application navigation"
            tabIndex={-1}
            className="relative z-10 flex h-full w-72 max-w-[calc(100vw-3rem)] flex-col bg-white shadow-xl"
          >
            <SidebarContent
              {...sidebarProps}
              showCloseButton
              closeButtonRef={mobileCloseButtonRef}
              onClose={() => closeMobileNavigation(true)}
              onNavigate={() => closeMobileNavigation(false)}
              onOpenGamification={() => {
                closeMobileNavigation(false)
                setShowGamification(true)
              }}
              onOpenRewardShop={() => {
                closeMobileNavigation(false)
                setShowRewardShop(true)
              }}
              onOpenAccessibility={() => {
                closeMobileNavigation(false)
                setShowAccessibility(true)
              }}
            />
          </aside>
        </div>
      )}

      <Suspense fallback={<ModalLoadingFallback />}>
        <AnimatePresence>
          {showGamification && (
            <GamificationDashboard onClose={() => setShowGamification(false)} />
          )}
          {showRewardShop && (
            <RewardShop onClose={() => setShowRewardShop(false)} />
          )}
          {showModePreferences && (
            <ModePreferences
              modeId={currentMode.id}
              onClose={() => setShowModePreferences(false)}
            />
          )}
          {showAccessibility && (
            <AccessibilitySettings onClose={() => setShowAccessibility(false)} />
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  )
}

export default Layout
