'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Waves, 
  Menu, 
  X, 
  Settings, 
  User, 
  Bell,
  Download,
  Share2
} from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="relative z-50 bg-deep-900/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <Waves className="w-8 h-8 text-ocean-400 animate-wave" />
              <div className="absolute inset-0 w-8 h-8 bg-ocean-400/20 rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">FloatChat</h1>
              <p className="text-xs text-white/60">AI Ocean Data Discovery</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-white/80 hover:text-white transition-colors">
              Features
            </a>
            <a href="#data" className="text-white/80 hover:text-white transition-colors">
              Data Sources
            </a>
            <a href="#api" className="text-white/80 hover:text-white transition-colors">
              API
            </a>
            <a href="#about" className="text-white/80 hover:text-white transition-colors">
              About
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <motion.button
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={20} />
            </motion.button>
            
            <motion.button
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Download size={20} />
            </motion.button>

            <motion.button
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Share2 size={20} />
            </motion.button>

            <motion.button
              className="btn-ocean px-6 py-2 rounded-full text-white font-medium flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User size={18} />
              Sign In
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white/80 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 border-t border-white/10"
          >
            <nav className="flex flex-col gap-4 pt-4">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">
                Features
              </a>
              <a href="#data" className="text-white/80 hover:text-white transition-colors">
                Data Sources
              </a>
              <a href="#api" className="text-white/80 hover:text-white transition-colors">
                API
              </a>
              <a href="#about" className="text-white/80 hover:text-white transition-colors">
                About
              </a>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}
