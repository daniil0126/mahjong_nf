import { TileDefinition, TileSuit } from '@/types/game'

const WIND_SYMBOLS = ['東', '南', '西', '北']
const WIND_LABELS = ['East', 'South', 'West', 'North']
const DRAGON_SYMBOLS = ['中', '發', '白']
const DRAGON_LABELS = ['Red Dragon', 'Green Dragon', 'White Dragon']
const FLOWER_SYMBOLS = ['梅', '蘭', '菊', '竹']
const SEASON_SYMBOLS = ['春', '夏', '秋', '冬']

const CHARACTER_SYMBOLS = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
const BAMBOO_SYMBOLS = ['🎋', '2', '3', '4', '5', '6', '7', '8', '9']
const CIRCLE_SYMBOLS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨']

function makeTiles(suit: TileSuit, count: number, copies: number, getSymbol: (i: number) => string, getLabel: (i: number) => string): TileDefinition[] {
  const defs: TileDefinition[] = []
  for (let i = 0; i < count; i++) {
    for (let c = 0; c < copies; c++) {
      defs.push({ suit, value: i + 1, label: getLabel(i), symbol: getSymbol(i) })
    }
  }
  return defs
}

export const ALL_TILE_DEFINITIONS: TileDefinition[] = [
  ...makeTiles('characters', 9, 4, i => CHARACTER_SYMBOLS[i], i => `${i + 1} Character`),
  ...makeTiles('bamboo', 9, 4, i => BAMBOO_SYMBOLS[i], i => `${i + 1} Bamboo`),
  ...makeTiles('circles', 9, 4, i => CIRCLE_SYMBOLS[i], i => `${i + 1} Circle`),
  ...makeTiles('winds', 4, 4, i => WIND_SYMBOLS[i], i => WIND_LABELS[i]),
  ...makeTiles('dragons', 3, 4, i => DRAGON_SYMBOLS[i], i => DRAGON_LABELS[i]),
  ...makeTiles('flowers', 4, 1, i => FLOWER_SYMBOLS[i], i => `Flower ${i + 1}`),
  ...makeTiles('seasons', 4, 1, i => SEASON_SYMBOLS[i], i => `Season ${i + 1}`),
]

// 144 tiles total
export function tilesMatch(a: TileDefinition, b: TileDefinition): boolean {
  if (a.suit === 'flowers' && b.suit === 'flowers') return true
  if (a.suit === 'seasons' && b.suit === 'seasons') return true
  return a.suit === b.suit && a.value === b.value
}
