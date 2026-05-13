import { Check, Bot, Palette, Lightbulb, BarChart3, Sparkles } from 'lucide-react'

const FEATURES = [
  { icon: <Bot size={20} />, title: 'AI Coach', desc: 'ИИ анализирует доску и даёт стратегические советы в реальном времени' },
  { icon: <Lightbulb size={20} />, title: 'Безлимитные подсказки', desc: 'Без ограничений на количество подсказок за день' },
  { icon: <Palette size={20} />, title: 'Тема «Шёлковый путь»', desc: 'Эксклюзивная тема с уникальными плитками и анимациями' },
  { icon: <BarChart3 size={20} />, title: 'Детальная статистика', desc: 'Графики прогресса, тренды, сравнение с другими игроками' },
]

export default function ProPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center gap-8">
      <div className="text-center flex flex-col items-center gap-3">
        <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
          <Sparkles size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">MahjongZen Pro</h1>
        <p className="text-stone-500 dark:text-stone-400 text-lg">Раскрой весь потенциал игры</p>
      </div>

      {/* Pricing card */}
      <div className="w-full bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-0.5 shadow-xl">
        <div className="bg-white dark:bg-stone-900 rounded-[calc(1.5rem-1px)] p-8 text-center">
          <div className="text-5xl font-bold text-stone-800 dark:text-stone-100 mb-1">$4.99</div>
          <div className="text-stone-400 mb-6">в месяц · отменить в любой момент</div>
          <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white text-lg font-bold rounded-2xl transition-all shadow-lg shadow-amber-200 dark:shadow-amber-900/30 active:scale-95">
            Upgrade to Pro
          </button>
          <p className="text-xs text-stone-400 mt-3">Оплата через Stripe · Безопасно</p>
        </div>
      </div>

      {/* Feature list */}
      <div className="w-full flex flex-col gap-3">
        {FEATURES.map(f => (
          <div
            key={f.title}
            className="flex items-start gap-4 p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800"
          >
            <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              {f.icon}
            </div>
            <div>
              <div className="font-semibold text-stone-800 dark:text-stone-100 mb-0.5">{f.title}</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">{f.desc}</div>
            </div>
            <Check size={20} className="text-emerald-500 shrink-0 ml-auto mt-0.5" />
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-stone-400 max-w-sm">
        Базовый маджонг всегда бесплатен. Pro-подписка добавляет инструменты для тех, кто хочет расти.
      </p>
    </div>
  )
}
