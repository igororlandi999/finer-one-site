import { getLength, getPointAtLength } from '@remotion/paths'
import { Easing, interpolate } from 'remotion'

/**
 * A linha azul luminosa da Finer One como "fio" que liga informação, análise
 * e decisão: uma cabeça de luz percorre uma curva com um rasto que se
 * desvanece, deixando um traço residual muito subtil.
 *
 * Coordenadas do ecrã (1920×1080). `from`/`to` em fotogramas.
 */
const ease = Easing.bezier(0.6, 0, 0.2, 1)

export function Comet({
  frame,
  d,
  from,
  to,
  tail = 0.32,
  residue = 0.18,
  fadeOut = 16,
  id,
}: {
  frame: number
  d: string
  from: number
  to: number
  tail?: number
  residue?: number
  fadeOut?: number
  id: string
}) {
  if (frame < from || frame > to + fadeOut) return null
  const L = getLength(d)
  const p = interpolate(frame, [from, to], [0, 1], { easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const head = p * L
  const end = interpolate(frame, [to, to + fadeOut], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const pt = getPointAtLength(d, Math.max(0.01, Math.min(L - 0.01, head)))

  // Segmentos do rasto: quanto mais perto da cabeça, mais intenso.
  const seg = (fraction: number) => {
    const len = Math.min(head, L * tail * fraction)
    return { strokeDasharray: `${len} ${L * 2}`, strokeDashoffset: -(head - len) }
  }

  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 70, opacity: end }}>
      <defs>
        <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {/* Traço residual subtil já percorrido */}
      <path d={d} fill="none" stroke="#1E90FF" strokeOpacity={residue} strokeWidth={1.5} style={{ strokeDasharray: `${head} ${L * 2}` }} />
      {/* Brilho do rasto */}
      <path d={d} fill="none" stroke="#1E90FF" strokeOpacity={0.55} strokeWidth={10} strokeLinecap="round" filter={`url(#glow-${id})`} style={seg(0.6)} />
      {/* Rasto em degradé (três camadas) */}
      <path d={d} fill="none" stroke="#0052FF" strokeOpacity={0.45} strokeWidth={2.5} strokeLinecap="round" style={seg(1)} />
      <path d={d} fill="none" stroke="#1E90FF" strokeOpacity={0.8} strokeWidth={2.5} strokeLinecap="round" style={seg(0.55)} />
      <path d={d} fill="none" stroke="#BFE0FF" strokeOpacity={1} strokeWidth={2.5} strokeLinecap="round" style={seg(0.2)} />
      {/* Cabeça de luz */}
      <circle cx={pt.x} cy={pt.y} r={14} fill="#1E90FF" opacity={0.35} filter={`url(#glow-${id})`} />
      <circle cx={pt.x} cy={pt.y} r={4.5} fill="#FFFFFF" />
    </svg>
  )
}

/** Curva suave entre dois pontos (tangentes horizontais). */
export function curve(a: { x: number; y: number }, b: { x: number; y: number }, bend = 0.45) {
  const dx = (b.x - a.x) * bend
  return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`
}

/** Pulso luminoso discreto (feedback de clique / envio). */
export function Pulse({ frame, at, x, y, size = 60 }: { frame: number; at: number; x: number; y: number; size?: number }) {
  if (frame < at || frame > at + 20) return null
  const t = interpolate(frame, [at, at + 20], [0, 1], { easing: Easing.out(Easing.cubic) })
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: 999,
        border: '2px solid rgba(30,144,255,0.9)',
        boxShadow: '0 0 18px rgba(30,144,255,0.7)',
        transform: `scale(${0.5 + t * 0.9})`,
        opacity: 1 - t,
        pointerEvents: 'none',
        zIndex: 60,
      }}
    />
  )
}
