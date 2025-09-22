'use client'

import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Play, 
  BarChart3, 
  Brain, 
  Globe,
  Database,
  Zap,
  Shield,
  Users
} from 'lucide-react'

export default function Hero() {
  const features = [
    { icon: Brain, text: 'AI-Powered Queries', color: 'text-purple-400' },
    { icon: BarChart3, text: 'Real-time Visualization', color: 'text-blue-400' },
    { icon: Globe, text: 'Global Ocean Data', color: 'text-green-400' },
    { icon: Database, text: 'Structured Storage', color: 'text-orange-400' },
  ]

  const stats = [
    { label: 'ARGO Floats', value: '4,000+', icon: Globe },
    { label: 'Data Points', value: '50M+', icon: Database },
    { label: 'Ocean Coverage', value: '99%', icon: Shield },
    { label: 'Active Users', value: '1,200+', icon: Users },
  ]

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-ocean-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-float"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black mb-6">
              <span className="gradient-text">FloatChat</span>
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 mb-4 font-light">
              AI-Powered Ocean Data Discovery
            </p>
            <p className="text-lg md:text-xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
              Explore the depths of oceanographic data through intelligent conversation. 
              Query ARGO float data, visualize ocean parameters, and discover insights 
              with the power of AI.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.button
              className="btn-ocean px-8 py-4 rounded-full text-white font-semibold text-lg flex items-center gap-3 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Exploring
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </motion.button>
            
            <motion.button
              className="px-8 py-4 rounded-full border-2 border-white/20 text-white font-semibold text-lg flex items-center gap-3 hover:bg-white/10 transition-all group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="group-hover:scale-110 transition-transform" size={20} />
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                  whileHover={{ scale: 1.05, y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                  <span className="text-white/90 font-medium">{feature.text}</span>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  className="text-center group"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-ocean-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-ocean-500/25 transition-all">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/70 font-medium">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-ocean-400 rounded-full animate-float opacity-60"></div>
      <div className="absolute top-40 right-32 w-6 h-6 bg-blue-400 rounded-full animate-float opacity-40" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-32 left-32 w-3 h-3 bg-cyan-400 rounded-full animate-float opacity-50" style={{ animationDelay: '4s' }}></div>
    </section>
  )
}
