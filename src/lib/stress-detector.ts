import { useCallback, useEffect, useRef, useState } from 'react'

export type StressEventType = 'click' | 'misclick' | 'undo' | 'hint' | 'shuffle'

export interface StressEvent {
  type: StressEventType
  ts: number
}

const WINDOW_MS = 30_000
const KEEP_MS = 60_000
const SAMPLE_INTERVAL_MS = 3_000

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

export function computeStress(events: StressEvent[], now = Date.now()): number {
  const recent = events.filter(e => now - e.ts <= WINDOW_MS)
  const clickLike = recent.filter(e => e.type === 'click' || e.type === 'misclick')
  if (clickLike.length < 3) return 0

  const clicksPerSec = clickLike.length / (WINDOW_MS / 1000)
  const rateScore = clamp01((clicksPerSec - 0.3) / 1.7)

  const misclickRatio = recent.filter(e => e.type === 'misclick').length / clickLike.length

  const undoScore = clamp01(recent.filter(e => e.type === 'undo').length / 5)
  const hintScore = clamp01(recent.filter(e => e.type === 'hint').length / 3)

  let varianceScore = 0
  if (clickLike.length >= 4) {
    const ts = clickLike.map(e => e.ts).sort((a, b) => a - b)
    const gaps: number[] = []
    for (let i = 1; i < ts.length; i++) gaps.push(ts[i] - ts[i - 1])
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length
    const variance = gaps.reduce((a, b) => a + (b - mean) ** 2, 0) / gaps.length
    const cv = Math.sqrt(variance) / Math.max(mean, 1)
    varianceScore = clamp01((cv - 0.4) / 1.6)
  }

  return clamp01(
    rateScore * 0.3 +
    misclickRatio * 0.25 +
    undoScore * 0.2 +
    hintScore * 0.1 +
    varianceScore * 0.15
  )
}

export function useStressDetector() {
  const eventsRef = useRef<StressEvent[]>([])
  const dirtyRef = useRef(false)
  const lastEventCountRef = useRef(0)
  const [stress, setStress] = useState(0)

  const record = useCallback((type: StressEventType) => {
    const now = Date.now()
    eventsRef.current.push({ type, ts: now })
    const cutoff = now - KEEP_MS
    eventsRef.current = eventsRef.current.filter(e => e.ts >= cutoff)
    dirtyRef.current = true
  }, [])

  const reset = useCallback(() => {
    eventsRef.current = []
    dirtyRef.current = false
    lastEventCountRef.current = 0
    setStress(0)
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null

    const tick = () => {
      // Skip recomputation if nothing changed AND no events to age out
      if (!dirtyRef.current && eventsRef.current.length === lastEventCountRef.current) return
      lastEventCountRef.current = eventsRef.current.length
      dirtyRef.current = false
      setStress(computeStress(eventsRef.current))
    }

    const start = () => {
      if (timer) return
      timer = setInterval(tick, SAMPLE_INTERVAL_MS)
    }
    const stop = () => {
      if (!timer) return
      clearInterval(timer)
      timer = null
    }

    const onVisibility = () => {
      if (typeof document === 'undefined') return
      if (document.hidden) stop()
      else { tick(); start() }
    }

    if (typeof document === 'undefined' || !document.hidden) start()
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility)
    }
    return () => {
      stop()
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility)
      }
    }
  }, [])

  return { stress, record, reset }
}
