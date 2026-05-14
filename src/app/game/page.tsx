'use client'

import { useCallback, useEffect, useReducer, useRef, useState, useSyncExternalStore } from 'react'
import { GameState, LayoutName } from '@/types/game'
import {
  createGame,
  isFree,
  selectTile,
  undoMove,
  applyHint,
  shuffleTiles,
} from '@/lib/game-engine'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import GameBoard from '@/components/game/GameBoard'
import GameControls from '@/components/game/GameControls'
import GameOverModal from '@/components/game/GameOverModal'
import TutorialModal from '@/components/game/TutorialModal'
import { useStressDetector } from '@/lib/stress-detector'
import { useZenMode } from '@/lib/zen-mode'
import { useHeartRate } from '@/lib/heart-rate'
import { loadSavedGame, saveGame, clearSavedGame, getLastServerSaveKey, setLastServerSaveKey } from '@/lib/game-persistence'
import { createClient } from '@/lib/supabase/client'
import type { BreathingTechniqueId } from '@/lib/breathing'

const ZenOverlay = dynamic(() => import('@/components/game/ZenOverlay'), { ssr: false })
const ZenPanel = dynamic(() => import('@/components/game/ZenPanel'), { ssr: false })
const BreathingOverlay = dynamic(() => import('@/components/game/BreathingOverlay'), { ssr: false })

const TUTORIAL_KEY = 'mahjong-zen-tutorial-seen'
const noopSubscribe = () => () => {}
const readTutorialSeen = () => Boolean(window.localStorage.getItem(TUTORIAL_KEY))
const readTutorialSeenServer = () => true

const STRESS_HIGH = 0.55

type Action =
  | { type: 'SELECT'; id: string }
  | { type: 'UNDO' }
  | { type: 'HINT' }
  | { type: 'SHUFFLE' }
  | { type: 'NEW_GAME'; layout?: LayoutName }
  | { type: 'TICK'; ms: number }
  | { type: 'RESTORE'; state: GameState }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT': return selectTile(state, action.id)
    case 'UNDO': return undoMove(state)
    case 'HINT': return applyHint(state)
    case 'SHUFFLE': return shuffleTiles(state)
    case 'NEW_GAME': return createGame(action.layout ?? state.layout)
    case 'RESTORE': return action.state
    case 'TICK':
      if (state.isComplete || state.isDeadlock) return state
      return { ...state, elapsedTime: state.elapsedTime + action.ms }
    default: return state
  }
}

export default function GamePage() {
  const [state, dispatch] = useReducer(reducer, null, () => createGame('turtle'))
  const tutorialSeen = useSyncExternalStore(noopSubscribe, readTutorialSeen, readTutorialSeenServer)
  const [tutorialDismissed, setTutorialDismissed] = useState(false)
  const [tutorialManual, setTutorialManual] = useState(false)
  const showTutorial = tutorialManual || (!tutorialSeen && !tutorialDismissed)

  const { stress, record } = useStressDetector()
  const { settings, toggle, setTheme, setAudioEnabled, setAudioVolume } = useZenMode()
  const { state: hr, connect: connectHR, disconnect: disconnectHR } = useHeartRate()
  const [showZenPanel, setShowZenPanel] = useState(false)
  const [breathingId, setBreathingId] = useState<BreathingTechniqueId | null>(null)
  // Track which game session the user has dismissed the GameOverModal for, keyed by
  // startTime. When a new game starts, startTime changes, so the modal shows again
  // without needing an effect to reset state.
  const [dismissedSessionStart, setDismissedSessionStart] = useState<number | null>(null)
  const gameOverVisible = (state.isComplete || state.isDeadlock) && dismissedSessionStart !== state.startTime
  const wasStressedRef = useRef(false)

  const closeTutorial = () => {
    setTutorialDismissed(true)
    setTutorialManual(false)
  }

  const onTick = useCallback((ms: number) => dispatch({ type: 'TICK', ms }), [])

  const tilesRef = useRef(state.tiles)
  useEffect(() => {
    tilesRef.current = state.tiles
  }, [state.tiles])

  // Warm up the zen chunks in the background so the first toggle doesn't pay
  // chunk-download + first-paint cost. Runs once on mount, off the critical path.
  useEffect(() => {
    const run = () => {
      void import('@/components/game/ZenOverlay')
      void import('@/components/game/ZenPanel')
    }
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback
    if (typeof ric === 'function') ric(run)
    else setTimeout(run, 600)
  }, [])

  // Track current Supabase user. `undefined` = not yet checked, `null` = anonymous,
  // string = signed-in user id. We hold off on saving/restoring until we know who we are
  // so we don't accidentally show user A's saved game to user B.
  const [currentUserId, setCurrentUserId] = useState<string | null | undefined>(undefined)
  useEffect(() => {
    const supabase = createClient()
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setCurrentUserId(data.user?.id ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setCurrentUserId(session?.user?.id ?? null)
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  // Restore the in-progress game from localStorage, OR reset on account switch.
  // Reacts to currentUserId changes so logging out / signing in as a different user
  // immediately discards the previous owner's saved state.
  const restoredOwnerRef = useRef<string | null | undefined>(undefined)
  useEffect(() => {
    if (currentUserId === undefined) return
    if (restoredOwnerRef.current === currentUserId) return

    const previousOwner = restoredOwnerRef.current
    restoredOwnerRef.current = currentUserId

    if (previousOwner !== undefined) {
      // Auth state changed mid-session — drop any previous owner's saved/cached state.
      clearSavedGame()
      setLastServerSaveKey('')
      dispatch({ type: 'NEW_GAME' })
      return
    }

    // First-time mount — try to restore, but only if the saved state belongs to us.
    const saved = loadSavedGame()
    if (!saved) return
    if (saved.userId !== currentUserId) {
      clearSavedGame()
      setLastServerSaveKey('')
      return
    }
    dispatch({ type: 'RESTORE', state: saved.state })
    // If we're restoring an already-finished game, the user has already seen the modal
    // in the previous session. Don't pop it up again on a navigation back. The setState
    // here synchronises local React state with the external (localStorage) source of
    // truth — that's exactly what effects are for; the lint rule is overly cautious.
    if (saved.state.isComplete || saved.state.isDeadlock) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissedSessionStart(saved.state.startTime)
    }
  }, [currentUserId])

  // Debounced save: TICK fires every 100ms — writing on each would mean 10 localStorage
  // writes per second. Wait 600ms of quiet (or save on tab-hide) before flushing.
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (restoredOwnerRef.current === undefined) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    const owner = currentUserId ?? null
    saveTimerRef.current = setTimeout(() => saveGame(state, owner), 600)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [state, currentUserId])

  // Flush a pending save when the tab goes hidden or unloads, so we don't lose
  // up-to-600ms of progress if the user closes mid-debounce.
  useEffect(() => {
    const owner = currentUserId ?? null
    const flush = () => saveGame(state, owner)
    const onVisibility = () => { if (document.hidden) flush() }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [state, currentUserId])

  // Push a completed game (win OR deadlock) to Supabase. Anonymous users are skipped.
  // Dedup via a localStorage key — if the user reloads while still on the GameOverModal,
  // we don't insert the same row twice.
  useEffect(() => {
    const finished = state.isComplete || state.isDeadlock
    if (!finished) return
    const dedupKey = `${state.layout}|${state.score}|${Math.round(state.elapsedTime / 1000)}|${state.moves}|${state.isComplete ? 'w' : 'd'}`
    if (getLastServerSaveKey() === dedupKey) return

    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return
      const { error } = await supabase.from('games').insert({
        user_id: user.id,
        layout: state.layout,
        score: state.score,
        time_sec: Math.round(state.elapsedTime / 1000),
        moves: state.moves,
        hints_used: state.hintsUsed,
        completed: state.isComplete,
      })
      if (!error && !cancelled) setLastServerSaveKey(dedupKey)
    })()
    return () => { cancelled = true }
  }, [state.isComplete, state.isDeadlock, state.layout, state.score, state.elapsedTime, state.moves, state.hintsUsed])

  const handleTileClick = useCallback((id: string) => {
    const tiles = tilesRef.current
    const tile = tiles.find(t => t.id === id)
    const valid = !!tile && !tile.removed && isFree(tile, tiles)
    record(valid ? 'click' : 'misclick')
    dispatch({ type: 'SELECT', id })
  }, [record])

  const handleUndo = useCallback(() => {
    record('undo')
    dispatch({ type: 'UNDO' })
  }, [record])

  const handleHint = useCallback(() => {
    record('hint')
    dispatch({ type: 'HINT' })
  }, [record])

  const handleShuffle = useCallback(() => {
    record('shuffle')
    dispatch({ type: 'SHUFFLE' })
  }, [record])

  const elevatedHR = hr.connected && hr.elevated
  const stressed = stress >= STRESS_HIGH || elevatedHR

  useEffect(() => {
    const previously = wasStressedRef.current
    wasStressedRef.current = stressed
    // Only react on the rising edge: just-became-stressed and not already in zen mode.
    const justBecameStressed = stressed && !previously
    if (justBecameStressed && !settings.active && settings.autoSuggest) {
      setShowZenPanel(true)
    }
  }, [stressed, settings.active, settings.autoSuggest])

  const handleZenToggle = () => {
    const willActivate = !settings.active
    toggle()
    setShowZenPanel(willActivate)
  }

  return (
    <>
      {settings.active && (
        <ZenOverlay
          theme={settings.theme}
          audioEnabled={settings.audioEnabled}
          audioVolume={settings.audioVolume}
        />
      )}

      {settings.active && breathingId && (
        <BreathingOverlay key={breathingId} techniqueId={breathingId} />
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4">
        <GameControls
          state={state}
          onUndo={handleUndo}
          onHint={handleHint}
          onShuffle={handleShuffle}
          onNewGame={(layout) => dispatch({ type: 'NEW_GAME', layout })}
          onTutorial={() => setTutorialManual(true)}
          onTick={onTick}
          zenActive={settings.active}
          onZenToggle={handleZenToggle}
          zenPulse={stressed && !settings.active}
        />

        <div className={`w-full rounded-2xl border p-4 overflow-hidden transition-colors ${
          settings.active
            ? 'bg-white/40 dark:bg-stone-950/40 backdrop-blur-sm border-white/30 dark:border-stone-700/40'
            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
        }`}>
          <GameBoard state={state} onTileClick={handleTileClick} />
        </div>

        {gameOverVisible && (
          <GameOverModal
            state={state}
            onNewGame={(layout) => dispatch({ type: 'NEW_GAME', layout })}
            onClose={() => setDismissedSessionStart(state.startTime)}
          />
        )}

        {showTutorial && (
          <TutorialModal onClose={closeTutorial} />
        )}

        <AnimatePresence>
          {showZenPanel ? (
            <ZenPanel
              key="zen-panel"
              settings={settings}
              stress={stress}
              hr={{ connected: hr.connected, bpm: hr.bpm, baseline: hr.baseline }}
              breathing={breathingId}
              onClose={() => setShowZenPanel(false)}
              onSetTheme={setTheme}
              onSetAudioEnabled={setAudioEnabled}
              onSetAudioVolume={setAudioVolume}
              onConnectHR={connectHR}
              onDisconnectHR={disconnectHR}
              onSetBreathing={setBreathingId}
            />
          ) : (
            <motion.button
              key="zen-reopen"
              onClick={() => setShowZenPanel(true)}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32, delay: 0.15 }}
              className="fixed top-24 right-0 z-40 flex items-center gap-1.5 pl-2.5 pr-3 py-2 rounded-l-xl bg-white/85 dark:bg-stone-900/85 backdrop-blur-md shadow-lg border border-r-0 border-white/40 dark:border-stone-700/40 text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors"
              aria-label="Открыть анти-стресс панель"
              hidden={!settings.active}
            >
              <Heart size={14} className="text-rose-500" />
              <span className="text-xs font-medium"></span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
