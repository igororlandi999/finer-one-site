import { Easing, interpolate } from 'remotion'
import { HEIGHT, WIDTH } from '../lib/constants'

/**
 * A linha azul luminosa da Finer One como transição: um feixe que atravessa
 * o enquadramento. Devolve também a posição x para a revelação da interface.
 */
export function beamX(frame: number, from: number, to: number) {
  return interpolate(frame, [from, to], [-160, WIDTH + 160], { easing: Easing.bezier(0.6, 0, 0.25, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
}

export function Beam({ x, opacity = 1 }: { x: number; opacity?: number }) {
  if (x <= -150 || x >= WIDTH + 150) return null
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 60, opacity }}>
      <div
        style={{
          position: 'absolute',
          top: -100,
          left: x - 60,
          width: 120,
          height: HEIGHT + 200,
          transform: 'skewX(-14deg)',
          background: 'radial-gradient(closest-side, rgba(30,144,255,0.55), rgba(0,82,255,0.15) 60%, transparent)',
          filter: 'blur(18px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -100,
          left: x - 1.5,
          width: 3,
          height: HEIGHT + 200,
          transform: 'skewX(-14deg)',
          background: 'linear-gradient(to bottom, transparent, #9FD3FF 25%, #FFFFFF 50%, #9FD3FF 75%, transparent)',
          boxShadow: '0 0 18px 4px rgba(30,144,255,0.9)',
        }}
      />
    </div>
  )
}
