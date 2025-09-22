'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Thermometer, Droplets, Wind, Navigation } from 'lucide-react'

interface FloatData {
  id: string
  lat: number
  lon: number
  temperature: number
  salinity: number
  depth: number
  lastUpdate: string
  status: 'active' | 'inactive'
}

export default function MapVisualization({ region, parameter = 'temperature' }: { region: string; parameter?: string }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedFloat, setSelectedFloat] = useState<FloatData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [floats, setFloats] = useState<FloatData[]>([])

  useEffect(() => {
    let aborted = false
    const fetchFloats = async () => {
      try {
        setIsLoading(true)
        const runtimeBase = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : ''
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || runtimeBase || ''
        const url = `${baseUrl}/api/data/floats?region=${encodeURIComponent(region)}&limit=500`
        const res = await fetch(url, { cache: 'no-store' })
        console.log('Map Visualization URL', url);
        console.log('Map Visualization Response', res);
        if (!res.ok) throw new Error('Failed to load floats')
        const data = await res.json()
        if (aborted) return
        const mapped: FloatData[] = (data || []).map((d: any) => ({
          id: String(d.float_id),
          lat: Number(d.latitude),
          lon: Number(d.longitude),
          temperature: d.temperature ?? 0,
          salinity: d.salinity ?? 0,
          depth: d.depth ?? 0,
          lastUpdate: d.timestamp ?? '',
          status: d.status ?? 'active'
        }))
        setFloats(mapped)
      } catch (e) {
        setFloats([])
      } finally {
        if (!aborted) setIsLoading(false)
      }
    }
    fetchFloats()
    return () => { aborted = true }
  }, [region])

  const getFloatColor = (float: FloatData) => {
    if (float.status === 'inactive') return 'text-gray-400'
    const value = parameter === 'salinity' ? float.salinity : float.temperature
    if (value > (parameter === 'salinity' ? 36 : 29)) return 'text-red-400'
    if (value > (parameter === 'salinity' ? 35.5 : 27)) return 'text-orange-400'
    if (value > (parameter === 'salinity' ? 35 : 25)) return 'text-yellow-400'
    return 'text-blue-400'
  }

  const getFloatSize = (float: FloatData) => {
    if (float.status === 'inactive') return 'w-3 h-3'
    if (float.depth > 1500) return 'w-6 h-6'
    if (float.depth > 1000) return 'w-5 h-5'
    return 'w-4 h-4'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ocean-500/20 border-t-ocean-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading ocean data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full bg-gradient-to-br from-deep-800 to-ocean-900 rounded-lg overflow-hidden relative">
        {/* Ocean Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-ocean-400/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-blue-400/30 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Float Markers */}
        {floats.map((float, index) => (
          <motion.div
            key={float.id}
            className={`absolute cursor-pointer ${getFloatColor(float)} ${getFloatSize(float)}`}
            style={{
              left: `${((float.lon + 180) / 360) * 100}%`,
              top: `${((90 - float.lat) / 180) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => setSelectedFloat(float)}
          >
            <div className={`w-full h-full rounded-full ${float.status === 'active' ? 'bg-current animate-pulse' : 'bg-gray-400'}`}>
              <div className="w-full h-full rounded-full bg-white/20 animate-ping"></div>
            </div>
          </motion.div>
        ))}

        {/* Region Labels */}
        <div className="absolute top-4 left-4 text-white/80 text-sm font-medium">
          {region === 'global' ? 'Global Ocean' : 
           region === 'indian' ? 'Indian Ocean' :
           region === 'pacific' ? 'Pacific Ocean' : 'Atlantic Ocean'}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-xs text-white/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>Hot (29°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span>Warm (27-29°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Moderate (25-27°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Cool (25°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Inactive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Float Details Modal */}
      {selectedFloat && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 max-w-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white">Float {selectedFloat.id}</h4>
            <button
              onClick={() => setSelectedFloat(null)}
              className="text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <MapPin size={14} />
              <span>{selectedFloat.lat.toFixed(2)}°N, {selectedFloat.lon.toFixed(2)}°E</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Thermometer size={14} />
              <span>{selectedFloat.temperature}°C</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Droplets size={14} />
              <span>{selectedFloat.salinity} PSU</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Navigation size={14} />
              <span>{selectedFloat.depth}m depth</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <div className={`w-2 h-2 rounded-full ${selectedFloat.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="capitalize">{selectedFloat.status}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
