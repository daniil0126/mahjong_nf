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

const ZenOverlay = dynamic(() => import('@/components/game/ZenOverlay'), { ssr: false })
const ZenPanel = dynamic(() => import('@/components/game/ZenPanel'), { ssr: false })

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

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT': return selectTile(state, action.id)
    case 'UNDO': return undoMove(state)
    case 'HINT': return applyHint(state)
    case 'SHUFFLE': return shuffleTiles(state)
    case 'NEW_GAME': return createGame(action.layout ?? state.layout)
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

        {(state.isComplete || state.isDeadlock) && (
          <GameOverModal
            state={state}
            onNewGame={(layout) => dispatch({ type: 'NEW_GAME', layout })}
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
              onClose={() => setShowZenPanel(false)}
              onSetTheme={setTheme}
              onSetAudioEnabled={setAudioEnabled}
              onSetAudioVolume={setAudioVolume}
              onConnectHR={connectHR}
              onDisconnectHR={disconnectHR}
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
              <span className="text-xs font-medium">Анти-стресс</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
