'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Waves, 
  Search, 
  BarChart3, 
  MapPin, 
  Brain, 
  Database, 
  Download,
  Globe,
  Thermometer,
  Droplets,
  Wind,
  Navigation,
  Users
} from 'lucide-react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Dashboard from '@/components/Dashboard'
import ChatInterface from '@/components/ChatInterface'
import DataVisualization from '@/components/DataVisualization'
import RealTimeUpdates from '@/components/RealTimeUpdates'
import DataExport from '@/components/DataExport'
import Collaboration from '@/components/Collaboration'
import Footer from '@/components/Footer'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(false)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'chat', label: 'AI Chat', icon: Brain },
    { id: 'visualize', label: 'Visualize', icon: Globe },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'collaborate', label: 'Collaborate', icon: Users },
    { id: 'explore', label: 'Explore', icon: Search },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-deep-900 via-deep-800 to-ocean-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-ocean-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-float"></div>
      </div>

      <Header />
      
      {activeTab === 'dashboard' && <Hero />}
      
      <div className="relative z-10">
        {/* Tab Navigation */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/25'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={20} />
                  {tab.label}
                </motion.button>
              )
            })}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'chat' && <ChatInterface />}
            {activeTab === 'visualize' && <DataVisualization />}
            {activeTab === 'export' && <DataExport />}
            {activeTab === 'collaborate' && <Collaboration />}
            {activeTab === 'explore' && <Features />}
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
