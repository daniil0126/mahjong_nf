'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Mode = 'signin' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/profile'

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState<null | 'email' | 'google'>(null)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const supabase = createClient()

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy('email')
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.replace(next)
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        })
        if (error) throw error
        setInfo('Письмо с подтверждением отправлено на email. Проверьте почту.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так')
    } finally {
      setBusy(null)
    }
  }

  async function onGoogle() {
    setError(null)
    setBusy('google')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth не удался')
      setBusy(null)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col gap-6">
      <div className="text-center">
        <div className="text-4xl mb-2">🀄</div>
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
          {mode === 'signin' ? 'Вход' : 'Регистрация'}
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Сохраняйте прогресс, статистику и место в рейтинге
        </p>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col gap-4">
        <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
          <TabButton active={mode === 'signin'} onClick={() => setMode('signin')}>
            Войти
          </TabButton>
          <TabButton active={mode === 'signup'} onClick={() => setMode('signup')}>
            Создать аккаунт
          </TabButton>
        </div>

        <button
          type="button"
          onClick={onGoogle}
          disabled={busy !== null}
          className="flex items-center justify-center gap-3 w-full py-2.5 px-4 border border-stone-300 dark:border-stone-700 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50 transition-colors"
        >
          {busy === 'google' ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Продолжить с Google
        </button>

        <div className="flex items-center gap-3 text-xs text-stone-400">
          <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
          или email
          <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
        </div>

        <form onSubmit={onEmailSubmit} className="flex flex-col gap-3">
          <Field
            icon={<Mail size={16} />}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />
          <Field
            icon={<Lock size={16} />}
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={setPassword}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            minLength={6}
            required
          />

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {info && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg px-3 py-2">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy !== null}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
          >
            {busy === 'email' && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-stone-400">
        Продолжая, вы соглашаетесь с условиями использования
      </p>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ' +
        (active
          ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
          : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-200')
      }
    >
      {children}
    </button>
  )
}

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
}: {
  icon: React.ReactNode
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  required?: boolean
  minLength?: number
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
      />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC04"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.32z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  )
}
