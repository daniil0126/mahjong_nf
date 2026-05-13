import { LayoutName } from '@/lib/layouts'

export type { LayoutName }

export type TileSuit = 'characters' | 'bamboo' | 'circles' | 'winds' | 'dragons' | 'flowers' | 'seasons'

export interface TileDefinition {
  suit: TileSuit
  value: number
  label: string
  symbol: string
}

export interface Tile {
  id: string
  def: TileDefinition
  layer: number
  row: number
  col: number
  removed: boolean
  selected: boolean
}

export type Theme = 'japanese' | 'chinese' | 'silk-road'

export interface UndoSnapshot {
  tiles: Tile[]
  score: number
  moves: number
  hintsUsed: number
}

export interface GameState {
  tiles: Tile[]
  selectedTileId: string | null
  score: number
  moves: number
  hintsUsed: number
  startTime: number
  elapsedTime: number
  isComplete: boolean
  isDeadlock: boolean
  layout: LayoutName
  theme: Theme
  undoStack: UndoSnapshot[]
  hintPair: [string, string] | null
}

export interface GameStats {
  totalGames: number
  completedGames: number
  bestTime: number | null
  averageTime: number | null
  totalScore: number
  winRate: number
}

export interface LeaderboardEntry {
  rank: number
  username: string
  city: string | null
  country: string | null
  score: number
  time: number
  completedAt: string
}
