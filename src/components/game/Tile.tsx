'use client'

import { motion } from 'framer-motion'
import { Tile as TileType } from '@/types/game'
import { cn } from '@/lib/utils'

interface TileProps {
  tile: TileType
  isHinted: boolean
  isFreeTile: boolean
  tileWidth: number
  tileHeight: number
  depthOffset: number
  onClick: (id: string) => void
}

const SUIT_COLORS: Record<string, string> = {
  characters: 'text-red-600',
  bamboo: 'text-green-700',
  circles: 'text-blue-600',
  winds: 'text-slate-700',
  dragons: 'text-purple-700',
  flowers: 'text-pink-500',
  seasons: 'text-amber-600',
}

const BODY_COLOR = '#c9a86b'      // the warm "thickness" of the tile, visible at bottom-left
const BODY_EDGE = '#6e5430'       // dark outline around the body

export default function TileComponent({
  tile,
  isHinted,
  isFreeTile,
  tileWidth,
  tileHeight,
  depthOffset,
  onClick,
}: TileProps) {
  const faceX = tile.col * (tileWidth / 2) + tile.layer * depthOffset + depthOffset
  const faceY = tile.row * (tileHeight / 2) - tile.layer * depthOffset + depthOffset

  // Body sits behind the face, shifted bottom-left, so the chamfer pokes out as an L-shape.
  const bodyX = faceX - depthOffset
  const bodyY = faceY + depthOffset

  // Layered drop-shadow grows with each layer but keeps stacks tight.
  const dropX = -Math.round(depthOffset * 0.4)
  const dropY = Math.round(depthOffset * 0.9) + tile.layer * 1.2
  const dropBlur = Math.round(depthOffset * 1.1) + tile.layer * 1.5
  const dropAlpha = Math.min(0.5, 0.28 + tile.layer * 0.05)

  // Two z-tiers per layer:
  //   bodyZ = layer*100               (always BELOW every face in the same layer)
  //   faceZ = layer*100 + row+col + 1 (above same-layer bodies but below upper-layer bodies)
  // This guarantees a tile's dark body never sits on top of a neighbour's white face.
  const bodyZ = tile.layer * 100
  const faceZ = tile.layer * 100 + tile.row + tile.col + 1

  const baseTransition = { duration: 0.25 }
  const removedAnim = tile.removed
    ? { opacity: 0, scale: 0.8 }
    : { opacity: 1, scale: 1 }

  return (
    <>
      {/* BODY — the dark "thickness" of the tile + drop shadow. Renders BEHIND every face. */}
      <motion.div
        animate={removedAnim}
        transition={baseTransition}
        style={{
          position: 'absolute',
          left: bodyX,
          top: bodyY,
          width: tileWidth,
          height: tileHeight,
          zIndex: bodyZ,
          background: BODY_COLOR,
          border: `1px solid ${BODY_EDGE}`,
          borderRadius: 5,
          pointerEvents: 'none',
          filter: `drop-shadow(${dropX}px ${dropY}px ${dropBlur}px rgba(0,0,0,${dropAlpha.toFixed(2)}))`,
        }}
      />

      {/* FACE — the ivory top of the tile, with the symbol. Higher z than every body in the same layer. */}
      <motion.div
        animate={removedAnim}
        transition={baseTransition}
        style={{
          position: 'absolute',
          left: faceX,
          top: faceY,
          width: tileWidth,
          height: tileHeight,
          zIndex: faceZ,
        }}
        onClick={() => !tile.removed && onClick(tile.id)}
        className={cn(
          'select-none',
          isFreeTile ? 'cursor-pointer' : 'cursor-not-allowed',
          tile.removed && 'pointer-events-none',
        )}
        whileHover={isFreeTile && !tile.removed ? { scale: 1.04, transition: { duration: 0.1 } } : undefined}
        whileTap={isFreeTile && !tile.removed ? { scale: 0.97 } : undefined}
      >
        <div
          className={cn(
            'absolute inset-0 rounded-md border flex items-center justify-center overflow-hidden',
            'transition-colors duration-150',
            tile.selected
              ? 'border-amber-600 ring-2 ring-amber-400'
              : isHinted
                ? 'border-emerald-600 ring-2 ring-emerald-400 animate-pulse'
                : 'border-stone-700/70',
          )}
          style={{
            background: tile.selected
              ? 'linear-gradient(135deg, #fff4d1, #f3d97c)'
              : isHinted
                ? 'linear-gradient(135deg, #d8fbe0, #9ee5b0)'
                : 'linear-gradient(135deg, #fffaf0, #f0e4cb)',
          }}
        >
          {/* Top specular highlight */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0))',
            }}
          />

          {/* Warm shadow at the bottom edge of the face — meets the body cleanly */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4"
            style={{
              background: 'linear-gradient(to top, rgba(120,90,40,0.22), rgba(120,90,40,0))',
            }}
          />

          {/* Veil on non-free tiles */}
          {!isFreeTile && !tile.selected && !isHinted && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'rgba(40, 30, 15, 0.25)' }}
            />
          )}

          <span
            className={cn(
              'relative font-bold leading-none select-none',
              SUIT_COLORS[tile.def.suit],
              tileWidth < 50 ? 'text-sm' : 'text-xl',
              !isFreeTile && !tile.selected && !isHinted && 'opacity-80',
            )}
          >
            {tile.def.symbol}
          </span>
        </div>
      </motion.div>
    </>
  )
}
