import { Easing, interpolate } from 'remotion'

/** Ponto do percurso do cursor (coordenadas da interface). `click` = clique nesse fotograma. */
export type CursorKey = { f: number; x: number; y: number; click?: boolean }

const ease = Easing.bezier(0.33, 0, 0.15, 1)

/**
 * Cursor discreto, com percurso suavizado e clique visível (ligeira compressão
 * + onda azul). Vive dentro do palco, por isso acompanha a câmara.
 */
export function Cursor({ frame, path, visible = [0, Infinity] }: { frame: number; path: CursorKey[]; visible?: [number, number] }) {
  let x = path[0].x
  let y = path[0].y
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const b = path[i + 1]
    if (frame >= a.f && frame <= b.f) {
      const t = interpolate(frame, [a.f, b.f], [0, 1], { easing: ease })
      x = a.x + (b.x - a.x) * t
      y = a.y + (b.y - a.y) * t
    } else if (frame > b.f) {
      x = b.x
      y = b.y
    }
  }

  const opacity = interpolate(frame, [visible[0], visible[0] + 8, visible[1] - 8, visible[1]], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const click = path.find((k) => k.click && frame >= k.f && frame < k.f + 18)
  const since = click ? frame - click.f : 99
  const press = click ? interpolate(since, [0, 4, 9], [1, 0.82, 1], { extrapolateRight: 'clamp' }) : 1
  const ring = click ? interpolate(since, [0, 18], [0, 1], { extrapolateRight: 'clamp' }) : 0

  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity, pointerEvents: 'none', zIndex: 50 }}>
      {click && (
        <span
          style={{
            position: 'absolute',
            left: -22,
            top: -22,
            width: 44,
            height: 44,
            borderRadius: 999,
            border: '2px solid rgba(0,82,255,0.8)',
            transform: `scale(${0.4 + ring * 1.2})`,
            opacity: 1 - ring,
          }}
        />
      )}
      <svg width="22" height="28" viewBox="0 0 22 28" style={{ transform: `scale(${press})`, transformOrigin: '2px 2px', filter: 'drop-shadow(0 4px 8px rgba(4,8,23,0.35))' }}>
        <path d="M2 2 L2 22 L7.5 17 L11 25.5 L14.5 24 L11 15.8 L18.5 15.8 Z" fill="#FFFFFF" stroke="#0B1030" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
