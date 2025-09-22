'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface ChartData {
  time: string
  value: number
  trend?: 'up' | 'down'
}

export default function DataChart({ type, timeRange }: { type: string; timeRange: string }) {
  const [data, setData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let aborted = false
    const fetchSeries = async () => {
      try {
        setIsLoading(true)
        const runtimeBase = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : ''
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || runtimeBase || ''
        const url = `${baseUrl}/api/visualization/timeseries?parameter=${encodeURIComponent(type)}&time_range=${encodeURIComponent(timeRange)}&region=global`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load chart')
        const payload = await res.json()
        if (aborted) return
        const fig = typeof payload.plotly_json === 'string' ? JSON.parse(payload.plotly_json) : payload.plotly_json
        const x = fig?.data?.[0]?.x || []
        const y = fig?.data?.[0]?.y || []
        const series: ChartData[] = x.map((t: any, i: number) => ({ time: String(t), value: Number(y[i] ?? 0) }))
        setData(series)
      } catch (e) {
        setData([])
      } finally {
        if (!aborted) setIsLoading(false)
      }
    }
    fetchSeries()
    return () => { aborted = true }
  }, [type, timeRange])

  const getChartConfig = () => {
    switch (type) {
      case 'temperature':
        return {
          color: '#ef4444',
          unit: '°C',
          name: 'Temperature',
          gradient: 'url(#temperatureGradient)'
        }
      case 'salinity':
        return {
          color: '#3b82f6',
          unit: 'PSU',
          name: 'Salinity',
          gradient: 'url(#salinityGradient)'
        }
      default:
        return {
          color: '#10b981',
          unit: '',
          name: 'Value',
          gradient: 'url(#defaultGradient)'
        }
    }
  }

  const config = getChartConfig()
  const latestValue = data[data.length - 1]?.value || 0
  const previousValue = data[data.length - 2]?.value || 0
  const change = latestValue - previousValue
  const changePercent = previousValue ? ((change / previousValue) * 100) : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-ocean-500/20 border-t-ocean-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-white/70 text-sm">Loading chart data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }}></div>
          <span className="text-sm text-white/70">{config.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/70">Latest:</span>
          <span className="text-white font-semibold">{latestValue.toFixed(1)}{config.unit}</span>
          <div className={`flex items-center gap-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(changePercent).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="salinityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="defaultGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [value.toFixed(2) + config.unit, config.name]}
            labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={config.color}
            strokeWidth={2}
            fill={config.gradient}
            dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: config.color, strokeWidth: 2, fill: 'white' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Chart Stats */}
      <div className="flex items-center justify-between mt-4 text-xs text-white/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Activity size={12} />
            <span>{data.length} data points</span>
          </div>
          <div>
            Range: {Math.min(...data.map(d => d.value)).toFixed(1)} - {Math.max(...data.map(d => d.value)).toFixed(1)}{config.unit}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${change >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span>{change >= 0 ? 'Increasing' : 'Decreasing'}</span>
        </div>
      </div>
    </div>
  )
}
