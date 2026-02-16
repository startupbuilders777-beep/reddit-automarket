'use client'

import { useEffect, useState } from 'react'

interface PipelineMetrics {
  total: number
  completed: number
  inProgress: number
  unassigned: number
  blocked: number
  completionRate: number
  byProject: Array<{
    projectGid: string
    total: number
    completed: number
    inProgress: number
    unassigned: number
  }>
}

const PROJECT_NAMES: Record<string, string> = {
  '1213277278397665': 'AgentWatch',
  '1213277068607518': 'NexusAI',
  '1213287173640360': 'RedditAutoMarket',
  '1213287696255155': 'SafeAgent',
  '1213287173636195': 'Whop Course',
  '1213291640888794': 'Mission Control',
}

export default function PipelineMetrics() {
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pipeline-metrics')
      .then(res => res.json())
      .then(data => {
        setMetrics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Task Pipeline</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-slate-800 rounded-lg" />
          <div className="h-20 bg-slate-800 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Task Pipeline</h3>
        <p className="text-slate-400">Failed to load metrics</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Task Pipeline</h3>
        <span className="text-2xl font-bold text-indigo-400">{metrics.completionRate}%</span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">{metrics.total}</div>
          <div className="text-xs text-slate-400">Total Tasks</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-emerald-400">{metrics.completed}</div>
          <div className="text-xs text-slate-400">Completed</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-400">{metrics.inProgress}</div>
          <div className="text-xs text-slate-400">In Progress</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-amber-400">{metrics.unassigned}</div>
          <div className="text-xs text-slate-400">Unassigned</div>
        </div>
      </div>

      {/* Blockers Alert */}
      {metrics.blocked > 0 && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{metrics.blocked} Blocked Tasks</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${metrics.total > 0 ? (metrics.completed / metrics.total) * 100 : 0}%` }}
          />
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${metrics.total > 0 ? (metrics.inProgress / metrics.total) * 100 : 0}%` }}
          />
          <div 
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${metrics.total > 0 ? (metrics.unassigned / metrics.total) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Done
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full" /> Active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full" /> Backlog
          </span>
        </div>
      </div>

      {/* By Project */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3">By Project</h4>
        <div className="space-y-2">
          {metrics.byProject.map(project => (
            <div key={project.projectGid} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">
                {PROJECT_NAMES[project.projectGid] || project.projectGid}
              </span>
              <div className="flex items-center gap-2">
                {project.completed > 0 && (
                  <span className="text-emerald-400">{project.completed}</span>
                )}
                {project.inProgress > 0 && (
                  <span className="text-blue-400">{project.inProgress}</span>
                )}
                {project.unassigned > 0 && (
                  <span className="text-amber-400">{project.unassigned}</span>
                )}
                <span className="text-slate-500">/ {project.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
