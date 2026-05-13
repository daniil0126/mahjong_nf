import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar } from 'lucide-react'
import { ZEN_THEMES } from '@/lib/zen-themes'

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-16">
      {/* Hero */}
      <section className="text-center flex flex-col items-center gap-6">
        <div className="text-7xl mb-2">🀄</div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          Маджонг для{' '}
          <span className="text-amber-500">фокуса</span>{' '}
          и{' '}
          <span className="text-amber-500">отдыха</span>
        </h1>
        <p className="text-lg sm:text-xl text-stone-500 dark:text-stone-400 max-w-xl">
          Классическая головоломка с режимом понижения стресса, ежедневными соревнованиями и красивыми культурными темами
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/game"
            className="flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white text-lg font-semibold rounded-2xl transition-all shadow-lg shadow-amber-200 dark:shadow-amber-900/30 active:scale-95"
          >
            Начать играть <ArrowRight size={20} />
          </Link>
          <Link
            href="/daily"
            className="flex items-center gap-2 px-8 py-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-lg font-semibold rounded-2xl transition-all"
          >
            <Calendar size={20} /> Daily Challenge
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: '🎯',
            title: 'Честные правила',
            desc: 'Только свободные плитки. Счёт, таймер, отмена ходов.',
          },
          {
            icon: '📅',
            title: 'Daily Challenge',
            desc: 'Одна раскладка для всех каждый день. Глобальный рейтинг.',
          },
          {
            icon: '🧘',
            title: 'Анти-стресс режим',
            desc: 'Платформа замечает напряжение по кликам или пульсу и переключает в спокойную сцену.',
          },
          {
            icon: '🌏',
            title: 'Рейтинг по городам',
            desc: 'Соревнуйся с игроками из своего города.',
          },
        ].map(f => (
          <div
            key={f.title}
            className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-1">{f.title}</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Themes preview */}
      <section className="text-center flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Анти-стресс темы</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ZEN_THEMES.map(t => (
            <div
              key={t.id}
              className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 aspect-[4/3] group"
            >
              <Image
                src={t.image}
                alt={t.label}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white">
                <span className="text-2xl">{t.emoji}</span>
                <span className="font-semibold drop-shadow">{t.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
