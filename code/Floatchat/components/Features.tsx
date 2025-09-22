'use client'

import { motion } from 'framer-motion'
import { 
  Brain, 
  BarChart3, 
  Globe, 
  Database, 
  Zap, 
  Shield, 
  Users, 
  Download,
  Search,
  Filter,
  TrendingUp,
  Layers,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Share2,
  Eye,
  EyeOff,
  Activity,
  Clock,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Navigation
} from 'lucide-react'

export default function Features() {
  const mainFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered Queries',
      description: 'Ask questions in natural language and get intelligent responses about ocean data',
      color: 'from-purple-500 to-pink-500',
      details: [
        'Natural language processing for complex queries',
        'Context-aware responses with data insights',
        'Multi-language support for global accessibility',
        'Learning from user interactions'
      ]
    },
    {
      icon: BarChart3,
      title: 'Real-time Visualization',
      description: 'Interactive charts, maps, and 3D visualizations of ocean parameters',
      color: 'from-blue-500 to-cyan-500',
      details: [
        'Live data streaming and updates',
        'Interactive charts with zoom and pan',
        '3D ocean profile visualizations',
        'Customizable dashboard layouts'
      ]
    },
    {
      icon: Globe,
      title: 'Global Ocean Coverage',
      description: 'Access data from ARGO floats across all major ocean basins',
      color: 'from-green-500 to-teal-500',
      details: [
        '99% global ocean coverage',
        'Real-time float tracking',
        'Multi-resolution data access',
        'Regional and basin-specific views'
      ]
    },
    {
      icon: Database,
      title: 'Structured Data Storage',
      description: 'Efficient storage and retrieval of massive ocean datasets',
      color: 'from-orange-500 to-red-500',
      details: [
        'PostgreSQL for structured data',
        'Vector database for metadata',
        'Optimized query performance',
        'Data compression and indexing'
      ]
    }
  ]

  const advancedFeatures = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance for real-time data processing',
      metrics: '< 100ms response time'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security and data protection',
      metrics: '99.9% uptime'
    },
    {
      icon: Users,
      title: 'Collaborative',
      description: 'Share insights and collaborate with your team',
      metrics: 'Unlimited users'
    },
    {
      icon: Download,
      title: 'Export Ready',
      description: 'Export data in multiple formats',
      metrics: '10+ formats'
    }
  ]

  const useCases = [
    {
      title: 'Marine Research',
      description: 'Scientists can quickly analyze ocean trends and patterns',
      icon: Search,
      color: 'text-blue-400'
    },
    {
      title: 'Climate Monitoring',
      description: 'Track climate change impacts on ocean systems',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      title: 'Educational Tool',
      description: 'Students learn oceanography through interactive data',
      icon: Users,
      color: 'text-purple-400'
    },
    {
      title: 'Policy Making',
      description: 'Data-driven decisions for ocean conservation',
      icon: Shield,
      color: 'text-orange-400'
    }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto">
        <motion.h2
          className="text-4xl md:text-6xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Powerful Features for{' '}
          <span className="gradient-text">Ocean Data Discovery</span>
        </motion.h2>
        <motion.p
          className="text-xl text-white/70 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Discover the full potential of ocean data with our comprehensive suite of AI-powered tools
        </motion.p>
      </div>

      {/* Main Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {mainFeatures.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-white/70 mb-6 text-lg leading-relaxed">{feature.description}</p>
              
              <ul className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 bg-ocean-400 rounded-full flex-shrink-0"></div>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )
        })}
      </div>

      {/* Advanced Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {advancedFeatures.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center group hover:bg-white/15 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
              <p className="text-white/70 text-sm mb-3">{feature.description}</p>
              <div className="text-ocean-400 font-semibold text-sm">{feature.metrics}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Use Cases */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <motion.h3
          className="text-3xl font-bold text-white text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Perfect For
        </motion.h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon
            return (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-all">
                  <Icon className={`w-8 h-8 ${useCase.color}`} />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{useCase.title}</h4>
                <p className="text-white/70 text-sm">{useCase.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="bg-gradient-to-r from-ocean-500/20 to-blue-500/20 rounded-2xl p-8 border border-ocean-500/30">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-white mb-4">Try It Yourself</h3>
          <p className="text-white/70 text-lg">Experience the power of AI-driven ocean data discovery</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-purple-400" />
              <h4 className="text-lg font-semibold text-white">Ask Questions</h4>
            </div>
            <p className="text-white/70 text-sm mb-4">
              "Show me temperature trends in the Indian Ocean for the last 6 months"
            </p>
            <button className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all">
              Try AI Chat
            </button>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-blue-400" />
              <h4 className="text-lg font-semibold text-white">Explore Data</h4>
            </div>
            <p className="text-white/70 text-sm mb-4">
              Interactive maps and visualizations of global ocean data
            </p>
            <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all">
              View Dashboard
            </button>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-green-400" />
              <h4 className="text-lg font-semibold text-white">Export Results</h4>
            </div>
            <p className="text-white/70 text-sm mb-4">
              Download data in multiple formats for further analysis
            </p>
            <button className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all">
              Download Data
            </button>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <motion.div
          className="inline-block"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <button className="btn-ocean px-8 py-4 rounded-full text-white font-semibold text-lg flex items-center gap-3 mx-auto group">
            Get Started Today
            <div className="group-hover:translate-x-1 transition-transform">
              →
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
