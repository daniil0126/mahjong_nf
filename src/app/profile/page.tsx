import { BarChart3, Clock, Target, Zap } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  // Placeholder — будет заменён Supabase данными после авторизации
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white">
          Z
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Профиль</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm">Войдите, чтобы сохранять прогресс</p>
        </div>
        <Link
          href="/auth"
          className="ml-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all text-sm"
        >
          Войти
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Всего игр', value: '—', icon: <BarChart3 size={20} /> },
          { label: 'Побед', value: '—', icon: <Target size={20} /> },
          { label: 'Лучшее время', value: '—', icon: <Clock size={20} /> },
          { label: 'Максимум очков', value: '—', icon: <Zap size={20} /> },
        ].map(stat => (
          <div
            key={stat.label}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 flex flex-col gap-2"
          >
            <div className="text-stone-400">{stat.icon}</div>
            <div className="text-2xl font-bold text-stone-400">{stat.value}</div>
            <div className="text-xs text-stone-400 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent games placeholder */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 text-center">
        <p className="text-stone-400 dark:text-stone-500">
          История игр появится после входа в аккаунт
        </p>
      </div>
    </div>
  )
}
