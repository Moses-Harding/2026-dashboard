/**
 * Celebration Provider
 *
 * Context provider for triggering celebration animations
 * from anywhere in the app.
 */

'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { Confetti } from '@/components/ui/confetti'
import { toast } from 'sonner'

interface CelebrationContextType {
  celebrate: (message?: string) => void
}

const CelebrationContext = createContext<CelebrationContextType | null>(null)

export function useCelebration() {
  const context = useContext(CelebrationContext)
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider')
  }
  return context
}

interface CelebrationProviderProps {
  children: ReactNode
}

export function CelebrationProvider({ children }: CelebrationProviderProps) {
  const [isActive, setIsActive] = useState(false)

  const celebrate = useCallback((message?: string) => {
    setIsActive(true)
    if (message) {
      toast.success(message, {
        icon: '🎉',
        duration: 5000,
      })
    }
  }, [])

  const handleComplete = useCallback(() => {
    setIsActive(false)
  }, [])

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
      <Confetti active={isActive} onComplete={handleComplete} />
    </CelebrationContext.Provider>
  )
}
