'use client'

import { useCallback, useReducer } from 'react'
import { GameState } from '@/types/game'
import { createGame, selectTile, undoMove, applyHint } from '@/lib/game-engine'
import { dateToSeed } from '@/lib/utils'
import GameBoard from '@/components/game/GameBoard'
import GameControls from '@/components/game/GameControls'
import { Calendar, Users } from 'lucide-react'

type Action =
  | { type: 'SELECT'; id: string }
  | { type: 'UNDO' }
  | { type: 'HINT' }
  | { type: 'TICK'; ms: number }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT': return selectTile(state, action.id)
    case 'UNDO': return undoMove(state)
    case 'HINT': return applyHint(state)
    case 'TICK':
      if (state.isComplete || state.isDeadlock) return state
      return { ...state, elapsedTime: state.elapsedTime + action.ms }
    default: return state
  }
}

const today = new Date()
const seed = dateToSeed(today)
const dateStr = today.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

export default function DailyPage() {
  const [state, dispatch] = useReducer(reducer, null, () => createGame('turtle', seed))
  const onTick = useCallback((ms: number) => dispatch({ type: 'TICK', ms }), [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4">
      {/* Daily header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl border border-blue-200 dark:border-blue-800">
        <Calendar size={24} className="text-blue-500" />
        <div>
          <div className="font-bold text-stone-800 dark:text-stone-100 capitalize">{dateStr}</div>
          <div className="text-sm text-stone-500 dark:text-stone-400">
            Одна раскладка для всех игроков сегодня
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-sm text-stone-500">
          <Users size={16} />
          <span className="hidden sm:inline">Глобальный рейтинг</span>
        </div>
      </div>

      <GameControls
        state={state}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onHint={() => dispatch({ type: 'HINT' })}
        onShuffle={() => {}} // No shuffle in daily
        onNewGame={() => {}} // No new game in daily
        onTick={onTick}
      />

      <div className="w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 overflow-hidden">
        <GameBoard state={state} onTileClick={(id) => dispatch({ type: 'SELECT', id })} />
      </div>

      {(state.isComplete || state.isDeadlock) && (
        <DailyResult state={state} />
      )}
    </div>
  )
}

function DailyResult({ state }: { state: GameState }) {
  const elapsed = Math.floor(state.elapsedTime / 1000)
  const won = state.isComplete

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">{won ? '🏆' : '😔'}</div>
        <h2 className="text-2xl font-bold mb-2">{won ? 'Отлично!' : 'Тупик'}</h2>
        <p className="text-stone-500 dark:text-stone-400 mb-6">
          {won
            ? `Время: ${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')} · Очки: ${state.score}`
            : 'Нет доступных пар. Завтра попробуй снова!'}
        </p>
        <a
          href="/leaderboard"
          className="block w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all"
        >
          Посмотреть рейтинг
        </a>
      </div>
    </div>
  )
}
