'use client'

import {
  useBreathing,
  PHASE_LABELS,
  PHASE_TARGET_SCALE,
  type BreathingTechniqueId,
} from '@/lib/breathing'

interface Props {
  techniqueId: BreathingTechniqueId | null
}

export default function BreathingOverlay({ techniqueId }: Props) {
  const breathing = useBreathing(techniqueId)
  if (!breathing) return null

  const { phase, secondsLeft } = breathing
  const targetScale = PHASE_TARGET_SCALE[phase.type]
  const label = PHASE_LABELS[phase.type]

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 bottom-6 pointer-events-none z-30 flex flex-col items-center gap-3"
    >
      <div
        className="rounded-full bg-amber-400/15 border-2 border-amber-300/40"
        style={{
          width: 160,
          height: 160,
          transform: `scale(${targetScale})`,
          transition: `transform ${phase.duration}ms linear`,
          boxShadow: '0 0 60px 12px rgba(251, 191, 36, 0.18)',
        }}
      />
      <div className="text-center">
        <div className="text-2xl font-semibold text-white drop-shadow-md tabular-nums">{label}</div>
        <div className="text-xs text-white/70 mt-0.5 tabular-nums">{secondsLeft} сек</div>
      </div>
    </div>
  )
}
