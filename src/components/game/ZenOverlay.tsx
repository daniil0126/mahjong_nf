'use client'

import { useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import type { ZenTheme } from '@/lib/zen-mode'
import { ZEN_THEMES } from '@/lib/zen-mode'
import { cn } from '@/lib/utils'

interface ZenOverlayProps {
  theme: ZenTheme
  audioEnabled: boolean
  audioVolume: number
}

interface ParticleSpec {
  count: number
  glyphs: string[]
  minSize: number
  maxSize: number
  minDuration: number
  maxDuration: number
  drift: number
}

const PARTICLE_SPEC: Record<ZenTheme, ParticleSpec> = {
  sakura: { count: 28, glyphs: ['🌸', '🌸', '🌺'], minSize: 14, maxSize: 26, minDuration: 14, maxDuration: 24, drift: 60 },
  tibet:  { count: 36, glyphs: ['❄', '❅', '❆'],   minSize: 8,  maxSize: 16, minDuration: 16, maxDuration: 28, drift: 30 },
  bamboo: { count: 22, glyphs: ['🍃', '🌿'],       minSize: 14, maxSize: 22, minDuration: 18, maxDuration: 30, drift: 80 },
}

export default function ZenOverlay({ theme, audioEnabled, audioVolume }: ZenOverlayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const themeData = ZEN_THEMES.find(t => t.id === theme)!

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.volume = audioVolume
    if (audioEnabled) {
      a.play().catch(() => {})
    } else {
      a.pause()
    }
  }, [audioEnabled, audioVolume, theme])

  return (
    <>
      <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
        <Image
          key={theme}
          src={themeData.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover transition-opacity duration-700"
        />
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br transition-colors duration-1000',
            themeData.gradient,
          )}
        />
        <ParticleField theme={theme} />
      </div>
      <audio
        ref={audioRef}
        loop
        preload="none"
        src={`/sounds/${theme}.mp3`}
      />
    </>
  )
}

function makeRng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function ParticleField({ theme }: { theme: ZenTheme }) {
  const spec = PARTICLE_SPEC[theme]

  const particles = useMemo(() => {
    const seed = theme.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0
    const r = makeRng(seed)
    return Array.from({ length: spec.count }).map((_, i) => {
      const size = spec.minSize + r() * (spec.maxSize - spec.minSize)
      const duration = spec.minDuration + r() * (spec.maxDuration - spec.minDuration)
      const drift = (r() * 2 - 1) * spec.drift
      const spin = (r() * 2 - 1) * 540
      const left = r() * 100
      const delay = -r() * duration
      const glyph = spec.glyphs[i % spec.glyphs.length]
      const opacity = 0.55 + r() * 0.35
      return { size, duration, drift, spin, left, delay, glyph, opacity, key: `${theme}-${i}` }
    })
  }, [theme, spec])

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {particles.map(p => (
        <span
          key={p.key}
          className="zen-particle"
          style={{
            left: `${p.left}%`,
            top: `-10%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            // CSS variables consumed by the @keyframes
            ['--zen-drift' as string]: `${p.drift}px`,
            ['--zen-spin' as string]: `${p.spin}deg`,
          }}
        >
          {p.glyph}
        </span>
      ))}
    </div>
  )
}
