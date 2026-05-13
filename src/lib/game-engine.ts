import { Tile, GameState } from '@/types/game'
import { TileDefinition } from '@/types/game'
import { ALL_TILE_DEFINITIONS, tilesMatch } from './tiles'
import { LAYOUTS, LayoutName } from './layouts'

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Create 72 matching pairs from ALL_TILE_DEFINITIONS
function makeAllPairs(): [TileDefinition, TileDefinition][] {
  const pairs: [TileDefinition, TileDefinition][] = []

  const flowers = ALL_TILE_DEFINITIONS.filter(d => d.suit === 'flowers')
  const seasons = ALL_TILE_DEFINITIONS.filter(d => d.suit === 'seasons')

  // Flowers: 4 tiles all match → 2 pairs
  pairs.push([flowers[0], flowers[1]])
  pairs.push([flowers[2], flowers[3]])
  // Seasons: same
  pairs.push([seasons[0], seasons[1]])
  pairs.push([seasons[2], seasons[3]])

  // Suited tiles: each suit-value has 4 copies → 2 pairs
  const suited = ALL_TILE_DEFINITIONS.filter(d => d.suit !== 'flowers' && d.suit !== 'seasons')
  const groups = new Map<string, TileDefinition[]>()
  for (const def of suited) {
    const key = `${def.suit}|${def.value}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(def)
  }
  for (const group of groups.values()) {
    pairs.push([group[0], group[1]])
    pairs.push([group[2], group[3]])
  }

  return pairs // 72 pairs
}

const ALL_PAIRS = makeAllPairs()

export function createGame(layout: LayoutName, seed?: number): GameState {
  const positions = LAYOUTS[layout]
  const rand = seededRandom(seed ?? Date.now())

  // Trim to nearest even count
  const n = positions.length % 2 === 0 ? positions.length : positions.length - 1
  const numPairs = n / 2

  // Select numPairs pairs (use all 72 if n=144)
  const shuffledPairs = shuffle(ALL_PAIRS, rand)
  const selectedPairs = shuffledPairs.slice(0, numPairs)
  const defs = shuffle(selectedPairs.flat(), rand)

  const tiles: Tile[] = positions.slice(0, n).map((pos, i) => ({
    id: `tile-${i}`,
    def: defs[i],
    layer: pos.layer,
    row: pos.row,
    col: pos.col,
    removed: false,
    selected: false,
  }))

  return {
    tiles,
    selectedTileId: null,
    score: 0,
    moves: 0,
    hintsUsed: 0,
    startTime: Date.now(),
    elapsedTime: 0,
    isComplete: false,
    isDeadlock: false,
    layout,
    theme: 'japanese',
    undoStack: [],
    hintPair: null,
  }
}

// A tile is free if:
// 1. Nothing covers it from above
// 2. At least one horizontal side is clear
export function isFree(tile: Tile, tiles: Tile[]): boolean {
  if (tile.removed) return false
  const active = tiles.filter(t => !t.removed && t.id !== tile.id)

  const coveredAbove = active.some(t =>
    t.layer === tile.layer + 1 &&
    Math.abs(t.row - tile.row) < 2 &&
    Math.abs(t.col - tile.col) < 2
  )
  if (coveredAbove) return false

  const hasLeft = active.some(t =>
    t.layer === tile.layer &&
    Math.abs(t.row - tile.row) < 2 &&
    t.col === tile.col - 2
  )
  const hasRight = active.some(t =>
    t.layer === tile.layer &&
    Math.abs(t.row - tile.row) < 2 &&
    t.col === tile.col + 2
  )

  return !hasLeft || !hasRight
}

export function getFreeTiles(tiles: Tile[]): Tile[] {
  return tiles.filter(t => !t.removed && isFree(t, tiles))
}

export function findHintPair(tiles: Tile[]): [string, string] | null {
  const free = getFreeTiles(tiles)
  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      if (tilesMatch(free[i].def, free[j].def)) {
        return [free[i].id, free[j].id]
      }
    }
  }
  return null
}

export function isDeadlock(tiles: Tile[]): boolean {
  return findHintPair(tiles) === null && tiles.some(t => !t.removed)
}

export function calcScore(timeSeconds: number, moves: number, hintsUsed: number): number {
  const base = 100
  const timeBonus = Math.max(0, 50 - Math.floor(timeSeconds / 10))
  const hintPenalty = hintsUsed * 10
  return Math.max(10, base + timeBonus - hintPenalty)
}

export function selectTile(state: GameState, tileId: string): GameState {
  const tile = state.tiles.find(t => t.id === tileId)
  if (!tile || tile.removed || !isFree(tile, state.tiles)) return state

  if (state.selectedTileId === tileId) {
    return {
      ...state,
      selectedTileId: null,
      hintPair: null,
      tiles: state.tiles.map(t => ({ ...t, selected: false })),
    }
  }

  if (!state.selectedTileId) {
    return {
      ...state,
      selectedTileId: tileId,
      hintPair: null,
      tiles: state.tiles.map(t => ({ ...t, selected: t.id === tileId })),
    }
  }

  const firstTile = state.tiles.find(t => t.id === state.selectedTileId)!
  if (!tilesMatch(firstTile.def, tile.def)) {
    return {
      ...state,
      selectedTileId: tileId,
      hintPair: null,
      tiles: state.tiles.map(t => ({ ...t, selected: t.id === tileId })),
    }
  }

  const newTiles = state.tiles.map(t =>
    t.id === tileId || t.id === state.selectedTileId
      ? { ...t, removed: true, selected: false }
      : { ...t, selected: false }
  )
  const remaining = newTiles.filter(t => !t.removed)
  const isComplete = remaining.length === 0
  const deadlock = !isComplete && isDeadlock(newTiles)
  const elapsed = Math.floor(state.elapsedTime / 1000)
  const nextMoves = state.moves + 1

  return {
    ...state,
    tiles: newTiles,
    selectedTileId: null,
    hintPair: null,
    score: state.score + calcScore(elapsed, nextMoves, state.hintsUsed),
    moves: nextMoves,
    isComplete,
    isDeadlock: deadlock,
    undoStack: [
      ...state.undoStack,
      {
        tiles: state.tiles,
        score: state.score,
        moves: state.moves,
        hintsUsed: state.hintsUsed,
      },
    ],
  }
}

export function undoMove(state: GameState): GameState {
  if (state.undoStack.length === 0) return state
  const prev = state.undoStack[state.undoStack.length - 1]
  return {
    ...state,
    tiles: prev.tiles,
    score: prev.score,
    moves: prev.moves,
    hintsUsed: prev.hintsUsed,
    selectedTileId: null,
    hintPair: null,
    isComplete: false,
    isDeadlock: false,
    undoStack: state.undoStack.slice(0, -1),
  }
}

export function applyHint(state: GameState): GameState {
  const pair = findHintPair(state.tiles)
  if (!pair) return state
  return {
    ...state,
    hintPair: pair,
    hintsUsed: state.hintsUsed + 1,
    tiles: state.tiles.map(t => ({ ...t, selected: false })),
    selectedTileId: null,
  }
}

export function shuffleTiles(state: GameState): GameState {
  const active = state.tiles.filter(t => !t.removed)
  const defs = active.map(t => t.def)
  const rand = seededRandom(Date.now())
  const shuffledDefs = shuffle(defs, rand)
  const newTiles = state.tiles.map(t => {
    if (t.removed) return t
    const idx = active.findIndex(a => a.id === t.id)
    return { ...t, def: shuffledDefs[idx], selected: false }
  })
  return {
    ...state,
    tiles: newTiles,
    selectedTileId: null,
    hintPair: null,
    isDeadlock: false,
    undoStack: [],
  }
}
