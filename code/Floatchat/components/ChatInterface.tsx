'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Download, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Settings,
  Zap,
  Brain,
  Database,
  Globe
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    queryType?: string
    dataPoints?: number
    visualization?: string
  }
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm FloatChat, your AI assistant for ocean data discovery. I can help you explore ARGO float data, visualize ocean parameters, and answer questions about marine science. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setMounted(true)
  }, [])

  const exampleQueries = [
    "Show me salinity profiles near the equator in March 2023",
    "Compare BGC parameters in the Arabian Sea for the last 6 months",
    "What are the nearest ARGO floats to this location?",
    "Visualize temperature trends in the Indian Ocean",
    "Find floats with the highest oxygen levels",
    "Show me data from floats deployed in 2024"
  ]

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const runtimeBase = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : ''
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || runtimeBase || ''
      const res = await fetch(`${baseUrl}/api/chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      })
      console.log('This is the chat data response', res)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response || 'I could not find relevant data.',
        timestamp: new Date(),
        metadata: {
          queryType: 'data_query',
          dataPoints: data.data_points ?? 0,
          visualization: 'chart'
        }
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const generateResponse = (query: string): string => {
    const responses = [
      `I found ${Math.floor(Math.random() * 500) + 50} data points matching your query about "${query}". The data shows interesting patterns in the ocean parameters you're interested in. Would you like me to create a visualization?`,
      `Based on your query, I've analyzed the ARGO float data and found some fascinating insights. The data indicates significant variations in the ocean parameters you mentioned. Let me show you the results.`,
      `Great question! I've processed your request and found relevant data from ${Math.floor(Math.random() * 20) + 5} ARGO floats. The analysis reveals important trends that could be valuable for your research.`,
      `I've successfully queried the ocean database for your request. The results show interesting patterns that I can visualize for you. Would you like to see a specific type of chart or map?`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleExampleClick = (query: string) => {
    setInput(query)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        {/* Chat Header */}
        <div className="p-6 border-b border-white/20 bg-gradient-to-r from-ocean-500/20 to-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-ocean-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-deep-900"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">FloatChat AI</h3>
                <p className="text-sm text-white/70">Ocean Data Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                <Settings size={18} />
              </button>
              <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-ocean-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user' 
                      ? 'bg-ocean-500 text-white ml-auto' 
                      : 'bg-white/10 text-white'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {message.metadata && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <div className="flex items-center gap-4 text-xs text-white/70">
                          <span className="flex items-center gap-1">
                            <Database size={12} />
                            {message.metadata.dataPoints} data points
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe size={12} />
                            {message.metadata.queryType}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-white/50">
                      {mounted ? message.timestamp.toLocaleTimeString() : ''}
                    </span>
                    {message.type === 'assistant' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1 text-white/50 hover:text-white/70 transition-colors"
                        >
                          <Copy size={12} />
                        </button>
                        <button className="p-1 text-white/50 hover:text-white/70 transition-colors">
                          <ThumbsUp size={12} />
                        </button>
                        <button className="p-1 text-white/50 hover:text-white/70 transition-colors">
                          <ThumbsDown size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-ocean-400 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin text-ocean-400" />
                  <span className="text-sm text-white/70">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Example Queries */}
        {messages.length === 1 && (
          <div className="p-6 border-t border-white/20">
            <h4 className="text-sm font-medium text-white/70 mb-3">Try asking:</h4>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.slice(0, 3).map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(query)}
                  className="px-3 py-2 text-xs bg-white/10 hover:bg-white/20 text-white/80 rounded-full transition-all"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 border-t border-white/20">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about ocean data..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <motion.button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-ocean-500 hover:bg-ocean-600 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
