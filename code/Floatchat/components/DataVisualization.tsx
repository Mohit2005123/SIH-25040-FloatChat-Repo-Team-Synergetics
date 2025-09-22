'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Globe, 
  TrendingUp, 
  Download, 
  Share2, 
  Settings,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react'
import MapVisualization from './MapVisualization'
import DataChart from './DataChart'

export default function DataVisualization() {
  const [activeView, setActiveView] = useState<'map' | 'chart' | '3d'>('map')
  const [selectedParameter, setSelectedParameter] = useState('temperature')
  const [timeRange, setTimeRange] = useState('7d')
  const [isPlaying, setIsPlaying] = useState(false)
  const [showLayers, setShowLayers] = useState(true)
  const playTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [summary, setSummary] = useState({
    dataPoints: '—',
    activeFloats: '—',
    coverage: '—',
    lastUpdate: '—'
  })

  useEffect(() => {
    let aborted = false
    const loadSummary = async () => {
      try {
        const runtimeBase = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : ''
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || runtimeBase || ''
        console.log(baseUrl);
        const res = await fetch(`${baseUrl}/api/data/statistics`, { cache: 'no-store' })
        console.log(res);
        if (!res.ok) return
        const stats = await res.json()
        if (aborted) return
        const dataPoints = stats.total_measurements ?? '—'
        const activeFloats = stats.active_floats ?? '—'
        const coverage = '—'
        const lastUpdate = stats.recent_metrics && stats.recent_metrics[0] ? new Date(stats.recent_metrics[0].timestamp).toLocaleString() : '—'
        setSummary({
          dataPoints: String(dataPoints),
          activeFloats: String(activeFloats),
          coverage: String(coverage),
          lastUpdate: String(lastUpdate)
        })
      } catch (e) {
        // ignore errors
      }
    }
    loadSummary()
    return () => { aborted = true }
  }, [])

  const parameters = [
    { id: 'temperature', name: 'Temperature', unit: '°C', color: 'text-red-400' },
    { id: 'salinity', name: 'Salinity', unit: 'PSU', color: 'text-blue-400' },
    { id: 'oxygen', name: 'Dissolved Oxygen', unit: 'mg/L', color: 'text-green-400' },
    { id: 'pressure', name: 'Pressure', unit: 'dbar', color: 'text-purple-400' },
    { id: 'current', name: 'Current Speed', unit: 'm/s', color: 'text-orange-400' },
  ]

  const timeRanges = [
    { id: '24h', name: '24 Hours' },
    { id: '7d', name: '7 Days' },
    { id: '30d', name: '30 Days' },
    { id: '90d', name: '90 Days' },
    { id: '1y', name: '1 Year' },
  ]

  const visualizationTypes = [
    { id: 'map', name: 'Map View', icon: Globe },
    { id: 'chart', name: 'Time Series', icon: BarChart3 },
    { id: '3d', name: '3D Profile', icon: TrendingUp },
  ]

  // Simple animation: cycle through parameters while playing
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current)
        playTimerRef.current = null
      }
      return
    }
    const cycleFn = () => {
      const idx = parameters.findIndex(p => p.id === selectedParameter)
      const next = parameters[(idx + 1) % parameters.length]
      setSelectedParameter(next.id)
    }
    playTimerRef.current = setInterval(cycleFn, 3000)
    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current)
        playTimerRef.current = null
      }
    }
  }, [isPlaying, selectedParameter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Data Visualization</h2>
          <p className="text-white/70">Explore ocean data through interactive visualizations</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
            <Share2 size={16} />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Parameter Selection */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-semibold text-white/80 mb-3">Parameter</h3>
          <div className="space-y-2">
            {parameters.map((param) => (
              <button
                key={param.id}
                onClick={() => setSelectedParameter(param.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedParameter === param.id
                    ? 'bg-ocean-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${param.color.replace('text-', 'bg-')}`}></div>
                  {param.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Range */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-semibold text-white/80 mb-3">Time Range</h3>
          <div className="space-y-2">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  timeRange === range.id
                    ? 'bg-ocean-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {range.name}
              </button>
            ))}
          </div>
        </div>

        {/* View Type */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-semibold text-white/80 mb-3">View Type</h3>
          <div className="space-y-2">
            {visualizationTypes.map((view) => {
              const Icon = view.icon
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as any)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeView === view.id
                      ? 'bg-ocean-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {view.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Animation Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-semibold text-white/80 mb-3">Animation</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg transition-all"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
                <RotateCcw size={16} />
              </button>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setShowLayers(!showLayers)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  showLayers ? 'bg-ocean-500 text-white' : 'bg-white/5 text-white/70'
                }`}
              >
                {showLayers ? <Eye size={16} /> : <EyeOff size={16} />}
                Layers
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        {activeView === 'map' && (
          <div className="h-[600px]">
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {parameters.find(p => p.id === selectedParameter)?.name} Distribution
                </h3>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Filter size={16} />
                  <span>Interactive Map</span>
                </div>
              </div>
            </div>
            <MapVisualization region="global" parameter={selectedParameter} />
          </div>
        )}

        {activeView === 'chart' && (
          <div className="h-[600px] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {parameters.find(p => p.id === selectedParameter)?.name} Trends
              </h3>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <BarChart3 size={16} />
                <span>Time Series Analysis</span>
              </div>
            </div>
            <DataChart type={selectedParameter} timeRange={timeRange} />
          </div>
        )}

        {activeView === '3d' && (
          <div className="h-[600px] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                3D Ocean Profile
              </h3>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <TrendingUp size={16} />
                <span>Depth Profile</span>
              </div>
            </div>
            <div className="h-full bg-gradient-to-b from-ocean-900 to-deep-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-ocean-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-12 h-12 text-ocean-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">3D Visualization</h4>
                <p className="text-white/70 mb-4">Interactive 3D ocean profile coming soon</p>
                <button className="px-6 py-2 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg transition-all">
                  Enable 3D View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">Data Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Data Points</span>
              <span className="text-white font-semibold">{summary.dataPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Active Floats</span>
              <span className="text-white font-semibold">{summary.activeFloats}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Coverage</span>
              <span className="text-white font-semibold">{summary.coverage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Last Update</span>
              <span className="text-white font-semibold">{summary.lastUpdate}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">Quality Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Data Quality</span>
              <span className="text-green-400 font-semibold">98.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Completeness</span>
              <span className="text-blue-400 font-semibold">94.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Accuracy</span>
              <span className="text-purple-400 font-semibold">97.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Timeliness</span>
              <span className="text-orange-400 font-semibold">96.1%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">Export Options</h4>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
              <Download size={16} />
              Download CSV
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
              <Download size={16} />
              Download NetCDF
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
              <Share2 size={16} />
              Share Visualization
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
              <Settings size={16} />
              Custom Export
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
