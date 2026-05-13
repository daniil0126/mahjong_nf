'use client'

import { useState } from 'react'
import { GameState } from '@/types/game'
import { Bot, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFreeTiles } from '@/lib/game-engine'

interface AICoachPanelProps {
  state: GameState
  onClose: () => void
}

export default function AICoachPanel({ state, onClose }: AICoachPanelProps) {
  const [advice, setAdvice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getAdvice = async () => {
    setLoading(true)
    try {
      const freeTiles = getFreeTiles(state.tiles)
      const boardSummary = {
        remaining: state.tiles.filter(t => !t.removed).length,
        freeTiles: freeTiles.map(t => `${t.def.symbol}(${t.def.suit})`).slice(0, 20),
        moves: state.moves,
        hintsUsed: state.hintsUsed,
        score: state.score,
      }
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardSummary }),
      })
      const data = await res.json()
      setAdvice(data.advice)
    } catch {
      setAdvice('Не удалось получить совет. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed right-4 top-24 w-72 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 p-4 z-50"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Bot size={20} />
            <span className="font-semibold">AI Coach</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
            <X size={16} />
          </button>
        </div>

        {!advice && !loading && (
          <div className="text-center">
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
              Получи стратегический совет от ИИ на основе текущего состояния доски
            </p>
            <button
              onClick={getAdvice}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all text-sm"
            >
              Анализировать доску
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 size={24} className="animate-spin text-purple-500" />
            <p className="text-sm text-stone-500">Анализирую позицию...</p>
          </div>
        )}

        {advice && (
          <div>
            <div className="bg-purple-50 dark:bg-purple-950 rounded-xl p-3 text-sm text-stone-700 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
              {advice}
            </div>
            <button
              onClick={getAdvice}
              className="mt-3 w-full py-1.5 text-xs text-purple-600 dark:text-purple-400 hover:underline"
            >
              Обновить анализ
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
