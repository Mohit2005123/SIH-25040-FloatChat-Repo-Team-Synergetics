import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FloatChat - AI-Powered Ocean Data Discovery',
  description: 'Discover and visualize ARGO ocean data through intelligent conversation',
  keywords: 'ocean data, ARGO floats, AI, visualization, oceanography, marine science',
  authors: [{ name: 'FloatChat Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #0ea5e9',
            },
          }}
        />
      </body>
    </html>
  )
}
