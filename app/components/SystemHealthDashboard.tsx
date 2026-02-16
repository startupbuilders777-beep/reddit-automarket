'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Cpu, 
  MemoryStick, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Server,
  Zap,
  RefreshCw,
  BarChart3
} from 'lucide-react'

interface SystemMetrics {
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
    cost: number
  }
  errors: number
  tasks: {
    completed: number
    failed: number
    running: number
    pending: number
  }
  agents: {
    total: number
    active: number
    inactive: number
    error: number
  }
  daily: Array<{
    date: string
    totalTokens: number
    cost: number
  }>
}

// Mock system metrics for CPU/Memory (agent orchestration system)
const mockSystemHealth = {
  cpu: {
    usage: 34,
    cores: 8,
    temperature: 45
  },
  memory: {
    used: 4.2,
    total: 16,
    percentage: 26
  },
  uptime: '14 days, 6 hours',
  apiResponseTime: {
    avg: 145,
    p95: 320,
    p99: 450
  }
}

type HealthStatus = 'healthy' | 'warning' | 'critical'

const getStatusColor = (status: HealthStatus): string => {
  switch (status) {
    case 'healthy': return 'bg-emerald-500'
    case 'warning': return 'bg-amber-500'
    case 'critical': return 'bg-red-500'
  }
}

const getStatusText = (status: HealthStatus): string => {
  switch (status) {
    case 'healthy': return 'text-emerald-400'
    case 'warning': return 'text-amber-400'
    case 'critical': return 'text-red-400'
  }
}

const getHealthStatus = (value: number, thresholds: { warning: number; critical: number }): HealthStatus => {
  if (value >= thresholds.critical) return 'critical'
  if (value >= thresholds.warning) return 'warning'
  return 'healthy'
}

export default function SystemHealthDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics?period=week')
      const data = await res.json()
      setMetrics(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  // Calculate overall health status
  const errorRate = metrics ? (metrics.errors / (metrics.tasks.completed + metrics.tasks.failed + 1)) * 100 : 0
  const healthStatus = getHealthStatus(errorRate, { warning: 5, critical: 15 })

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">System Health</h2>
            <p className="text-sm text-slate-400">Real-time system status</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchMetrics}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(healthStatus)} animate-pulse`} />
            <span className={`text-sm font-medium ${getStatusText(healthStatus)} capitalize`}>
              {healthStatus}
            </span>
          </div>
        </div>
      </div>

      {loading && !metrics ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-slate-800 rounded-lg" />
          <div className="h-24 bg-slate-800 rounded-lg" />
        </div>
      ) : (
        <>
          {/* System Status Overview */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* CPU Usage */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-400">CPU</span>
                </div>
                <span className="text-xs text-slate-500">{mockSystemHealth.cpu.cores} cores</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{mockSystemHealth.cpu.usage}%</span>
              </div>
              <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${getStatusColor(getHealthStatus(mockSystemHealth.cpu.usage, { warning: 70, critical: 90 }))}`}
                  style={{ width: `${mockSystemHealth.cpu.usage}%` }}
                />
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MemoryStick className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-400">Memory</span>
                </div>
                <span className="text-xs text-slate-500">{mockSystemHealth.memory.total}GB</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{mockSystemHealth.memory.percentage}%</span>
                <span className="text-xs text-slate-500 mb-1">({mockSystemHealth.memory.used}GB)</span>
              </div>
              <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${getStatusColor(getHealthStatus(mockSystemHealth.memory.percentage, { warning: 70, critical: 90 }))}`}
                  style={{ width: `${mockSystemHealth.memory.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* API Response Time & Uptime */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* API Response Time */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-slate-400">API Response</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Avg</span>
                  <span className="text-lg font-bold text-white">{mockSystemHealth.apiResponseTime.avg}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">p95</span>
                  <span className="text-sm font-medium text-slate-300">{mockSystemHealth.apiResponseTime.p95}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">p99</span>
                  <span className="text-sm font-medium text-slate-300">{mockSystemHealth.apiResponseTime.p99}ms</span>
                </div>
              </div>
            </div>

            {/* Uptime */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-slate-400">Uptime</span>
              </div>
              <div className="text-lg font-bold text-white">{mockSystemHealth.uptime}</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
                <CheckCircle className="w-3 h-3" />
                <span>All systems operational</span>
              </div>
            </div>
          </div>

          {/* Active Agents & Error Rate */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Active Agents */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-slate-400">Active Agents</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {metrics?.agents.active || 0}
                </span>
                <span className="text-sm text-slate-500">
                  / {metrics?.agents.total || 0}
                </span>
              </div>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-emerald-400">{metrics?.agents.active || 0} active</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{metrics?.agents.inactive || 0} inactive</span>
              </div>
            </div>

            {/* Error Rate */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-slate-400">Error Rate</span>
                </div>
                {errorRate < 1 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : errorRate < 5 ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${getStatusText(healthStatus)}`}>
                  {errorRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-slate-400">{metrics?.errors || 0} errors</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{metrics?.tasks.completed || 0} completed</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-700/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                <Zap className="w-3 h-3" />
              </div>
              <div className="text-lg font-bold text-white">
                {metrics?.tasks.running || 0}
              </div>
              <div className="text-xs text-slate-500">Running</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                <CheckCircle className="w-3 h-3" />
              </div>
              <div className="text-lg font-bold text-white">
                {metrics?.tasks.completed || 0}
              </div>
              <div className="text-xs text-slate-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                <Clock className="w-3 h-3" />
              </div>
              <div className="text-lg font-bold text-white">
                {metrics?.tasks.pending || 0}
              </div>
              <div className="text-xs text-slate-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
                <XCircle className="w-3 h-3" />
              </div>
              <div className="text-lg font-bold text-white">
                {metrics?.tasks.failed || 0}
              </div>
              <div className="text-xs text-slate-500">Failed</div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-4 pt-3 border-t border-slate-700/30 flex justify-between items-center text-xs text-slate-500">
            <span>Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--'}</span>
            <span>Mock CPU/Memory • Live API metrics</span>
          </div>
        </>
      )}
    </div>
  )
}
