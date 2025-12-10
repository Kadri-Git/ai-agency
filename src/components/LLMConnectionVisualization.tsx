'use client'

import { motion } from 'motion/react'
import { ShoppingBag, Sparkles, Brain, Zap, MessageSquare } from 'lucide-react'
import { useEffect, useState } from 'react'

const LLMs = [
  { name: 'ChatGPT', icon: Brain, color: 'primary', delay: 0 },
  { name: 'Gemini', icon: Sparkles, color: 'secondary', delay: 0.2 },
  { name: 'Claude', icon: MessageSquare, color: 'primary', delay: 0.4 },
  { name: 'Grok', icon: Zap, color: 'secondary', delay: 0.6 },
]

export function LLMConnectionVisualization() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Color values matching our theme (cyan for primary, purple for secondary)
  const primaryColor = '#3b82f6' // Cyan blue
  const secondaryColor = '#a855f7' // Purple

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5" />
      
      {/* Central E-commerce Store Node */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        initial={{ scale: 0, opacity: 0 }}
        animate={isVisible ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl border-4 border-primary/30">
            <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-primary-foreground" />
          </div>
          {/* Pulsing ring effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-4 border-primary/20"
            animate={{
              scale: [1, 1.5, 1.8],
              opacity: [0.5, 0.2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </motion.div>
        <motion.p
          className="text-center mt-3 sm:mt-4 text-xs sm:text-sm font-bold text-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Your E-commerce Store
        </motion.p>
      </motion.div>

      {/* LLM Nodes positioned around the center */}
      {LLMs.map((llm, index) => {
        const angle = (index * 360) / LLMs.length - 90 // Start from top
        const radius = 180 // Distance from center
        const x = Math.cos((angle * Math.PI) / 180) * radius
        const y = Math.sin((angle * Math.PI) / 180) * radius

        return (
          <div key={llm.name} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Connection Line */}
            <motion.svg
              className="absolute"
              width="100%"
              height="100%"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
              }}
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 + llm.delay }}
            >
              <motion.line
                x1="50%"
                y1="50%"
                x2={`${50 + (x / radius) * 50}%`}
                y2={`${50 + (y / radius) * 50}%`}
                stroke={llm.color === 'primary' ? primaryColor : secondaryColor}
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity={0.3}
                initial={{ pathLength: 0 }}
                animate={isVisible ? { pathLength: 1 } : {}}
                transition={{ duration: 1, delay: 0.7 + llm.delay }}
              />
              {/* Animated pulse along the line */}
              <motion.circle
                r="4"
                fill={llm.color === 'primary' ? primaryColor : secondaryColor}
                opacity={0.6}
                initial={{ pathLength: 0 }}
                animate={{
                  cx: [`${50 + (x / radius) * 50}%`, '50%'],
                  cy: [`${50 + (y / radius) * 50}%`, '50%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1 + llm.delay
                }}
              />
            </motion.svg>

            {/* LLM Node */}
            <motion.div
              className="absolute"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.8 + llm.delay,
                type: "spring",
                stiffness: 200
              }}
            >
              <motion.div
                className={`h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-xl ${
                  llm.color === 'primary'
                    ? 'bg-gradient-to-br from-primary to-primary/80 border-primary/30'
                    : 'bg-gradient-to-br from-secondary to-secondary/80 border-secondary/30'
                } flex items-center justify-center shadow-xl border-2`}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2 + index * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.2 + llm.delay
                }}
              >
                <llm.icon className={`h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 ${
                  llm.color === 'primary' ? 'text-primary-foreground' : 'text-secondary-foreground'
                }`} />
              </motion.div>
              <motion.p
                className={`text-center mt-2 text-xs sm:text-sm font-bold ${
                  llm.color === 'primary' ? 'text-primary' : 'text-secondary'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.1 + llm.delay }}
              >
                {llm.name}
              </motion.p>
            </motion.div>
          </div>
        )
      })}

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/20"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}

