# Mahjong for Calm

Built for nFactorial. A Mahjong game that notices when a player is getting stressed and responds — not just another puzzle clone.

## What it does

- Detects rising stress from two signals: click/interaction patterns, and (optionally) real-time heart rate from a paired BLE device — smartwatch, smart ring, anything that exposes a standard heart-rate BLE service.
- When stress is detected, it responds without interrupting play: a short breathing-exercise nudge, calming background audio, and soft ambient animations.
- Built as a Next.js app with Supabase for stats/leaderboard persistence.

## Why

Most stress-tracking tools live outside of whatever you're actually doing. This ties the intervention to something people already do to unwind — a casual game — so the breathing prompt shows up in the moment it's useful, not as a separate app fighting for attention.

## Run it

```bash
git clone <repo-url>
cd mahjong_nf
npm install
```

Create `.env.local` (values from Supabase Dashboard → Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

```bash
npm run dev    # http://localhost:3000 — game, stats, leaderboard
npm run build  # production build
npm run lint
```

Heart-rate tracking needs Web Bluetooth (Chrome, Edge or Brave with Bluetooth enabled and a working BLE adapter). Firefox and Safari don't support Web Bluetooth, so the game runs there too — just without the pulse-based signal, falling back to interaction patterns only.
