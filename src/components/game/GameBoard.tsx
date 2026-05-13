'use client'

import { useMemo, useState, useEffect } from 'react'
import { GameState } from '@/types/game'
import { isFree } from '@/lib/game-engine'
import TileComponent from './Tile'

interface GameBoardProps {
  state: GameState
  onTileClick: (id: string) => void
}

export default function GameBoard({ state, onTileClick }: GameBoardProps) {
  const [containerWidth, setContainerWidth] = useState(900)

  useEffect(() => {
    const update = () => setContainerWidth(Math.min(window.innerWidth - 32, 960))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const { tileWidth, tileHeight, depthOffset, boardWidth, boardHeight } = useMemo(() => {
    const active = state.tiles.filter(t => !t.removed)
    if (active.length === 0) return { tileWidth: 52, tileHeight: 64, depthOffset: 8, boardWidth: 0, boardHeight: 0 }

    const maxCol = Math.max(...active.map(t => t.col))
    const maxRow = Math.max(...active.map(t => t.row))
    const maxLayer = Math.max(...active.map(t => t.layer))

    // Reserve lateral space for the 3D offset between layers.
    const tileWidth = Math.max(36, Math.min(56, Math.floor((containerWidth - 40) / ((maxCol / 2) + maxLayer * 0.6 + 2))))
    const tileHeight = Math.floor(tileWidth * 1.2)
    const depthOffset = Math.max(4, Math.floor(tileWidth * 0.13))

    // Extra horizontal/vertical padding for the body chamfer + cast shadow
    // (the box-shadow extends ~depthOffset to the left and below each tile).
    const pad = depthOffset * 2 + 8
    const boardWidth = (maxCol / 2 + 1) * tileWidth + maxLayer * depthOffset + pad
    const boardHeight = (maxRow / 2 + 1) * tileHeight + maxLayer * depthOffset + pad

    return { tileWidth, tileHeight, depthOffset, boardWidth, boardHeight }
  }, [state.tiles, containerWidth])

  const freeIds = useMemo(() => {
    const set = new Set<string>()
    for (const t of state.tiles) {
      if (!t.removed && isFree(t, state.tiles)) set.add(t.id)
    }
    return set
  }, [state.tiles])

  const hintSet = useMemo(() => new Set(state.hintPair ?? []), [state.hintPair])

  return (
    <div className="w-full overflow-auto flex justify-center">
      <div
        className="relative"
        style={{
          width: boardWidth,
          height: boardHeight,
          minHeight: 300,
          isolation: 'isolate',
        }}
      >
        {state.tiles.map(tile => (
          <TileComponent
            key={tile.id}
            tile={tile}
            isHinted={hintSet.has(tile.id)}
            isFreeTile={freeIds.has(tile.id)}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
            depthOffset={depthOffset}
            onClick={onTileClick}
          />
        ))}
      </div>
    </div>
  )
}
