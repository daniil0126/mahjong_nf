import Link from 'next/link'
import { ArrowRight, Calendar, Trophy, Bot, Sparkles } from 'lucide-react'

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
          Классическая головоломка с AI-тренером, ежедневными соревнованиями и красивыми культурными темами
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
            icon: '🤖',
            title: 'AI Coach',
            desc: 'ИИ анализирует доску и подсказывает стратегию. Pro-фича.',
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
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Культурные темы</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'Японский сад', emoji: '🌸', color: 'from-pink-100 to-rose-100 dark:from-pink-950 dark:to-rose-950', free: true },
            { name: 'Древний Китай', emoji: '🏮', color: 'from-red-100 to-orange-100 dark:from-red-950 dark:to-orange-950', free: true },
            { name: 'Шёлковый путь', emoji: '✨', color: 'from-amber-100 to-yellow-100 dark:from-amber-950 dark:to-yellow-950', free: false },
          ].map(t => (
            <div
              key={t.name}
              className={`bg-gradient-to-br ${t.color} rounded-2xl p-6 border border-stone-200 dark:border-stone-800 flex flex-col items-center gap-2`}
            >
              <span className="text-4xl">{t.emoji}</span>
              <span className="font-semibold text-stone-800 dark:text-stone-100">{t.name}</span>
              {!t.free && (
                <span className="text-xs px-2 py-0.5 bg-amber-400/20 text-amber-700 dark:text-amber-400 rounded-full font-medium">Pro</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pro CTA */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 text-white text-center flex flex-col items-center gap-4">
        <Sparkles size={32} />
        <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
        <p className="text-amber-100 max-w-md">
          AI Coach, эксклюзивные темы, безлимитные подсказки и подробная статистика
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="text-3xl font-bold">$4.99</span>
          <span className="text-amber-200">в месяц</span>
          <Link
            href="/pro"
            className="px-6 py-3 bg-white text-amber-600 font-bold rounded-xl hover:bg-amber-50 transition-all ml-0 sm:ml-4"
          >
            Попробовать Pro
          </Link>
        </div>
      </section>
    </div>
  )
}
