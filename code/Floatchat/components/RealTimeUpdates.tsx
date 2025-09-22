'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Globe,
  Database
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UpdateData {
  id: string
  type: 'float_update' | 'data_sync' | 'system_alert'
  message: string
  timestamp: Date
  status: 'success' | 'warning' | 'error'
  data?: any
}

export default function RealTimeUpdates() {
  const [isConnected, setIsConnected] = useState(true)
  const [updates, setUpdates] = useState<UpdateData[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [stats, setStats] = useState({
    totalFloats: 3847,
    activeFloats: 3621,
    dataPoints: 1247832,
    lastSync: new Date()
  })
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:8000/ws')
      
      ws.onopen = () => {
        setIsConnected(true)
        toast.success('Connected to real-time updates')
        console.log('WebSocket connected')
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleRealtimeUpdate(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      ws.onclose = () => {
        setIsConnected(false)
        toast.error('Disconnected from real-time updates')
        console.log('WebSocket disconnected')
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket()
        }, 5000)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }
      
      wsRef.current = ws
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
      setIsConnected(false)
    }
  }

  const handleRealtimeUpdate = (data: any) => {
    const update: UpdateData = {
      id: `update_${Date.now()}`,
      type: data.type || 'data_sync',
      message: data.message || 'Data updated',
      timestamp: new Date(),
      status: data.status || 'success',
      data: data.data
    }
    
    setUpdates(prev => [update, ...prev].slice(0, 50)) // Keep last 50 updates
    setLastUpdate(new Date())
    
    // Update stats if provided
    if (data.stats) {
      setStats(prev => ({ ...prev, ...data.stats }))
    }
    
    // Show toast notification
    if (update.status === 'success') {
      toast.success(update.message)
    } else if (update.status === 'warning') {
      toast(update.message, { icon: '⚠️' })
    } else if (update.status === 'error') {
      toast.error(update.message)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Activity className="w-4 h-4 text-blue-400" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'float_update':
        return <Globe className="w-4 h-4 text-blue-400" />
      case 'data_sync':
        return <Database className="w-4 h-4 text-green-400" />
      case 'system_alert':
        return <AlertCircle className="w-4 h-4 text-orange-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="w-6 h-6 text-ocean-400" />
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Real-time Updates</h3>
            <p className="text-sm text-white/70">
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-green-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
          <span className="text-xs text-white/70">
            {mounted ? formatTimeAgo(lastUpdate) : ''}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white/70">Total Floats</span>
          </div>
          <div className="text-lg font-semibold text-white">{stats.totalFloats.toLocaleString()}</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white/70">Active</span>
          </div>
          <div className="text-lg font-semibold text-white">{stats.activeFloats.toLocaleString()}</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-white/70">Data Points</span>
          </div>
          <div className="text-lg font-semibold text-white">{(stats.dataPoints / 1000000).toFixed(1)}M</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-white/70">Last Sync</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {mounted ? formatTimeAgo(stats.lastSync) : ''}
          </div>
        </div>
      </div>

      {/* Updates Feed */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <h4 className="text-sm font-medium text-white/80 mb-3">Recent Updates</h4>
        <AnimatePresence>
          {updates.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No updates yet</p>
            </div>
          ) : (
            updates.map((update) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getTypeIcon(update.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(update.status)}
                    <span className="text-sm text-white/90 font-medium">
                      {update.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-white/50">
                      {mounted ? formatTimeAgo(update.timestamp) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-white/70">{update.message}</p>
                  
                  {update.data && (
                    <div className="mt-2 text-xs text-white/50">
                      {JSON.stringify(update.data, null, 2)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Connection Status */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-xs text-white/70">
              {isConnected ? 'Live updates active' : 'Reconnecting...'}
            </span>
          </div>
          
          <button
            onClick={() => connectWebSocket()}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}
