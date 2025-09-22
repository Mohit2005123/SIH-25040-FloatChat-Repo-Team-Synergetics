'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  Navigation,
  TrendingUp,
  Activity,
  Clock,
  Globe,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import MapVisualization from './MapVisualization'
import DataChart from './DataChart'
import FloatList from './FloatList'

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState('global')
  const [timeRange, setTimeRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const regions = [
    { id: 'global', name: 'Global', icon: Globe },
    { id: 'indian', name: 'Indian Ocean', icon: MapPin },
    { id: 'pacific', name: 'Pacific', icon: MapPin },
    { id: 'atlantic', name: 'Atlantic', icon: MapPin },
  ]

  const timeRanges = [
    { id: '24h', name: '24 Hours' },
    { id: '7d', name: '7 Days' },
    { id: '30d', name: '30 Days' },
    { id: '90d', name: '90 Days' },
  ]

  interface Metric {
    label: string
    value: string
    change: string
    trend: 'up' | 'down'
    icon: any
    color: string
  }

  const [oceanMetrics, setOceanMetrics] = useState<Metric[]>([
    { label: 'Total Floats', value: '—', change: '', trend: 'up', icon: Navigation, color: 'text-purple-400' },
    { label: 'Active Floats', value: '—', change: '', trend: 'up', icon: Navigation, color: 'text-purple-400' },
    { label: 'Measurements', value: '—', change: '', trend: 'up', icon: Activity, color: 'text-green-400' },
    { label: 'Last Ingest', value: '—', change: '', trend: 'up', icon: Clock, color: 'text-blue-400' }
  ] as any)

  useEffect(() => {
    let aborted = false
    const loadStats = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
        const res = await fetch(`${baseUrl}/api/data/statistics`, { cache: 'no-store' })
        if (!res.ok) return
        const stats = await res.json()
        if (aborted) return
        const total = stats.total_floats ?? '—'
        const active = stats.active_floats ?? '—'
        const measurements = stats.total_measurements ?? '—'
        const recentTs = stats.recent_metrics && stats.recent_metrics[0] ? stats.recent_metrics[0].timestamp : null
        const lastIngest = recentTs ? new Date(recentTs).toLocaleString() : '—'
        setOceanMetrics([
          { label: 'Total Floats', value: String(total), change: '', trend: 'up', icon: Navigation, color: 'text-purple-400' },
          { label: 'Active Floats', value: String(active), change: '', trend: 'up', icon: Navigation, color: 'text-purple-400' },
          { label: 'Measurements', value: String(measurements), change: '', trend: 'up', icon: Activity, color: 'text-green-400' },
          { label: 'Last Ingest', value: String(lastIngest), change: '', trend: 'up', icon: Clock, color: 'text-blue-400' }
        ])
      } catch (e) {
        // ignore
      }
    }
    loadStats()
    return () => { aborted = true }
  }, [])

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLastUpdated(new Date())
    setIsLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Ocean Data Dashboard</h2>
          <p className="text-white/70">Real-time monitoring of ARGO float data and ocean parameters</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Region Selector */}
          <div className="flex bg-white/10 rounded-lg p-1">
            {regions.map((region) => {
              const Icon = region.icon
              return (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedRegion === region.id
                      ? 'bg-ocean-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  {region.name}
                </button>
              )
            })}
          </div>

          {/* Time Range Selector */}
          <div className="flex bg-white/10 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  timeRange === range.id
                    ? 'bg-ocean-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {range.name}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <motion.button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {oceanMetrics.map((metric: Metric, index: number) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                  {metric.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-white/70 text-sm">{metric.label}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Map Visualization */}
        <div className="xl:col-span-2">
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 h-[600px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Global ARGO Float Distribution</h3>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Clock size={16} />
                Last updated: {mounted ? lastUpdated.toLocaleTimeString() : '—'}
              </div>
            </div>
            <MapVisualization region={selectedRegion} />
          </motion.div>
        </div>

        {/* Float List */}
        <div>
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 h-[600px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Active Floats</h3>
              <button className="text-ocean-400 hover:text-ocean-300 text-sm font-medium">
                View All
              </button>
            </div>
            <FloatList region={selectedRegion} />
          </motion.div>
        </div>
      </div>

      {/* Data Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-white mb-6">Temperature Trends</h3>
          <DataChart type="temperature" timeRange={timeRange} />
        </motion.div>

        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-white mb-6">Salinity Distribution</h3>
          <DataChart type="salinity" timeRange={timeRange} />
        </motion.div>
      </div>
    </div>
  )
}
