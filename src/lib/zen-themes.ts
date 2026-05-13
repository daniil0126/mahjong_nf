export type ZenTheme = 'sakura' | 'tibet' | 'bamboo'

export interface ZenThemeMeta {
  id: ZenTheme
  label: string
  emoji: string
  gradient: string
  image: string
}

export const ZEN_THEMES: ZenThemeMeta[] = [
  {
    id: 'sakura',
    label: 'Сакура',
    emoji: '🌸',
    gradient: 'from-pink-200/40 via-rose-100/30 to-amber-50/40 dark:from-pink-950/60 dark:via-rose-950/40 dark:to-amber-950/60',
    image: '/backgrounds/sakura.jpeg',
  },
  {
    id: 'tibet',
    label: 'Тибетский храм',
    emoji: '🏔️',
    gradient: 'from-sky-200/40 via-indigo-100/30 to-stone-100/40 dark:from-sky-950/60 dark:via-indigo-950/40 dark:to-stone-900/60',
    image: '/backgrounds/tibeth.jpeg',
  },
  {
    id: 'bamboo',
    label: 'Бамбуковый лес',
    emoji: '🎋',
    gradient: 'from-emerald-200/40 via-green-100/30 to-lime-50/40 dark:from-emerald-950/60 dark:via-green-950/40 dark:to-lime-950/60',
    image: '/backgrounds/bambuk.jpeg',
  },
]
