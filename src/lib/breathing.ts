import { useEffect, useState } from 'react'

export type BreathingPhaseType = 'inhale' | 'hold-full' | 'exhale' | 'hold-empty'

export interface BreathingPhase {
  type: BreathingPhaseType
  duration: number
}

export interface BreathingTechnique {
  id: BreathingTechniqueId
  name: string
  description: string
  phases: BreathingPhase[]
}

export type BreathingTechniqueId = '478' | 'box'

export const BREATHING_TECHNIQUES: Record<BreathingTechniqueId, BreathingTechnique> = {
  '478': {
    id: '478',
    name: '4–7–8',
    description: 'Снижает тревожность',
    phases: [
      { type: 'inhale', duration: 4000 },
      { type: 'hold-full', duration: 7000 },
      { type: 'exhale', duration: 8000 },
    ],
  },
  box: {
    id: 'box',
    name: 'Квадрат',
    description: 'Концентрация и фокус',
    phases: [
      { type: 'inhale', duration: 4000 },
      { type: 'hold-full', duration: 4000 },
      { type: 'exhale', duration: 4000 },
      { type: 'hold-empty', duration: 4000 },
    ],
  },
}

export const PHASE_LABELS: Record<BreathingPhaseType, string> = {
  inhale: 'Вдох',
  'hold-full': 'Задержка',
  exhale: 'Выдох',
  'hold-empty': 'Пауза',
}

export const PHASE_TARGET_SCALE: Record<BreathingPhaseType, number> = {
  inhale: 1,
  'hold-full': 1,
  exhale: 0.45,
  'hold-empty': 0.45,
}

interface BreathingState {
  phaseIndex: number
  secondsLeft: number
}

// Note: the consumer should pass `key={techniqueId}` on the host component so that
// switching techniques remounts it and reruns the lazy useState initializer below.
export function useBreathing(techniqueId: BreathingTechniqueId | null) {
  const [state, setState] = useState<BreathingState>(() => {
    if (!techniqueId) return { phaseIndex: 0, secondsLeft: 0 }
    const technique = BREATHING_TECHNIQUES[techniqueId]
    return {
      phaseIndex: 0,
      secondsLeft: Math.round(technique.phases[0].duration / 1000),
    }
  })

  useEffect(() => {
    if (!techniqueId) return
    const technique = BREATHING_TECHNIQUES[techniqueId]
    if (!technique) return

    const interval = setInterval(() => {
      setState(prev => {
        const next = prev.secondsLeft - 1
        if (next > 0) return { ...prev, secondsLeft: next }
        const nextIndex = (prev.phaseIndex + 1) % technique.phases.length
        return {
          phaseIndex: nextIndex,
          secondsLeft: Math.round(technique.phases[nextIndex].duration / 1000),
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [techniqueId])

  if (!techniqueId) return null
  const technique = BREATHING_TECHNIQUES[techniqueId]
  if (!technique) return null
  return {
    technique,
    phaseIndex: state.phaseIndex,
    phase: technique.phases[state.phaseIndex],
    secondsLeft: state.secondsLeft,
  }
}
