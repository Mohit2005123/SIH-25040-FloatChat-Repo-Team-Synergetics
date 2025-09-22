'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Thermometer, 
  Droplets, 
  Navigation, 
  Clock, 
  Activity,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react'

interface Float {
  id: string
  lat: number
  lon: number
  temperature: number
  salinity: number
  depth: number
  lastUpdate: string
  status: 'active' | 'inactive' | 'warning'
  battery: number
  cycles: number
}

export default function FloatList({ region }: { region: string }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'warning'>('all')

  // Mock data
  const floats: Float[] = [
    {
      id: '2903574',
      lat: 12.5,
      lon: 77.2,
      temperature: 28.5,
      salinity: 35.2,
      depth: 1000,
      lastUpdate: '2 hours ago',
      status: 'active',
      battery: 85,
      cycles: 1247
    },
    {
      id: '2903575',
      lat: 15.3,
      lon: 80.1,
      temperature: 26.8,
      salinity: 34.9,
      depth: 1500,
      lastUpdate: '4 hours ago',
      status: 'active',
      battery: 92,
      cycles: 1103
    },
    {
      id: '2903576',
      lat: 8.7,
      lon: 76.8,
      temperature: 29.2,
      salinity: 35.5,
      depth: 800,
      lastUpdate: '1 hour ago',
      status: 'warning',
      battery: 23,
      cycles: 2156
    },
    {
      id: '2903577',
      lat: 18.2,
      lon: 82.5,
      temperature: 25.1,
      salinity: 34.7,
      depth: 2000,
      lastUpdate: '1 day ago',
      status: 'inactive',
      battery: 0,
      cycles: 3421
    },
    {
      id: '2903578',
      lat: 6.9,
      lon: 79.3,
      temperature: 30.1,
      salinity: 35.8,
      depth: 600,
      lastUpdate: '30 minutes ago',
      status: 'active',
      battery: 78,
      cycles: 987
    }
  ]

  const filteredFloats = floats.filter(float => {
    const matchesSearch = float.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         float.lat.toString().includes(searchTerm) ||
                         float.lon.toString().includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || float.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'warning': return 'text-yellow-400 bg-yellow-400/20'
      case 'inactive': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getBatteryColor = (battery: number) => {
    if (battery > 70) return 'text-green-400'
    if (battery > 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
          <input
            type="text"
            placeholder="Search floats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'active', 'warning', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                statusFilter === status
                  ? 'bg-ocean-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Float List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredFloats.map((float, index) => (
          <motion.div
            key={float.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm text-white font-semibold">#{float.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(float.status)}`}>
                    {float.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{float.lat.toFixed(2)}°, {float.lon.toFixed(2)}°</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Navigation size={12} />
                    <span>{float.depth}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer size={12} />
                    <span>{float.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets size={12} />
                    <span>{float.salinity} PSU</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-white/50">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{float.lastUpdate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity size={12} />
                    <span>{float.cycles} cycles</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className={`text-sm font-semibold ${getBatteryColor(float.battery)}`}>
                    {float.battery}%
                  </div>
                  <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        float.battery > 70 ? 'bg-green-400' : 
                        float.battery > 30 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${float.battery}%` }}
                    ></div>
                  </div>
                </div>
                
                <ChevronRight 
                  size={16} 
                  className="text-white/50 group-hover:text-white/80 transition-colors" 
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredFloats.length === 0 && (
        <div className="text-center py-8 text-white/50">
          <Activity size={32} className="mx-auto mb-2 opacity-50" />
          <p>No floats found matching your criteria</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="pt-4 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center text-xs text-white/70">
          <div>
            <div className="text-lg font-semibold text-white">{filteredFloats.length}</div>
            <div>Total Floats</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-400">
              {filteredFloats.filter(f => f.status === 'active').length}
            </div>
            <div>Active</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-400">
              {filteredFloats.filter(f => f.status === 'warning').length}
            </div>
            <div>Warning</div>
          </div>
        </div>
      </div>
    </div>
  )
}
