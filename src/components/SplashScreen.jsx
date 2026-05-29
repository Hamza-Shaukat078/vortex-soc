import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export default function SplashScreen({ onDone }) {
  const [exit, setExit] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setExit(true), 2600)
    const t2 = setTimeout(() => onDone(), 3100)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6"
          style={{ background: '#000' }}
        >
          {/* Float wrapper — starts after entry settles */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            style={{ perspective: 800 }}
          >
            <motion.div
              style={{
                width: 380,
                height: 380,
                transformStyle: 'preserve-3d',
                WebkitMaskImage: 'radial-gradient(ellipse 72% 72% at 50% 50%, black 38%, transparent 72%)',
                maskImage: 'radial-gradient(ellipse 72% 72% at 50% 50%, black 38%, transparent 72%)',
              }}
              initial={{ opacity: 0, rotateY: 80, scale: 0.7 }}
              animate={{
                opacity: 1,
                rotateY: 0,
                scale: 1,
                filter: [
                  'drop-shadow(0 0 0px rgba(239,68,68,0))',
                  'drop-shadow(0 0 80px rgba(239,68,68,1)) drop-shadow(0 0 40px rgba(239,68,68,0.6))',
                  'drop-shadow(0 0 40px rgba(239,68,68,0.7)) drop-shadow(0 0 20px rgba(239,68,68,0.3))',
                ],
              }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src="./logo.png"
                alt="VORTEX"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            className="flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="text-4xl font-bold tracking-[0.18em]"
              style={{
                background: 'linear-gradient(90deg, #fff 40%, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              VORTEX
            </span>
            <span className="text-xs tracking-[0.35em] uppercase font-mono text-gray-600">
              SOC Threat Analyzer
            </span>
          </motion.div>

          {/* Progress line */}
          <motion.div
            className="overflow-hidden rounded-full"
            style={{ width: 140, height: 1.5, background: 'rgba(255,255,255,0.06)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #ef4444, #ff6b6b)' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ delay: 1.0, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
