import { redirect } from 'next/navigation'
import { BarChart3, Clock, Target, Zap, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface GameRow {
  layout: string
  score: number
  time_sec: number
  moves: number
  hints_used: number
  completed: boolean
  created_at: string
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/profile')

  const email = user.email ?? user.id
  const initial = email.charAt(0).toUpperCase()

  const { data: games } = await supabase
    .from('games')
    .select('layout, score, time_sec, moves, hints_used, completed, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const list = (games ?? []) as GameRow[]
  const total = list.length
  const wins = list.filter(g => g.completed)
  const winsCount = wins.length
  const bestTime = wins.length ? Math.min(...wins.map(g => g.time_sec)) : null
  const maxScore = wins.length ? Math.max(...wins.map(g => g.score)) : null

  const stats = [
    { label: 'Всего игр', value: total ? String(total) : '—', icon: <BarChart3 size={20} /> },
    { label: 'Побед', value: total ? `${winsCount}${total ? ` / ${total}` : ''}` : '—', icon: <Target size={20} /> },
    { label: 'Лучшее время', value: bestTime !== null ? fmtTime(bestTime) : '—', icon: <Clock size={20} /> },
    { label: 'Максимум очков', value: maxScore !== null ? String(maxScore) : '—', icon: <Zap size={20} /> },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white">
          {initial}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Профиль</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm truncate">{email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 flex flex-col gap-2"
          >
            <div className="text-amber-500">{stat.icon}</div>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 tabular-nums">{stat.value}</div>
            <div className="text-xs text-stone-400 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-wide">История</h2>
        </div>
        {list.length === 0 ? (
          <p className="text-center text-stone-400 dark:text-stone-500 py-10 px-4">
            Пока пусто. Сыграй партию — она появится здесь.
          </p>
        ) : (
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {list.slice(0, 20).map((g, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-3 text-sm">
                <span
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    g.completed
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-rose-500/15 text-rose-500'
                  }`}
                  aria-label={g.completed ? 'Победа' : 'Тупик'}
                >
                  {g.completed ? <Check size={14} /> : <X size={14} />}
                </span>
                <span className="capitalize text-stone-700 dark:text-stone-200 font-medium w-20 shrink-0">{g.layout}</span>
                <span className="text-stone-500 dark:text-stone-400 tabular-nums w-14 shrink-0">{fmtTime(g.time_sec)}</span>
                <span className="text-stone-500 dark:text-stone-400 tabular-nums w-16 shrink-0">{g.score} очк</span>
                <span className="text-stone-400 dark:text-stone-500 tabular-nums hidden sm:inline">
                  {g.moves} ходов{g.hints_used > 0 ? ` · ${g.hints_used} подск` : ''}
                </span>
                <span className="ml-auto text-stone-400 dark:text-stone-500 text-xs shrink-0">{fmtDate(g.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
