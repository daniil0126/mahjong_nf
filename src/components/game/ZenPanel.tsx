'use client'

import { motion } from 'framer-motion'
import { Volume2, VolumeX, X, Heart, HeartOff, Wind } from 'lucide-react'
import type { ZenSettings, ZenTheme } from '@/lib/zen-mode'
import { ZEN_THEMES } from '@/lib/zen-mode'
import { BREATHING_TECHNIQUES, type BreathingTechniqueId } from '@/lib/breathing'
import { cn } from '@/lib/utils'

interface ZenPanelProps {
  settings: ZenSettings
  stress: number
  hr: { connected: boolean; bpm: number | null; baseline: number | null } | null
  breathing: BreathingTechniqueId | null
  onClose: () => void
  onSetTheme: (t: ZenTheme) => void
  onSetAudioEnabled: (v: boolean) => void
  onSetAudioVolume: (v: number) => void
  onConnectHR: () => void
  onDisconnectHR: () => void
  onSetBreathing: (id: BreathingTechniqueId | null) => void
}

export default function ZenPanel({
  settings,
  stress,
  hr,
  breathing,
  onClose,
  onSetTheme,
  onSetAudioEnabled,
  onSetAudioVolume,
  onConnectHR,
  onDisconnectHR,
  onSetBreathing,
}: ZenPanelProps) {
  const stressPct = Math.round(stress * 100)

  return (
    <motion.div
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="fixed top-20 right-4 z-40 w-[300px] bg-white/85 dark:bg-stone-900/85 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 dark:border-stone-700/40 p-4 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-800 dark:text-stone-100">Анти-стресс</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1.5 text-stone-600 dark:text-stone-400">
          <span>Уровень напряжения</span>
          <span className="tabular-nums font-medium">{stressPct}%</span>
        </div>
        <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-700 rounded-full',
              stress < 0.3 ? 'bg-emerald-400' : stress < 0.6 ? 'bg-amber-400' : 'bg-rose-500',
            )}
            style={{ width: `${stressPct}%` }}
          />
        </div>
      </div>

      <div>
        <div className="text-xs mb-2 text-stone-600 dark:text-stone-400">Сцена</div>
        <div className="grid grid-cols-3 gap-2">
          {ZEN_THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => onSetTheme(t.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all',
                settings.theme === t.id
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200',
              )}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="leading-tight text-center">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSetAudioEnabled(!settings.audioEnabled)}
            className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 transition-colors"
            aria-label={settings.audioEnabled ? 'Выключить звук' : 'Включить звук'}
          >
            {settings.audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.audioVolume}
            disabled={!settings.audioEnabled}
            onChange={e => onSetAudioVolume(parseFloat(e.target.value))}
            className="flex-1 accent-amber-500 disabled:opacity-30"
            aria-label="Громкость"
          />
        </div>
      </div>

      <div className="border-t border-stone-200 dark:border-stone-700 pt-3">
        <div className="text-xs mb-2 text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
          <Wind size={12} /> Дыхание
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSetBreathing(null)}
            className={cn(
              'p-2 rounded-xl text-xs font-medium transition-all',
              breathing === null
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200',
            )}
          >
            Выкл
          </button>
          {(Object.values(BREATHING_TECHNIQUES)).map(t => (
            <button
              key={t.id}
              onClick={() => onSetBreathing(t.id)}
              className={cn(
                'p-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-0.5',
                breathing === t.id
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200',
              )}
              title={t.description}
            >
              <span>{t.name}</span>
            </button>
          ))}
        </div>
        {breathing && (
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 leading-snug">
            {BREATHING_TECHNIQUES[breathing].description}
          </p>
        )}
      </div>

      <div className="border-t border-stone-200 dark:border-stone-700 pt-3">
        <div className="text-xs mb-2 text-stone-600 dark:text-stone-400">Пульсометр (BLE)</div>
        {hr?.connected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">❤️</span>
              <div>
                <div className="font-bold text-lg text-rose-500 tabular-nums">
                  {hr.bpm ?? '—'} <span className="text-xs font-normal">bpm</span>
                </div>
                {hr.baseline !== null && (
                  <div className="text-[11px] text-stone-500">baseline {hr.baseline}</div>
                )}
              </div>
            </div>
            <button
              onClick={onDisconnectHR}
              className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 transition-colors"
              aria-label="Отключить"
            >
              <HeartOff size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onConnectHR}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500 hover:bg-rose-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Heart size={14} />
            Подключить
          </button>
        )}
        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 leading-snug">
          P.S. Поддерживаются не все устройства
        </p>
      </div>
    </motion.div>
  )
}
