'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface TutorialModalProps {
  onClose: () => void
}

interface Step {
  title: string
  body: React.ReactNode
  illustration: React.ReactNode
}

function MiniTile({
  symbol,
  tone = 'normal',
  className = '',
}: {
  symbol: string
  tone?: 'normal' | 'free' | 'dim' | 'selected' | 'hint'
  className?: string
}) {
  const toneClass =
    tone === 'free'
      ? 'bg-stone-50 border-stone-400 text-stone-800 shadow-md'
      : tone === 'dim'
        ? 'bg-stone-200 border-stone-400/70 text-stone-500 opacity-80'
        : tone === 'selected'
          ? 'bg-amber-100 border-amber-500 text-amber-700 ring-2 ring-amber-300'
          : tone === 'hint'
            ? 'bg-emerald-100 border-emerald-500 text-emerald-700 ring-2 ring-emerald-300'
            : 'bg-stone-50 border-stone-300 text-stone-700'
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-md border-2 font-bold ${toneClass} ${className}`}
    >
      <span>{symbol}</span>
    </div>
  )
}

const STEPS: Step[] = [
  {
    title: 'Цель игры',
    body: (
      <>
        Уберите все плитки с доски, открывая <strong>пары одинаковых символов</strong>.
        Когда исчезнет последняя пара — раскладка пройдена.
      </>
    ),
    illustration: (
      <div className="flex items-center justify-center gap-3">
        <MiniTile symbol="🀇" className="w-14 h-16 text-2xl" tone="free" />
        <span className="text-2xl text-stone-400">=</span>
        <MiniTile symbol="🀇" className="w-14 h-16 text-2xl" tone="free" />
      </div>
    ),
  },
  {
    title: 'Свободные плитки',
    body: (
      <>
        Брать можно только <strong>свободную</strong> плитку — на ней ничего не лежит сверху
        и хотя бы одна боковая сторона (слева или справа) открыта. Заблокированные
        плитки слегка <strong>притемнены</strong>, свободные — выглядят ярче и крупнее.
      </>
    ),
    illustration: (
      <div className="relative h-28 w-56 mx-auto">
        {/* bottom row */}
        <MiniTile symbol="🀙" tone="dim" className="absolute left-0 top-8 w-12 h-14 text-xl" />
        <MiniTile symbol="🀚" tone="dim" className="absolute left-10 top-8 w-12 h-14 text-xl" />
        <MiniTile symbol="🀛" tone="dim" className="absolute left-20 top-8 w-12 h-14 text-xl" />
        <MiniTile symbol="🀜" tone="free" className="absolute left-32 top-8 w-12 h-14 text-xl" />
        {/* top covering middle */}
        <MiniTile
          symbol="🀝"
          tone="free"
          className="absolute left-14 top-1 w-12 h-14 text-xl shadow-lg"
        />
      </div>
    ),
  },
  {
    title: 'Особые плитки',
    body: (
      <>
        <strong>Цветы</strong> (花) подходят к <em>любым</em> цветам,
        а <strong>сезоны</strong> (季) — к <em>любым</em> сезонам.
        Остальные плитки — только при полном совпадении символа.
      </>
    ),
    illustration: (
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1">
            <MiniTile symbol="🀢" className="w-10 h-12 text-lg" tone="free" />
            <MiniTile symbol="🀣" className="w-10 h-12 text-lg" tone="free" />
          </div>
          <span className="text-xs text-stone-500">цветы</span>
        </div>
        <span className="text-xl text-stone-400">≠</span>
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1">
            <MiniTile symbol="🀦" className="w-10 h-12 text-lg" tone="free" />
            <MiniTile symbol="🀧" className="w-10 h-12 text-lg" tone="free" />
          </div>
          <span className="text-xs text-stone-500">сезоны</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Инструменты',
    body: (
      <ul className="space-y-1.5 text-left">
        <li>
          <strong>↶ Отмена</strong> — вернуть последний ход.
        </li>
        <li>
          <strong>💡 Подсказка</strong> — подсветит готовую пару (есть лимит).
        </li>
        <li>
          <strong>🔀 Перемешать</strong> — если уперлись в тупик.
        </li>
        <li>
          <strong>↻ Новая игра</strong> — новая раскладка.
        </li>
      </ul>
    ),
    illustration: (
      <div className="flex items-center justify-center gap-2">
        <MiniTile symbol="🀇" tone="selected" className="w-12 h-14 text-xl" />
        <MiniTile symbol="🀈" tone="hint" className="w-12 h-14 text-xl" />
      </div>
    ),
  },
]

export default function TutorialModal({ onClose }: TutorialModalProps) {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  const finish = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mahjong-zen-tutorial-seen', '1')
    }
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={finish}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={finish}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>

          <div className="px-6 pt-6 pb-3">
            <div className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">
              Шаг {step + 1} из {STEPS.length}
            </div>
            <h2 className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
              {current.title}
            </h2>
          </div>

          <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/60 border-y border-stone-200 dark:border-stone-800 min-h-[140px] flex items-center justify-center">
            {current.illustration}
          </div>

          <div className="px-6 py-4 text-stone-700 dark:text-stone-300 text-[15px] leading-relaxed">
            {current.body}
          </div>

          <div className="flex items-center justify-between gap-3 px-6 pb-5">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> Назад
            </button>

            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  aria-label={`Шаг ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === step
                      ? 'w-6 bg-amber-500'
                      : 'w-2 bg-stone-300 dark:bg-stone-700 hover:bg-stone-400'
                  }`}
                />
              ))}
            </div>

            {isLast ? (
              <button
                onClick={finish}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white shadow-md transition-all"
              >
                Начать игру
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white shadow-md transition-all"
              >
                Далее <ChevronRight size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
