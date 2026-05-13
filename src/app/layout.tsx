import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'MahjongZen — Медитативный маджонг',
  description: 'Современная веб-платформа для игры в маджонг с AI-тренером, ежедневными челленджами и красивыми культурными темами.',
  keywords: ['маджонг', 'mahjong', 'игра', 'головоломка', 'медитация'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className="min-h-screen flex flex-col bg-stone-950 text-stone-100 antialiased">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-4 text-center text-xs text-stone-600">
          © 2026 MahjongZen · Маджонг для фокуса и отдыха
        </footer>
      </body>
    </html>
  )
}
