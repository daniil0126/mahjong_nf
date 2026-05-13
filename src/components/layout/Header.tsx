'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Trophy, Calendar, User, LogOut } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
      router.refresh()
    })
    return () => sub.subscription.unsubscribe()
  }, [router])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
    router.refresh()
  }

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

          <div className="w-px h-6 bg-stone-200 dark:bg-stone-700 mx-1" />

          {authReady && (user ? <UserMenu user={user} onSignOut={signOut} /> : (
            <Link
              href="/auth"
              className="ml-1 flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-all"
            >
              <User size={16} className="sm:hidden" />
              <span className="hidden sm:inline">Войти</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

function UserMenu({ user, onSignOut }: { user: SupabaseUser; onSignOut: () => void }) {
  const label = user.email ?? user.id
  const initial = (user.email ?? 'U').charAt(0).toUpperCase()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="ml-1 flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          aria-label="Меню пользователя"
        >
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold flex items-center justify-center">
            {initial}
          </span>
          <span className="hidden md:inline text-sm text-stone-600 dark:text-stone-300 max-w-[140px] truncate">
            {label}
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="min-w-[200px] rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-lg p-1 z-50"
        >
          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer outline-none"
            >
              <User size={16} />
              Профиль
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-stone-200 dark:bg-stone-800" />
          <DropdownMenu.Item
            onSelect={onSignOut}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer outline-none"
          >
            <LogOut size={16} />
            Выйти
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      prefetch
      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-all"
    >
      {children}
    </Link>
  )
}
