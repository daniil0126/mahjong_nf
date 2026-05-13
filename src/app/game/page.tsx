'use client'

import { useCallback, useReducer, useState, useSyncExternalStore } from 'react'
import { GameState, LayoutName } from '@/types/game'
import {
  createGame,
  selectTile,
  undoMove,
  applyHint,
  shuffleTiles,
} from '@/lib/game-engine'
import GameBoard from '@/components/game/GameBoard'
import GameControls from '@/components/game/GameControls'
import GameOverModal from '@/components/game/GameOverModal'
import AICoachPanel from '@/components/game/AICoachPanel'
import TutorialModal from '@/components/game/TutorialModal'

const TUTORIAL_KEY = 'mahjong-zen-tutorial-seen'
const noopSubscribe = () => () => {}
const readTutorialSeen = () => Boolean(window.localStorage.getItem(TUTORIAL_KEY))
const readTutorialSeenServer = () => true // assume seen on server to avoid hydration flash

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
  const [showAI, setShowAI] = useState(false)
  const tutorialSeen = useSyncExternalStore(noopSubscribe, readTutorialSeen, readTutorialSeenServer)
  const [tutorialDismissed, setTutorialDismissed] = useState(false)
  const [tutorialManual, setTutorialManual] = useState(false)
  const showTutorial = tutorialManual || (!tutorialSeen && !tutorialDismissed)

  const closeTutorial = () => {
    setTutorialDismissed(true)
    setTutorialManual(false)
  }

  const onTick = useCallback((ms: number) => dispatch({ type: 'TICK', ms }), [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4">
      <GameControls
        state={state}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onHint={() => dispatch({ type: 'HINT' })}
        onShuffle={() => dispatch({ type: 'SHUFFLE' })}
        onNewGame={(layout) => dispatch({ type: 'NEW_GAME', layout })}
        onAICoach={() => setShowAI(v => !v)}
        onTutorial={() => setTutorialManual(true)}
        onTick={onTick}
        isPro={false}
      />

      <div className="w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 overflow-hidden">
        <GameBoard state={state} onTileClick={(id) => dispatch({ type: 'SELECT', id })} />
      </div>

      {(state.isComplete || state.isDeadlock) && (
        <GameOverModal
          state={state}
          onNewGame={(layout) => dispatch({ type: 'NEW_GAME', layout })}
        />
      )}

      {showAI && (
        <AICoachPanel state={state} onClose={() => setShowAI(false)} />
      )}

      {showTutorial && (
        <TutorialModal onClose={closeTutorial} />
      )}
    </div>
  )
}
