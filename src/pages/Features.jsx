import React from 'react'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { ACTIVE_CAPABILITIES, PLANNED_CAPABILITIES } from '../config/productCapabilities'

const {
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCheckSquare,
  FiCpu,
  FiGrid,
  FiHome,
  FiInbox,
  FiLayers,
  FiLink,
  FiPlayCircle,
  FiRepeat,
  FiSliders,
  FiZap
} = FiIcons

const iconByKey = {
  award: FiAward,
  automation: FiZap,
  book: FiBookOpen,
  calendar: FiCalendar,
  'calendar-link': FiLink,
  ai: FiCpu,
  home: FiHome,
  inbox: FiInbox,
  insights: FiBarChart2,
  integrations: FiLayers,
  play: FiPlayCircle,
  projects: FiGrid,
  repeat: FiRepeat,
  sliders: FiSliders,
  tasks: FiCheckSquare
}

const CapabilityCard = ({ capability, planned = false }) => (
  <li className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-start gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
        planned ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'
      }`}>
        <SafeIcon icon={iconByKey[capability.iconKey]} className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-slate-900">{capability.name}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            planned ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {planned ? 'Planned · not active yet' : 'Available now'}
          </span>
          {planned && capability.roadmapStage === 'Stage 3' && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
              Current milestone
            </span>
          )}
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{capability.summary}</p>
        {planned ? (
          <p className="mt-3 text-sm text-slate-500">{capability.detail}</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label={`${capability.name} highlights`}>
            {capability.benefits.map((benefit) => (
              <li key={benefit} className="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                {benefit}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </li>
)

const Features = () => (
  <div className="p-4 sm:p-6">
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Product map</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Features</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          This page separates what works in the app today from capabilities that are on the roadmap.
          Planned cards are placeholders only and do not create external connections, background actions or release-date promises.
        </p>
      </header>

      <section aria-labelledby="available-features-title">
        <div className="mb-4">
          <h2 id="available-features-title" className="text-lg font-semibold text-slate-900">Available now</h2>
          <p className="mt-1 text-sm text-slate-600">These capabilities have an implemented user path in the current application.</p>
        </div>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ACTIVE_CAPABILITIES.map((capability) => (
            <CapabilityCard key={capability.id} capability={capability} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="planned-features-title" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <div className="mb-4">
          <h2 id="planned-features-title" className="text-lg font-semibold text-slate-900">Planned</h2>
          <p className="mt-1 text-sm text-slate-600">
            These are intentionally inactive. Their cards explain direction without presenting controls that cannot work yet.
          </p>
        </div>
        <ul className="grid gap-4 md:grid-cols-2">
          {PLANNED_CAPABILITIES.map((capability) => (
            <CapabilityCard key={capability.id} capability={capability} planned />
          ))}
        </ul>
      </section>
    </div>
  </div>
)

export default Features
