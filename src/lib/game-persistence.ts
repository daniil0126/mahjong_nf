import { GameState } from '@/types/game'

const STORAGE_KEY = 'mahjong-zen-game-state'
const STORAGE_VERSION = 2

interface SavedGameEnvelope {
  v: number
  state: GameState
  savedAt: number
  userId: string | null
}

export interface LoadedGame {
  state: GameState
  userId: string | null
}

export function loadSavedGame(): LoadedGame | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedGameEnvelope
    if (!parsed || parsed.v !== STORAGE_VERSION) return null
    const s = parsed.state
    if (!s || !Array.isArray(s.tiles) || typeof s.layout !== 'string') return null
    return { state: s, userId: parsed.userId ?? null }
  } catch {
    return null
  }
}

export function saveGame(state: GameState, userId: string | null) {
  if (typeof window === 'undefined') return
  try {
    const payload: SavedGameEnvelope = { v: STORAGE_VERSION, state, savedAt: Date.now(), userId }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Quota exceeded or storage disabled — silently drop.
  }
}

export function clearSavedGame() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

const LAST_SAVED_COMPLETION_KEY = 'mahjong-zen-last-server-save'

export function getLastServerSaveKey(): string | null {
  if (typeof window === 'undefined') return null
  try { return window.localStorage.getItem(LAST_SAVED_COMPLETION_KEY) } catch { return null }
}

export function setLastServerSaveKey(key: string) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(LAST_SAVED_COMPLETION_KEY, key) } catch {}
}
