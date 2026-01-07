/**
 * Root Layout
 *
 * This is like App.swift in iOS - it wraps the entire application.
 * Every page inherits this layout (fonts, dark mode, global styles).
 */

import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { CelebrationProvider } from '@/components/providers/celebration-provider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '2026 Dashboard',
  description: 'Track your fitness journey with automated data import and progress visualization',
  // PWA configuration for mobile "Add to Home Screen"
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '2026 Dashboard',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a', // Dark background color
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning prevents hydration mismatch warning for dark class
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <CelebrationProvider>
          {children}
          {/* Toaster for notifications (like iOS toast/alert) */}
          <Toaster richColors position="top-center" />
        </CelebrationProvider>
      </body>
    </html>
  )
}
