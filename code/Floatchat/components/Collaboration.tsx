'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  Share2, 
  MessageCircle, 
  Bell, 
  Settings,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  Clock,
  Globe,
  Lock,
  Unlock
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Collaborator {
  id: string
  name: string
  email: string
  avatar: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'online' | 'offline' | 'away'
  lastActive: Date
}

interface SharedSession {
  id: string
  title: string
  description: string
  owner: string
  collaborators: Collaborator[]
  isPublic: boolean
  createdAt: Date
  lastActivity: Date
  permissions: {
    canEdit: boolean
    canShare: boolean
    canExport: boolean
  }
}

interface Activity {
  id: string
  user: string
  action: string
  description: string
  timestamp: Date
  type: 'query' | 'visualization' | 'export' | 'share'
}

export default function Collaboration() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'collaborators' | 'activity'>('sessions')
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SharedSession | null>(null)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [sharedSessions, setSharedSessions] = useState<SharedSession[]>([])
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Load mock data
    loadMockData()
  }, [])

  const loadMockData = () => {
    setCollaborators([
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@incois.gov.in',
        avatar: 'SJ',
        role: 'owner',
        status: 'online',
        lastActive: new Date()
      },
      {
        id: '2',
        name: 'Prof. Rajesh Kumar',
        email: 'rajesh.kumar@incois.gov.in',
        avatar: 'RK',
        role: 'admin',
        status: 'online',
        lastActive: new Date(Date.now() - 300000)
      },
      {
        id: '3',
        name: 'Dr. Maria Garcia',
        email: 'maria.garcia@ocean.edu',
        avatar: 'MG',
        role: 'editor',
        status: 'away',
        lastActive: new Date(Date.now() - 600000)
      },
      {
        id: '4',
        name: 'Dr. Chen Wei',
        email: 'chen.wei@marine.cn',
        avatar: 'CW',
        role: 'viewer',
        status: 'offline',
        lastActive: new Date(Date.now() - 3600000)
      }
    ])

    setSharedSessions([
      {
        id: '1',
        title: 'Indian Ocean Temperature Analysis',
        description: 'Comprehensive analysis of temperature trends in the Indian Ocean region',
        owner: 'Dr. Sarah Johnson',
        collaborators: [
          { id: '2', name: 'Prof. Rajesh Kumar', email: 'rajesh.kumar@incois.gov.in', avatar: 'RK', role: 'admin', status: 'online', lastActive: new Date() },
          { id: '3', name: 'Dr. Maria Garcia', email: 'maria.garcia@ocean.edu', avatar: 'MG', role: 'editor', status: 'away', lastActive: new Date() }
        ],
        isPublic: false,
        createdAt: new Date(Date.now() - 86400000),
        lastActivity: new Date(Date.now() - 1800000),
        permissions: {
          canEdit: true,
          canShare: true,
          canExport: true
        }
      },
      {
        id: '2',
        title: 'Global ARGO Float Distribution',
        description: 'Real-time monitoring of ARGO float distribution worldwide',
        owner: 'Prof. Rajesh Kumar',
        collaborators: [
          { id: '1', name: 'Dr. Sarah Johnson', email: 'sarah.johnson@incois.gov.in', avatar: 'SJ', role: 'owner', status: 'online', lastActive: new Date() }
        ],
        isPublic: true,
        createdAt: new Date(Date.now() - 172800000),
        lastActivity: new Date(Date.now() - 3600000),
        permissions: {
          canEdit: false,
          canShare: true,
          canExport: false
        }
      }
    ])

    setActivities([
      {
        id: '1',
        user: 'Dr. Sarah Johnson',
        action: 'created',
        description: 'new visualization for temperature trends',
        timestamp: new Date(Date.now() - 300000),
        type: 'visualization'
      },
      {
        id: '2',
        user: 'Prof. Rajesh Kumar',
        action: 'shared',
        description: 'session with Dr. Maria Garcia',
        timestamp: new Date(Date.now() - 600000),
        type: 'share'
      },
      {
        id: '3',
        user: 'Dr. Maria Garcia',
        action: 'exported',
        description: 'data in NetCDF format',
        timestamp: new Date(Date.now() - 900000),
        type: 'export'
      },
      {
        id: '4',
        user: 'Dr. Chen Wei',
        action: 'queried',
        description: 'salinity data for Pacific region',
        timestamp: new Date(Date.now() - 1200000),
        type: 'query'
      }
    ])
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-purple-400 bg-purple-400/20'
      case 'admin': return 'text-blue-400 bg-blue-400/20'
      case 'editor': return 'text-green-400 bg-green-400/20'
      case 'viewer': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400'
      case 'away': return 'bg-yellow-400'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'query': return <MessageCircle className="w-4 h-4 text-blue-400" />
      case 'visualization': return <Globe className="w-4 h-4 text-green-400" />
      case 'export': return <Share2 className="w-4 h-4 text-purple-400" />
      case 'share': return <Users className="w-4 h-4 text-orange-400" />
      default: return <MessageCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const handleShareSession = (session: SharedSession) => {
    setSelectedSession(session)
    setIsShareModalOpen(true)
  }

  const handleCopyLink = (sessionId: string) => {
    const link = `${window.location.origin}/shared/${sessionId}`
    navigator.clipboard.writeText(link)
    toast.success('Link copied to clipboard!')
  }

  const handleInviteCollaborator = (email: string, role: string) => {
    // Simulate invitation
    toast.success(`Invitation sent to ${email}`)
    setIsShareModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Collaboration</h2>
          <p className="text-white/70">Share sessions and collaborate with your team</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
            <UserPlus size={16} />
            Invite
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg transition-all">
            <Share2 size={16} />
            Share Session
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/10 rounded-lg p-1">
        {[
          { id: 'sessions', name: 'Shared Sessions', icon: Globe },
          { id: 'collaborators', name: 'Collaborators', icon: Users },
          { id: 'activity', name: 'Activity', icon: Bell }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-ocean-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={16} />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Shared Sessions */}
        {activeTab === 'sessions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sharedSessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{session.title}</h3>
                      {session.isPublic ? (
                        <Globe className="w-4 h-4 text-green-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-orange-400" />
                      )}
                    </div>
                    <p className="text-white/70 text-sm mb-3">{session.description}</p>
                    <div className="text-xs text-white/50">
                      Created by {session.owner} • {formatTimeAgo(session.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShareSession(session)}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={() => handleCopyLink(session.id)}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                {/* Collaborators */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">Collaborators</span>
                  </div>
                  <div className="flex -space-x-2">
                    {session.collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="relative w-8 h-8 rounded-full bg-ocean-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-deep-800"
                        title={collaborator.name}
                      >
                        {collaborator.avatar}
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-deep-800 ${getStatusColor(collaborator.status)}`}></div>
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white/70 text-xs border-2 border-deep-800">
                      +{session.collaborators.length}
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="flex gap-2 text-xs">
                  {session.permissions.canEdit && (
                    <span className="px-2 py-1 bg-green-400/20 text-green-400 rounded-full">
                      Edit
                    </span>
                  )}
                  {session.permissions.canShare && (
                    <span className="px-2 py-1 bg-blue-400/20 text-blue-400 rounded-full">
                      Share
                    </span>
                  )}
                  {session.permissions.canExport && (
                    <span className="px-2 py-1 bg-purple-400/20 text-purple-400 rounded-full">
                      Export
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Collaborators */}
        {activeTab === 'collaborators' && (
          <div className="space-y-4">
            {collaborators.map((collaborator) => (
              <motion.div
                key={collaborator.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-ocean-500 flex items-center justify-center text-white font-semibold">
                      {collaborator.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-deep-800 ${getStatusColor(collaborator.status)}`}></div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">{collaborator.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(collaborator.role)}`}>
                        {collaborator.role}
                      </span>
                    </div>
                    <p className="text-sm text-white/70">{collaborator.email}</p>
                    <p className="text-xs text-white/50">
                      Last active {formatTimeAgo(collaborator.lastActive)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                    <MessageCircle size={16} />
                  </button>
                  <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                    <Settings size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Activity Feed */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{activity.user}</span>
                    <span className="text-white/70">{activity.action}</span>
                    <span className="text-white/60">{activity.description}</span>
                  </div>
                  <div className="text-xs text-white/50">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {isShareModalOpen && selectedSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsShareModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-deep-800 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share Session</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">{selectedSession.title}</h4>
                <p className="text-sm text-white/70">{selectedSession.description}</p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg">
                <input
                  type="text"
                  value={`${window.location.origin}/shared/${selectedSession.id}`}
                  readOnly
                  className="flex-1 bg-transparent text-white text-sm"
                />
                <button
                  onClick={() => handleCopyLink(selectedSession.id)}
                  className="p-2 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg transition-all"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="text-xs text-white/50">
                {selectedSession.isPublic ? 'This session is public' : 'This session is private'}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
