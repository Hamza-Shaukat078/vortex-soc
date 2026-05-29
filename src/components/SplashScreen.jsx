import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('in') // in → hold → out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400)
    const t2 = setTimeout(() => setPhase('out'), 2400)
    const t3 = setTimeout(() => onDone(), 2900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: '#020509' }}
        >
          {/* Hex grid background */}
          <HexGrid />

          {/* Outer slow ring */}
          <motion.div
            className="absolute rounded-full border border-red-500/10"
            style={{ width: 520, height: 520 }}
            animate={{ rotate: 360, scale: [1, 1.02, 1] }}
            transition={{ rotate: { duration: 18, repeat: Infinity, ease: 'linear' }, scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
          />

          {/* Dashed rotating ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 420, height: 420,
              border: '1px dashed rgba(239,68,68,0.2)',
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />

          {/* Conic gradient spinning ring */}
          <motion.div
            className="absolute rounded-full"
            style={{ width: 320, height: 320, padding: 2 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-full h-full rounded-full"
              style={{ background: 'conic-gradient(from 0deg, transparent 60%, #ef4444, #3b82f6, #22c55e, transparent)' }} />
          </motion.div>

          {/* Inner glow ring */}
          <motion.div
            className="absolute rounded-full"
            style={{ width: 260, height: 260 }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.6, 0.3, 0.6], scale: 1 }}
            transition={{ opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.6 } }}
          >
            <div className="w-full h-full rounded-full"
              style={{ boxShadow: '0 0 60px rgba(239,68,68,0.15), inset 0 0 40px rgba(239,68,68,0.05)' }} />
          </motion.div>

          {/* Center logo plate */}
          <motion.div
            className="relative flex flex-col items-center justify-center"
            style={{ width: 220, height: 220 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {/* Logo */}
            <motion.div
              className="relative flex items-center justify-center mb-3"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.img
                src="/vortex-soc/logo.png"
                alt="VORTEX"
                className="w-24 h-24 object-contain rounded-2xl"
                style={{ filter: 'drop-shadow(0 0 24px rgba(239,68,68,0.6))' }}
                animate={{ filter: [
                  'drop-shadow(0 0 18px rgba(239,68,68,0.5))',
                  'drop-shadow(0 0 36px rgba(239,68,68,0.9))',
                  'drop-shadow(0 0 18px rgba(239,68,68,0.5))',
                ]}}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Corner accents */}
              {[0,1,2,3].map(i => (
                <motion.div key={i}
                  className="absolute w-3 h-3 border-red-500/60"
                  style={{
                    top: i < 2 ? -6 : 'auto', bottom: i >= 2 ? -6 : 'auto',
                    left: i % 2 === 0 ? -6 : 'auto', right: i % 2 === 1 ? -6 : 'auto',
                    borderTopWidth: i < 2 ? 1.5 : 0, borderBottomWidth: i >= 2 ? 1.5 : 0,
                    borderLeftWidth: i % 2 === 0 ? 1.5 : 0, borderRightWidth: i % 2 === 1 ? 1.5 : 0,
                  }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>

            {/* VORTEX glitch text */}
            <GlitchText />

            {/* Subtitle */}
            <motion.p
              className="text-xs tracking-[0.3em] uppercase font-mono mt-1"
              style={{ color: 'rgba(156,163,175,0.6)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              SOC Threat Analyzer
            </motion.p>

            {/* Loading bar */}
            <motion.div
              className="mt-5 relative overflow-hidden rounded-full"
              style={{ width: 160, height: 2, background: 'rgba(255,255,255,0.05)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: 'linear-gradient(90deg, #ef4444, #3b82f6)' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Shimmer */}
              <motion.div
                className="absolute inset-y-0 w-8 rounded-full"
                style={{ background: 'rgba(255,255,255,0.3)' }}
                animate={{ x: [-32, 192] }}
                transition={{ duration: 1.8, delay: 0.5, ease: 'linear' }}
              />
            </motion.div>

            {/* Initializing text */}
            <TypingText />
          </motion.div>

          {/* Scan line sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(239,68,68,0.03) 50%, transparent 60%)' }}
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />

          {/* Corner brackets */}
          <CornerBrackets />

          {/* Bottom status */}
          <motion.div
            className="absolute bottom-10 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-green-400"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs font-mono text-gray-600 tracking-widest">SYSTEMS ONLINE</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function GlitchText() {
  const [glitch, setGlitch] = useState(false)

  useEffect(() => {
    const run = () => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 120)
    }
    const intervals = [
      setTimeout(run, 800),
      setTimeout(run, 1400),
      setTimeout(run, 1900),
    ]
    return () => intervals.forEach(clearTimeout)
  }, [])

  return (
    <div className="relative">
      <motion.h1
        className="text-5xl font-bold tracking-tighter leading-none select-none"
        style={{
          background: 'linear-gradient(90deg, #fff 30%, #ef4444)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'Space Grotesk, sans-serif',
          filter: glitch ? 'drop-shadow(2px 0 #ef4444) drop-shadow(-2px 0 #3b82f6)' : 'none',
          transform: glitch ? 'skewX(-2deg)' : 'none',
          transition: 'filter 0.05s, transform 0.05s',
        }}
        initial={{ opacity: 0, letterSpacing: '0.5em' }}
        animate={{ opacity: 1, letterSpacing: '-0.02em' }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        VORTEX
      </motion.h1>
      {glitch && (
        <>
          <span className="absolute inset-0 text-5xl font-bold tracking-tighter text-red-500/40 select-none"
            style={{ fontFamily: 'Space Grotesk, sans-serif', transform: 'translate(3px, 0)', clipPath: 'polygon(0 30%, 100% 30%, 100% 60%, 0 60%)' }}>
            VORTEX
          </span>
          <span className="absolute inset-0 text-5xl font-bold tracking-tighter text-blue-500/40 select-none"
            style={{ fontFamily: 'Space Grotesk, sans-serif', transform: 'translate(-3px, 0)', clipPath: 'polygon(0 55%, 100% 55%, 100% 80%, 0 80%)' }}>
            VORTEX
          </span>
        </>
      )}
    </div>
  )
}

function TypingText() {
  const messages = ['Initializing modules…', 'Loading threat intel…', 'Ready.']
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setIdx(1), 900)
    const t2 = setTimeout(() => setIdx(2), 1700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <motion.p
      key={idx}
      className="text-xs font-mono mt-2"
      style={{ color: idx === 2 ? 'rgba(34,197,94,0.7)' : 'rgba(107,114,128,0.7)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {messages[idx]}
    </motion.p>
  )
}

function CornerBrackets() {
  const corners = [
    { top: 24, left: 24, rotate: 0 },
    { top: 24, right: 24, rotate: 90 },
    { bottom: 24, right: 24, rotate: 180 },
    { bottom: 24, left: 24, rotate: 270 },
  ]
  return (
    <>
      {corners.map((style, i) => (
        <motion.div key={i}
          className="absolute w-8 h-8"
          style={{ ...style, rotate: style.rotate }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500/40" />
          <div className="absolute top-0 left-0 w-0.5 h-full bg-red-500/40" />
        </motion.div>
      ))}
    </>
  )
}

function HexGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="30,2 58,17 58,45 30,60 2,45 2,17"
              fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)" />
      </svg>
    </div>
  )
}
