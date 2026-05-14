import { Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface LeaderboardRow {
  display_name: string
  score: number
  time_sec: number
  moves: number
  hints_used: number
  layout: string
  created_at: string
}

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const RANK_ICONS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leaderboard_top')
    .select('display_name, score, time_sec, moves, hints_used, layout, created_at')
    .limit(50)

  const rows = (data ?? []) as LeaderboardRow[]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Trophy size={28} className="text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Глобальный рейтинг</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Все времена · Топ по очкам</p>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {rows.length === 0 ? (
          <p className="text-center text-stone-400 dark:text-stone-500 py-12 px-4">
            Пока никто не выиграл. Стань первым.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-xs text-stone-400 uppercase tracking-wider">
                <th className="px-4 py-3 text-left w-12">#</th>
                <th className="px-4 py-3 text-left">Игрок</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Раскладка</th>
                <th className="px-4 py-3 text-right">Очки</th>
                <th className="px-4 py-3 text-right">Время</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry, i) => {
                const rank = i + 1
                return (
                  <tr
                    key={`${entry.display_name}-${entry.created_at}`}
                    className={`border-b border-stone-100 dark:border-stone-800 last:border-0 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50 ${rank === 1 ? 'bg-amber-50 dark:bg-amber-950/20' : ''}`}
                  >
                    <td className="px-4 py-3 font-bold text-stone-600 dark:text-stone-300 tabular-nums">
                      {RANK_ICONS[rank] ?? rank}
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-100 truncate max-w-[160px]">
                      {entry.display_name}
                    </td>
                    <td className="px-4 py-3 text-stone-500 dark:text-stone-400 hidden sm:table-cell capitalize">
                      {entry.layout}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      {entry.score}
                    </td>
                    <td className="px-4 py-3 text-right text-stone-500 dark:text-stone-400 tabular-nums text-sm">
                      {formatTime(entry.time_sec)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-center text-stone-400">
        Топ-50 по очкам среди выигранных партий
      </p>
    </div>
  )
}
