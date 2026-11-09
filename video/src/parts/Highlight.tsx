import { interpolate } from 'remotion'
import type { Rect } from '../lib/anchors'

/**
 * Destaque discreto: contorno azul elétrico com brilho suave, que se desenha
 * à volta do bloco relevante e se desvanece. Nada de setas nem de etiquetas.
 */
export function Highlight({ frame, rect, from, to, pad = 8, radius = 14 }: { frame: number; rect?: Rect; from: number; to: number; pad?: number; radius?: number }) {
  if (!rect) return null
  const draw = interpolate(frame, [from, from + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const fade = interpolate(frame, [to - 10, to], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  if (frame < from || frame > to) return null
  const w = rect.w + pad * 2
  const h = rect.h + pad * 2
  const perimeter = 2 * (w + h)

  return (
    <svg
      style={{ position: 'absolute', left: rect.x - pad, top: rect.y - pad, overflow: 'visible', pointerEvents: 'none', zIndex: 40, opacity: fade }}
      width={w}
      height={h}
    >
      <rect x="0" y="0" width={w} height={h} rx={radius} fill="rgba(0,82,255,0.05)" stroke="#1E90FF" strokeOpacity={0.35} strokeWidth={8} style={{ filter: 'blur(6px)' }} strokeDasharray={perimeter} strokeDashoffset={perimeter * (1 - draw)} />
      <rect x="0" y="0" width={w} height={h} rx={radius} fill="none" stroke="#0052FF" strokeWidth={2} strokeDasharray={perimeter} strokeDashoffset={perimeter * (1 - draw)} />
    </svg>
  )
}

/** Realce suave por preenchimento (sem contorno) — para percorrer valores lado a lado. */
export function Glow({ frame, rect, from, to, pad = 4, radius = 10 }: { frame: number; rect?: Rect; from: number; to: number; pad?: number; radius?: number }) {
  if (!rect || frame < from || frame > to) return null
  const o = interpolate(frame, [from, from + 8, to - 8, to], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x - pad,
        top: rect.y - pad,
        width: rect.w + pad * 2,
        height: rect.h + pad * 2,
        borderRadius: radius,
        background: 'linear-gradient(135deg, rgba(0,82,255,0.10), rgba(30,144,255,0.04))',
        boxShadow: 'inset 0 0 0 1px rgba(0,82,255,0.25)',
        opacity: o,
        pointerEvents: 'none',
        zIndex: 30,
      }}
    />
  )
}
