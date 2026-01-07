/**
 * Confetti Celebration Component
 *
 * Lightweight CSS-based confetti animation for achievements.
 * No external dependencies required.
 */

'use client'

import { useEffect, useState } from 'react'

interface ConfettiPiece {
  id: number
  x: number
  emoji: string
  delay: number
  duration: number
}

interface ConfettiProps {
  active: boolean
  duration?: number
  onComplete?: () => void
}

const EMOJIS = ['🎉', '⭐', '✨', '🏆', '💪', '🔥', '💯', '🎊']

export function Confetti({ active, duration = 3000, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (active) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = []
      for (let i = 0; i < 30; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
        })
      }
      setPieces(newPieces)
      setIsVisible(true)

      // Hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [active, duration, onComplete])

  if (!isVisible || pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute text-2xl animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        >
          {piece.emoji}
        </span>
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg) scale(0);
            opacity: 1;
          }
          10% {
            transform: translateY(0) rotate(45deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  )
}
