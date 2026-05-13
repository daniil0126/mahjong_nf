'use client'

import { useEffect, useRef } from 'react'
import { GameState, LayoutName } from '@/types/game'
import { formatTime } from '@/lib/utils'
import { Undo2, Lightbulb, Shuffle, RotateCcw, HelpCircle, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GameControlsProps {
  state: GameState
  onUndo: () => void
  onHint: () => void
  onShuffle: () => void
  onNewGame: (layout?: LayoutName) => void
  onTutorial?: () => void
  onTick: (ms: number) => void
  zenActive?: boolean
  onZenToggle?: () => void
  zenPulse?: boolean
}

const LAYOUTS: { id: LayoutName; label: string }[] = [
  { id: 'turtle', label: 'Черепаха' },
  { id: 'pyramid', label: 'Пирамида' },
  { id: 'dragon', label: 'Дракон' },
  { id: 'cross', label: 'Крест' },
]

export default function GameControls({ state, onUndo, onHint, onShuffle, onNewGame, onTutorial, onTick, zenActive, onZenToggle, zenPulse }: GameControlsProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (state.isComplete || state.isDeadlock) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => onTick(100), 100)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [state.isComplete, state.isDeadlock, onTick])

  const elapsed = Math.floor(state.elapsedTime / 1000)
  const remaining = state.tiles.filter(t => !t.removed).length

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-stone-100 dark:bg-stone-800">
        <div className="flex gap-6">
          <Stat label="Плиток" value={remaining} />
          <Stat label="Очки" value={state.score} />
          <Stat label="Ходы" value={state.moves} />
        </div>
        <div className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
          {formatTime(elapsed)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <IconBtn onClick={onUndo} disabled={state.undoStack.length === 0} title="Отменить ход">
          <Undo2 size={18} />
        </IconBtn>
        <IconBtn onClick={onHint} title="Подсказка">
          <Lightbulb size={18} />
        </IconBtn>
        <IconBtn onClick={onShuffle} title="Перемешать">
          <Shuffle size={18} />
        </IconBtn>
        <IconBtn onClick={() => onNewGame(state.layout)} title="Новая игра">
          <RotateCcw size={18} />
        </IconBtn>
        {onTutorial && (
          <IconBtn onClick={onTutorial} title="Как играть">
            <HelpCircle size={18} />
          </IconBtn>
        )}

        <div className="h-8 w-px bg-stone-300 dark:bg-stone-600 mx-1" />

        {LAYOUTS.map(l => (
          <button
            key={l.id}
            onClick={() => onNewGame(l.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              state.layout === l.id
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-stone-200 dark:bg-stone-700 hover:bg-amber-100 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200'
            )}
          >
            {l.label}
          </button>
        ))}

        {onZenToggle && (
          <div className="ml-auto">
            <button
              onClick={onZenToggle}
              title={zenActive ? 'Выключить анти-стресс' : 'Включить анти-стресс'}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                zenActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  : 'bg-stone-200 dark:bg-stone-700 hover:bg-emerald-100 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200',
                zenPulse && !zenActive && 'zen-pulse',
              )}
            >
              <Leaf size={16} />
              Анти-стресс
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">{label}</span>
      <span className="text-lg font-bold text-stone-800 dark:text-stone-100 tabular-nums">{value}</span>
    </div>
  )
}

function IconBtn({ onClick, disabled, title, children }: {
  onClick: () => void
  disabled?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded-lg transition-all',
        disabled
          ? 'opacity-30 cursor-not-allowed bg-stone-200 dark:bg-stone-700'
          : 'bg-stone-200 dark:bg-stone-700 hover:bg-amber-100 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 active:scale-95'
      )}
    >
      {children}
    </button>
  )
}
