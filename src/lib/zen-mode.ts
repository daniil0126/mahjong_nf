"use client"
import { useCallback, useEffect, useState } from 'react'
import type { ZenTheme } from './zen-themes'

export { ZEN_THEMES, type ZenTheme } from './zen-themes'

export interface ZenSettings {
  active: boolean
  theme: ZenTheme
  audioEnabled: boolean
  audioVolume: number
  autoSuggest: boolean
}

const STORAGE_KEY = 'mahjong-zen-settings'
const DEFAULTS: ZenSettings = {
  active: false,
  theme: 'sakura',
  audioEnabled: false,
  audioVolume: 0.4,
  autoSuggest: true,
}

function load(): ZenSettings {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<ZenSettings>
    return { ...DEFAULTS, ...parsed, active: false }
  } catch {
    return DEFAULTS
  }
}

export function useZenMode() {
  const [settings, setSettings] = useState<ZenSettings>(DEFAULTS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(load())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      const persist = {
        theme: settings.theme,
        audioEnabled: settings.audioEnabled,
        audioVolume: settings.audioVolume,
        autoSuggest: settings.autoSuggest,
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persist))
    } catch {}
  }, [settings, hydrated])

  const toggle = useCallback(() => {
    setSettings(s => ({ ...s, active: !s.active }))
  }, [])

  const setTheme = useCallback((theme: ZenTheme) => {
    setSettings(s => ({ ...s, theme }))
  }, [])

  const setAudioEnabled = useCallback((audioEnabled: boolean) => {
    setSettings(s => ({ ...s, audioEnabled }))
  }, [])

  const setAudioVolume = useCallback((audioVolume: number) => {
    setSettings(s => ({ ...s, audioVolume: Math.max(0, Math.min(1, audioVolume)) }))
  }, [])

  const setAutoSuggest = useCallback((autoSuggest: boolean) => {
    setSettings(s => ({ ...s, autoSuggest }))
  }, [])

  return { settings, toggle, setTheme, setAudioEnabled, setAudioVolume, setAutoSuggest, hydrated }
}

