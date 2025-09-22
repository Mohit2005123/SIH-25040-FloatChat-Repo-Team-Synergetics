'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  FileText, 
  Database, 
  Globe, 
  Calendar,
  Filter,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ExportFormat {
  id: string
  name: string
  description: string
  icon: any
  extension: string
  size: string
}

interface ExportRequest {
  id: string
  format: string
  parameters: string[]
  timeRange: string
  region: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  createdAt: Date
  completedAt?: Date
  downloadUrl?: string
  fileSize?: number
}

export default function DataExport() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('csv')
  const [selectedParameters, setSelectedParameters] = useState<string[]>(['temperature', 'salinity'])
  const [timeRange, setTimeRange] = useState('7d')
  const [region, setRegion] = useState('global')
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([])
  const [isExporting, setIsExporting] = useState(false)

  const exportFormats: ExportFormat[] = [
    {
      id: 'csv',
      name: 'CSV',
      description: 'Comma-separated values for spreadsheet analysis',
      icon: FileText,
      extension: '.csv',
      size: '~2.5 MB'
    },
    {
      id: 'netcdf',
      name: 'NetCDF',
      description: 'Network Common Data Format for scientific applications',
      icon: Database,
      extension: '.nc',
      size: '~15.2 MB'
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'JavaScript Object Notation for API integration',
      icon: Globe,
      extension: '.json',
      size: '~8.7 MB'
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Microsoft Excel format with multiple sheets',
      icon: FileText,
      extension: '.xlsx',
      size: '~12.3 MB'
    }
  ]

  const parameters = [
    { id: 'temperature', name: 'Temperature', unit: '°C' },
    { id: 'salinity', name: 'Salinity', unit: 'PSU' },
    { id: 'pressure', name: 'Pressure', unit: 'dbar' },
    { id: 'oxygen', name: 'Dissolved Oxygen', unit: 'mg/L' },
    { id: 'ph', name: 'pH', unit: 'pH' },
    { id: 'chlorophyll', name: 'Chlorophyll', unit: 'mg/m³' }
  ]

  const timeRanges = [
    { id: '24h', name: '24 Hours' },
    { id: '7d', name: '7 Days' },
    { id: '30d', name: '30 Days' },
    { id: '90d', name: '90 Days' },
    { id: '1y', name: '1 Year' },
    { id: 'custom', name: 'Custom Range' }
  ]

  const regions = [
    { id: 'global', name: 'Global' },
    { id: 'indian', name: 'Indian Ocean' },
    { id: 'pacific', name: 'Pacific Ocean' },
    { id: 'atlantic', name: 'Atlantic Ocean' },
    { id: 'southern', name: 'Southern Ocean' }
  ]

  const handleParameterToggle = (parameterId: string) => {
    setSelectedParameters(prev => 
      prev.includes(parameterId) 
        ? prev.filter(p => p !== parameterId)
        : [...prev, parameterId]
    )
  }

  const handleExport = async () => {
    if (selectedParameters.length === 0) {
      toast.error('Please select at least one parameter')
      return
    }

    setIsExporting(true)
    
    const exportRequest: ExportRequest = {
      id: `export_${Date.now()}`,
      format: selectedFormat,
      parameters: selectedParameters,
      timeRange,
      region,
      status: 'pending',
      progress: 0,
      createdAt: new Date()
    }

    setExportRequests(prev => [exportRequest, ...prev])
    setIsOpen(false)
    toast.success('Export started')

    // Simulate export process
    simulateExport(exportRequest.id)
  }

  const simulateExport = async (requestId: string) => {
    // Simulate processing
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setExportRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, progress, status: 'processing' as const }
            : req
        )
      )
    }

    // Mark as completed
    setExportRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'completed' as const,
              progress: 100,
              completedAt: new Date(),
              downloadUrl: '#',
              fileSize: Math.floor(Math.random() * 50000000) + 1000000
            }
          : req
      )
    )

    toast.success('Export completed!')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-400 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Data Export</h2>
          <p className="text-white/70">Export ocean data in various formats for analysis</p>
        </div>
        
        <motion.button
          onClick={() => setIsOpen(true)}
          className="btn-ocean px-6 py-3 rounded-full text-white font-semibold flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={20} />
          Export Data
        </motion.button>
      </div>

      {/* Export History */}
      {exportRequests.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Export History</h3>
          <div className="space-y-3">
            {exportRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(request.status)}
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">
                        {exportFormats.find(f => f.id === request.format)?.name} Export
                      </span>
                      <span className="text-sm text-white/70">
                        {request.parameters.length} parameters
                      </span>
                    </div>
                    <div className="text-sm text-white/60">
                      {request.region} • {timeRanges.find(t => t.id === request.timeRange)?.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {request.status === 'processing' && (
                    <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-ocean-400 transition-all duration-300"
                        style={{ width: `${request.progress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  <div className="text-right">
                    <div className="text-sm text-white/70">
                      {request.status === 'completed' && request.fileSize 
                        ? formatFileSize(request.fileSize)
                        : `${request.progress}%`
                      }
                    </div>
                    <div className="text-xs text-white/50">
                      {request.createdAt.toLocaleTimeString()}
                    </div>
                  </div>

                  {request.status === 'completed' && request.downloadUrl && (
                    <button className="p-2 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg transition-all">
                      <Download size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-deep-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Export Ocean Data</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Export Format</h4>
                <div className="grid grid-cols-2 gap-3">
                  {exportFormats.map((format) => {
                    const Icon = format.icon
                    return (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`p-4 rounded-lg border transition-all text-left ${
                          selectedFormat === format.id
                            ? 'border-ocean-500 bg-ocean-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className="w-5 h-5 text-ocean-400" />
                          <span className="font-medium text-white">{format.name}</span>
                        </div>
                        <p className="text-sm text-white/70 mb-2">{format.description}</p>
                        <div className="text-xs text-white/50">{format.size}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Parameter Selection */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Parameters</h4>
                <div className="grid grid-cols-2 gap-2">
                  {parameters.map((param) => (
                    <button
                      key={param.id}
                      onClick={() => handleParameterToggle(param.id)}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        selectedParameters.includes(param.id)
                          ? 'border-ocean-500 bg-ocean-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white">{param.name}</span>
                        <span className="text-xs text-white/50">{param.unit}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range and Region */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Time Range</h4>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {timeRanges.map((range) => (
                      <option key={range.id} value={range.id} className="bg-deep-800">
                        {range.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Region</h4>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {regions.map((reg) => (
                      <option key={reg.id} value={reg.id} className="bg-deep-800">
                        {reg.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Export Summary */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Export Summary</h4>
                <div className="space-y-2 text-sm text-white/70">
                  <div>Format: {exportFormats.find(f => f.id === selectedFormat)?.name}</div>
                  <div>Parameters: {selectedParameters.length} selected</div>
                  <div>Time Range: {timeRanges.find(t => t.id === timeRange)?.name}</div>
                  <div>Region: {regions.find(r => r.id === region)?.name}</div>
                  <div>Estimated Size: {exportFormats.find(f => f.id === selectedFormat)?.size}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting || selectedParameters.length === 0}
                  className="flex-1 px-6 py-3 bg-ocean-500 hover:bg-ocean-600 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Start Export
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
