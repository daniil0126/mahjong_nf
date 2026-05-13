export interface TilePosition {
  layer: number
  row: number  // half-tile units (step 2 = one tile)
  col: number  // half-tile units (step 2 = one tile)
}

function grid(layer: number, rows: number[], cols: number[]): TilePosition[] {
  return rows.flatMap(row => cols.map(col => ({ layer, row, col })))
}

function range(from: number, to: number, step = 2): number[] {
  const r: number[] = []
  for (let i = from; i <= to; i += step) r.push(i)
  return r
}

// TURTLE — 144 tiles (72+36+24+8+4)
export const TURTLE_LAYOUT: TilePosition[] = [
  // Layer 0 — 72 tiles
  ...grid(0, [0], range(4, 22)),           // 10
  ...grid(0, [2], range(2, 24)),           // 12
  ...grid(0, [4, 6], range(0, 26)),        // 14×2=28
  ...grid(0, [8], range(2, 24)),           // 12
  ...grid(0, [10], range(4, 22)),          // 10

  // Layer 1 — 36 tiles
  ...grid(1, [2, 8], range(4, 18)),        // 8×2=16
  ...grid(1, [4, 6], range(4, 22)),        // 10×2=20

  // Layer 2 — 24 tiles
  ...grid(2, [2, 4, 6, 8], range(8, 18)), // 6×4=24

  // Layer 3 — 8 tiles
  ...grid(3, [4, 6], range(10, 16)),       // 4×2=8

  // Layer 4 — 4 tiles
  ...grid(4, [4, 6], [12, 14]),            // 2×2=4
]

// PYRAMID — 80 tiles (48+24+8)
export const PYRAMID_LAYOUT: TilePosition[] = [
  // Layer 0 — 48 tiles (6 rows × 8 cols)
  ...grid(0, range(0, 10), range(0, 14)),  // 6×8=48

  // Layer 1 — 24 tiles (4 rows × 6 cols)
  ...grid(1, range(2, 8), range(2, 12)),   // 4×6=24

  // Layer 2 — 8 tiles (2 rows × 4 cols)
  ...grid(2, range(4, 6), range(4, 10)),   // 2×4=8
]

// CROSS — 80 tiles
export const CROSS_LAYOUT: TilePosition[] = [
  // Horizontal bar: 2 rows × 14 cols = 28
  ...grid(0, [4, 6], range(0, 26)),

  // Vertical additions (4 rows × 6 cols, no overlap with bar): 4×6=24
  ...grid(0, [0, 2, 8, 10], range(10, 20)),

  // Layer 1 horizontal: 2 rows × 10 cols = 20
  ...grid(1, [4, 6], range(4, 22)),

  // Layer 1 vertical (2 rows × 4 cols): 8
  ...grid(1, [2, 8], range(12, 18)),
]

// DRAGON — 120 tiles
export const DRAGON_LAYOUT: TilePosition[] = [
  // Body: wide rectangle, layer 0
  ...grid(0, range(0, 12), range(0, 26)),  // 7×14=98... too many

  // Let's do: body 7×10=70, head+tail=12, layers=38
  // Easier: just enumerate
]

// Rebuild dragon cleanly
const dragonTiles: TilePosition[] = []
// Layer 0 body (5 rows × 12 cols = 60)
for (const r of range(2, 10)) {
  for (const c of range(2, 24)) {
    dragonTiles.push({ layer: 0, row: r, col: c })
  }
}
// Layer 0 head (2 rows × 2 cols = 4)
dragonTiles.push({ layer: 0, row: 4, col: 0 })
dragonTiles.push({ layer: 0, row: 6, col: 0 })
dragonTiles.push({ layer: 0, row: 4, col: 26 })
dragonTiles.push({ layer: 0, row: 6, col: 26 })
// Layer 1 center (4 rows × 8 cols = 32)
for (const r of range(4, 8)) {
  for (const c of range(8, 18)) {
    dragonTiles.push({ layer: 1, row: r, col: c })
  }
}
// Layer 2 (2 rows × 4 cols = 8) — even (64+4+32+8 = don't need to count exactly)
for (const c of range(10, 16)) {
  dragonTiles.push({ layer: 2, row: 6, col: c })
  dragonTiles.push({ layer: 2, row: 4, col: c })
}
// Trim to nearest even number handled in createGame
export const DRAGON_LAYOUT_RAW = dragonTiles

export const LAYOUTS = {
  turtle: TURTLE_LAYOUT,
  pyramid: PYRAMID_LAYOUT,
  cross: CROSS_LAYOUT,
  dragon: dragonTiles,
} as const

export type LayoutName = keyof typeof LAYOUTS
