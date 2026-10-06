import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../../common/SafeIcon'
import {
  CORE_ONBOARDING_CAPABILITIES,
  OPTIONAL_ONBOARDING_CAPABILITIES
} from '../../../config/productCapabilities'

const {
  FiCalendar,
  FiCheckSquare,
  FiGrid,
  FiHome,
  FiInbox,
  FiInfo,
  FiRepeat
} = FiIcons

const iconByKey = {
  calendar: FiCalendar,
  tasks: FiCheckSquare,
  projects: FiGrid,
  home: FiHome,
  inbox: FiInbox,
  repeat: FiRepeat
}

const styleByCapability = {
  today: {
    enabled: 'border-emerald-300 bg-emerald-50',
    icon: 'bg-emerald-600'
  },
  tasks: {
    enabled: 'border-green-300 bg-green-50',
    icon: 'bg-green-600'
  },
  routines: {
    enabled: 'border-purple-300 bg-purple-50',
    icon: 'bg-purple-600'
  },
  projects: {
    enabled: 'border-indigo-300 bg-indigo-50',
    icon: 'bg-indigo-600'
  },
  housework: {
    enabled: 'border-blue-300 bg-blue-50',
    icon: 'bg-blue-600'
  },
  inbox: {
    enabled: 'border-pink-300 bg-pink-50',
    icon: 'bg-pink-600'
  }
}

const withIcon = (capability) => ({
  ...capability,
  icon: iconByKey[capability.iconKey]
})

const CORE_MODULES = CORE_ONBOARDING_CAPABILITIES.map(withIcon)
const OPTIONAL_MODULES = OPTIONAL_ONBOARDING_CAPABILITIES.map(withIcon)

const REQUIRED_MODULE_IDS = CORE_MODULES
  .map((module) => module.navigation?.module)
  .filter(Boolean)

const OPTIONAL_MODULE_IDS = OPTIONAL_MODULES
  .map((module) => module.navigation?.module)
  .filter(Boolean)

const normalizeEnabledModules = (enabledModules = []) => [
  ...new Set([
    ...REQUIRED_MODULE_IDS,
    ...enabledModules.filter((moduleId) => OPTIONAL_MODULE_IDS.includes(moduleId))
  ])
]

const ModulesStep = ({ onNext, onBack, currentData }) => {
  const [enabledModules, setEnabledModules] = useState(
    normalizeEnabledModules(currentData.enabledModules)
  )

  const enabledOptionalCount = useMemo(
    () => OPTIONAL_MODULE_IDS.filter((moduleId) => enabledModules.includes(moduleId)).length,
    [enabledModules]
  )

  const toggleModule = (moduleId) => {
    if (!OPTIONAL_MODULE_IDS.includes(moduleId)) return

    setEnabledModules((current) => (
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId]
    ))
  }

  const handleNext = () => {
    onNext({ enabledModules: normalizeEnabledModules(enabledModules) })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <div className="text-center">
        <h2 className="mb-3 text-3xl font-bold text-slate-900">
          Choose your tools <span aria-hidden="true">🛠️</span>
        </h2>
        <p className="text-lg text-slate-600">
          Core tools stay available. Add only the optional areas that feel useful right now.
        </p>
      </div>

      <section aria-labelledby="core-tools-title">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h3 id="core-tools-title" className="text-lg font-bold text-slate-900">Core tools</h3>
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
            Available by default
          </span>
        </div>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CORE_MODULES.map((module, index) => {
            const styles = styleByCapability[module.id]
            return (
              <motion.li
                key={module.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl border-2 p-5 shadow-sm ${styles.enabled}`}
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
                    <SafeIcon icon={module.icon} className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{module.name}</h4>
                    <p className="mt-1 text-sm text-slate-700">{module.summary}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {module.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-green-500" aria-hidden="true">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="optional-tools-title">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 id="optional-tools-title" className="text-lg font-bold text-slate-900">Optional tools</h3>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              {enabledOptionalCount} selected
            </span>
          </div>
          <span className="text-sm text-slate-500">You can keep this small.</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2" role="group" aria-label="Optional modules">
          {OPTIONAL_MODULES.map((module, index) => {
            const moduleId = module.navigation.module
            const isEnabled = enabledModules.includes(moduleId)
            const styles = styleByCapability[module.id]

            return (
              <motion.button
                type="button"
                key={module.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + CORE_MODULES.length) * 0.05 }}
                onClick={() => toggleModule(moduleId)}
                aria-pressed={isEnabled}
                className={`rounded-xl border-2 p-5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isEnabled
                    ? `${styles.enabled} shadow-sm`
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
                      <SafeIcon icon={module.icon} className="h-5 w-5 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{module.name}</h4>
                      <p className="mt-1 text-sm text-slate-700">{module.summary}</p>
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${
                      isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </span>
                </div>

                <ul className="space-y-1">
                  {module.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className={isEnabled ? 'text-green-500' : 'text-slate-400'} aria-hidden="true">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.button>
            )
          })}
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <SafeIcon icon={FiInfo} className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
        <div className="text-sm text-blue-900">
          <p className="mb-1 font-medium"><span aria-hidden="true">💡</span> Keep setup light</p>
          <p>
            Today, Tasks, Routines and Projects are already available. Housework and Brain Inbox are optional,
            so you only need to add them if they reduce effort for you.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 text-slate-700 transition-colors hover:bg-slate-50"
        >
          <span aria-hidden="true">←</span> Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 rounded-xl bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
        >
          Continue <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}

export default ModulesStep
