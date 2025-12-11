'use client'

import { motion } from 'motion/react'
import { Brain, MessageSquare, ShoppingBag, Sparkles, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

const LLMs = [
  {
    name: 'ChatGPT',
    icon: Brain,
    accent: '#0FA47F',
    glow: 'from-emerald-400/30 via-emerald-300/20 to-emerald-200/10',
    delay: 0,
  },
  {
    name: 'Gemini',
    icon: Sparkles,
    accent: '#0B7CFA',
    glow: 'from-sky-400/30 via-blue-500/20 to-cyan-300/10',
    delay: 0.15,
  },
  {
    name: 'Claude',
    icon: MessageSquare,
    accent: '#F59E0B',
    glow: 'from-amber-400/30 via-orange-400/20 to-amber-200/10',
    delay: 0.3,
  },
  {
    name: 'Grok',
    icon: Zap,
    accent: '#5CFF8F',
    glow: 'from-emerald-400/30 via-lime-400/20 to-emerald-200/10',
    delay: 0.45,
  },
]

// Pre-set scattered positions to feel organic around the hub
const LLM_POSITIONS = [
  { top: '14%', left: '22%' },
  { top: '18%', right: '18%' },
  { bottom: '20%', left: '28%' },
  { bottom: '16%', right: '24%' },
] as const

export function LLMConnectionVisualization() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden sm:h-[500px] md:h-[580px]">
      {/* Central e-commerce company node */}
      <motion.div
        className="relative z-20 flex h-32 w-32 items-center justify-center rounded-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={isVisible ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, type: 'spring', stiffness: 180 }}
      >
        <motion.div
          className="relative flex flex-col items-center justify-center"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-[0_18px_55px_-30px_rgba(59,130,246,0.75)] ring-2 ring-primary/20 sm:h-16 sm:w-16 md:h-20 md:w-20">
            <ShoppingBag className="h-7 w-7 text-primary-foreground sm:h-8 sm:w-8 md:h-9 md:w-9" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary/15"
            animate={{ scale: [1, 1.28, 1.55], opacity: [0.4, 0.14, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.p
            className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground sm:text-xs"
            initial={{ opacity: 0, y: 6 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.5 }}
          >
            E-commerce
          </motion.p>
        </motion.div>
      </motion.div>

      {/* LLM nodes placed around the hub */}
      {LLMs.map((llm, index) => {
        const position = LLM_POSITIONS[index % LLM_POSITIONS.length]

        return (
          <motion.div
            key={llm.name}
            className="absolute text-center"
            style={{
              ...position,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={isVisible ? { scale: 1, opacity: 1 } : {}}
            transition={{
              duration: 0.55,
              delay: 0.4 + llm.delay,
              type: 'spring',
              stiffness: 200,
            }}
          >
            <motion.div
              className="relative mx-auto h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-2xl border border-primary/20"
              style={{
                boxShadow: `0 10px 55px -28px ${llm.accent}aa`,
              }}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 3.4 + index * 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1 + llm.delay,
              }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${llm.glow} blur-xl opacity-60`} />
              <div className="relative flex h-full w-full items-center justify-center">
                <llm.icon
                  className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
                  color={llm.accent}
                />
              </div>
            </motion.div>
            <motion.p
              className="mt-2 text-center text-[11px] font-semibold uppercase tracking-wide text-foreground sm:text-xs"
              initial={{ opacity: 0, y: 8 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1 + llm.delay }}
            >
              {llm.name}
            </motion.p>
          </motion.div>
        )
      })}

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-primary/25"
          style={{
            left: `${20 + i * 13}%`,
            top: `${28 + (i % 3) * 18}%`,
          }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.15, 0.35, 0.15],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3.8 + i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.25,
          }}
        />
      ))}
    </div>
  )
}
