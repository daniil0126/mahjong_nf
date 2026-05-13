'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Sun, Moon, Trophy, Calendar, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl">🀄</span>
          <span className="text-stone-800 dark:text-stone-100">Mahjong</span>
          <span className="text-amber-500">Zen</span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/game"><span className="hidden sm:inline">Играть</span></NavLink>
          <NavLink href="/daily">
            <Calendar size={16} className="sm:hidden" />
            <span className="hidden sm:inline">Daily</span>
          </NavLink>
          <NavLink href="/leaderboard">
            <Trophy size={16} className="sm:hidden" />
            <span className="hidden sm:inline">Рейтинг</span>
          </NavLink>
          <NavLink href="/profile">
            <User size={16} className="sm:hidden" />
            <span className="hidden sm:inline">Профиль</span>
          </NavLink>

          <div className="w-px h-6 bg-stone-200 dark:bg-stone-700 mx-1" />

          <Link
            href="/pro"
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">Pro</span>
          </Link>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ml-1"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-all"
    >
      {children}
    </Link>
  )
}
