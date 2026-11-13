import { useId } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type Props = {
  /** Path em coordenadas do viewBox. */
  d: string
  viewBox: string
  className?: string
  /** Desenha a linha ao montar. */
  draw?: boolean
  /** Ponto de luz a percorrer a linha. */
  spark?: boolean
  delay?: number
  sparkDuration?: number
}

/**
 * A linha azul luminosa da Finer One — o motivo das apresentações e das
 * peças de marca: um traço néon com halo e um ponto de luz que o percorre.
 *
 * Três camadas: halo largo desfocado, traço médio e núcleo fino quase branco.
 * Puramente decorativa (aria-hidden).
 */
export function LuminousLine({ d, viewBox, className, draw = true, spark = true, delay = 0, sparkDuration = 6 }: Props) {
  const id = useId().replace(/:/g, '')
  const reduced = usePrefersReducedMotion()
  const drawStyle = draw
    ? { strokeDasharray: 1, strokeDashoffset: 1, animation: `fo-draw 2.4s cubic-bezier(0.65,0,0.35,1) ${delay}ms forwards` }
    : undefined

  return (
    <svg aria-hidden="true" viewBox={viewBox} fill="none" preserveAspectRatio="xMidYMid slice" className={cn('pointer-events-none', className)}>
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0052FF" stopOpacity="0" />
          <stop offset="0.35" stopColor="#1E90FF" stopOpacity="0.9" />
          <stop offset="0.75" stopColor="#5AB4FF" stopOpacity="1" />
          <stop offset="1" stopColor="#1E90FF" stopOpacity="0" />
        </linearGradient>
        <filter id={`blur-${id}`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <radialGradient id={`spark-${id}`}>
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.35" stopColor="#9FD3FF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#1E90FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d={d} pathLength={1} stroke={`url(#lg-${id})`} strokeWidth="10" opacity="0.55" filter={`url(#blur-${id})`} style={drawStyle} />
      <path d={d} pathLength={1} stroke={`url(#lg-${id})`} strokeWidth="2.5" style={drawStyle} />
      <path d={d} pathLength={1} stroke="#DDEEFF" strokeOpacity="0.85" strokeWidth="0.8" style={drawStyle} />

      {spark && !reduced && (
        <circle r="9" fill={`url(#spark-${id})`}>
          <animateMotion dur={`${sparkDuration}s`} begin={`${delay / 1000 + 1.6}s`} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
        </circle>
      )}
    </svg>
  )
}
