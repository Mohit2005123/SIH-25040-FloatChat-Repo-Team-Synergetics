'use client'

import { motion } from 'framer-motion'
import { 
  Waves, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  ExternalLink,
  MapPin,
  Phone,
  Globe
} from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'API Documentation', href: '#api' },
      { name: 'Data Sources', href: '#data' },
      { name: 'Pricing', href: '#pricing' },
    ],
    Resources: [
      { name: 'Documentation', href: '#docs' },
      { name: 'Tutorials', href: '#tutorials' },
      { name: 'Blog', href: '#blog' },
      { name: 'Support', href: '#support' },
    ],
    Company: [
      { name: 'About Us', href: '#about' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' },
      { name: 'Privacy Policy', href: '#privacy' },
    ],
    Community: [
      { name: 'GitHub', href: 'https://github.com', icon: Github },
      { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
      { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
      { name: 'Discord', href: '#discord', icon: ExternalLink },
    ]
  }

  const partners = [
    'INCOIS',
    'MoES',
    'Argo Program',
    'Ocean Data',
    'Marine Science'
  ]

  return (
    <footer className="bg-deep-900/80 backdrop-blur-md border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <Waves className="w-8 h-8 text-ocean-400 animate-wave" />
                <div className="absolute inset-0 w-8 h-8 bg-ocean-400/20 rounded-full animate-ping"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold gradient-text">FloatChat</h3>
                <p className="text-sm text-white/60">AI Ocean Data Discovery</p>
              </div>
            </motion.div>
            
            <motion.p
              className="text-white/70 mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Empowering ocean research and discovery through AI-powered data analysis. 
              Making complex oceanographic data accessible to everyone.
            </motion.p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/70">
                <MapPin size={16} />
                <span className="text-sm">Indian National Centre for Ocean Information Services</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Phone size={16} />
                <span className="text-sm">+91-40-2389-5000</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Mail size={16} />
                <span className="text-sm">info@incois.gov.in</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Globe size={16} />
                <span className="text-sm">incois.gov.in</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <div key={category}>
              <motion.h4
                className="text-lg font-semibold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + categoryIndex * 0.1 }}
              >
                {category}
              </motion.h4>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => {
                  const Icon = link.icon
                  return (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + categoryIndex * 0.1 + linkIndex * 0.05 }}
                    >
                      <a
                        href={link.href}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                      >
                        {Icon && <Icon size={14} className="group-hover:scale-110 transition-transform" />}
                        <span className="text-sm">{link.name}</span>
                        {link.href.startsWith('http') && (
                          <ExternalLink size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        )}
                      </a>
                    </motion.li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Partners Section */}
        <motion.div
          className="border-t border-white/10 pt-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h4 className="text-lg font-semibold text-white mb-6 text-center">Trusted by Leading Organizations</h4>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {partners.map((partner, index) => (
              <motion.div
                key={partner}
                className="text-white/50 hover:text-white/70 transition-colors cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm font-medium">{partner}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-white/60 text-sm">
            © {currentYear} FloatChat. All rights reserved. Built for Smart India Hackathon 2025.
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#privacy" className="text-white/60 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="text-white/60 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#cookies" className="text-white/60 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </motion.div>

        {/* Hackathon Badge */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ocean-500/20 to-blue-500/20 border border-ocean-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white/80 font-medium">
              Smart India Hackathon 2025 - Problem Statement #25040
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
