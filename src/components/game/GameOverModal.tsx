'use client'

import { motion } from 'framer-motion'
import { Trophy, RefreshCcw, XCircle } from 'lucide-react'
import { GameState, LayoutName } from '@/types/game'
import { formatTime } from '@/lib/utils'

interface GameOverModalProps {
  state: GameState
  onNewGame: (layout?: LayoutName) => void
}

export default function GameOverModal({ state, onNewGame }: GameOverModalProps) {
  const won = state.isComplete
  const elapsed = Math.floor(state.elapsedTime / 1000)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
      >
        {won ? (
          <>
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">Победа!</h2>
            <p className="text-stone-500 dark:text-stone-400 mb-6">Все плитки убраны</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-200 mb-1">Тупик</h2>
            <p className="text-stone-500 dark:text-stone-400 mb-6">Нет доступных пар</p>
          </>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Очки" value={state.score} />
          <StatCard label="Время" value={formatTime(elapsed)} />
          <StatCard label="Ходы" value={state.moves} />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onNewGame(state.layout)}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw size={18} />
            Сыграть снова
          </button>
          <button
            onClick={() => onNewGame()}
            className="w-full py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-medium rounded-xl transition-all"
          >
            Другая раскладка
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-3">
      <div className="text-xs text-stone-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-lg font-bold text-stone-800 dark:text-stone-100">{value}</div>
    </div>
  )
}
