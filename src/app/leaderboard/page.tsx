import { Trophy, Medal } from 'lucide-react'

// Placeholder data — будет заменена Supabase данными
const MOCK_ENTRIES = [
  { rank: 1, username: 'ZenMaster', city: 'Алматы', country: 'KZ', score: 2840, time: 187 },
  { rank: 2, username: 'TileWizard', city: 'Бишкек', country: 'KG', score: 2710, time: 203 },
  { rank: 3, username: 'DragonSlayer', city: 'Ташкент', country: 'UZ', score: 2650, time: 221 },
  { rank: 4, username: 'PeacefulMind', city: 'Алматы', country: 'KZ', score: 2490, time: 248 },
  { rank: 5, username: 'SilkRoadPro', city: 'Астана', country: 'KZ', score: 2380, time: 265 },
  { rank: 6, username: 'BambooKing', city: 'Москва', country: 'RU', score: 2210, time: 301 },
  { rank: 7, username: 'LotusPlayer', city: 'Алматы', country: 'KZ', score: 2100, time: 320 },
  { rank: 8, username: 'TeaHouseGuru', city: 'Берлин', country: 'DE', score: 1980, time: 344 },
]

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const RANK_ICONS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function LeaderboardPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Trophy size={28} className="text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Глобальный рейтинг</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Daily Challenge · Сегодня</p>
        </div>
      </div>

      {/* City filter buttons */}
      <div className="flex flex-wrap gap-2">
        {['Все', 'Алматы', 'Астана', 'Бишкек', 'Ташкент', 'Москва'].map(city => (
          <button
            key={city}
            className="px-3 py-1.5 text-sm rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors font-medium first:bg-amber-500 first:text-white"
          >
            {city}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 text-xs text-stone-400 uppercase tracking-wider">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Игрок</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Город</th>
              <th className="px-4 py-3 text-right">Очки</th>
              <th className="px-4 py-3 text-right">Время</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ENTRIES.map((entry, i) => (
              <tr
                key={entry.rank}
                className={`border-b border-stone-100 dark:border-stone-800 last:border-0 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50 ${i === 0 ? 'bg-amber-50 dark:bg-amber-950/20' : ''}`}
              >
                <td className="px-4 py-3 font-bold text-stone-600 dark:text-stone-300">
                  {RANK_ICONS[entry.rank] ?? entry.rank}
                </td>
                <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-100">
                  {entry.username}
                </td>
                <td className="px-4 py-3 text-stone-500 dark:text-stone-400 hidden sm:table-cell">
                  {entry.city}, {entry.country}
                </td>
                <td className="px-4 py-3 text-right font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {entry.score}
                </td>
                <td className="px-4 py-3 text-right text-stone-500 dark:text-stone-400 tabular-nums text-sm">
                  {formatTime(entry.time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-center text-stone-400">
        Рейтинг обновляется в реальном времени · Данные за сегодня
      </p>
    </div>
  )
}
