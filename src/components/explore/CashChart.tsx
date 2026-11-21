import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { HORIZON } from '@/lib/explore/model'

/**
 * Gráfico do saldo projetado (SVG, sem bibliotecas): linha do cenário atual
 * (tracejada) e do simulado (azul), linha do zero, zona abaixo de zero e o ponto
 * mais baixo do cenário simulado. As linhas mudam de forma suavemente quando os
 * valores mudam (mesmo número de pontos).
 */
type Props = {
  current: number[]
  simulated: number[]
  minDay: number
  label: string
  money: (n: number) => string
  shortDate: (day: number) => string
  zeroLabel: string
  compact?: boolean
}


export function CashChart({ current, simulated, minDay, label, money, shortDate, zeroLabel, compact }: Props) {
  const reduced = useReducedMotion() ?? false
  const uid = useId().replace(/:/g, '')
  // O desenho segue a largura real (a letra não encolhe no telemóvel).
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)
  useEffect(() => {
    const el = box.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width) || 640))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const W = Math.max(280, Math.min(900, width))
  const narrow = W < 520
  const H = narrow ? 230 : 280
  const PAD = { l: narrow ? 56 : 64, r: 12, t: 18, b: 30 }
  const all = [...current, ...simulated, 0]
  let lo = Math.min(...all)
  let hi = Math.max(...all)
  if (hi - lo < 1) {
    hi += 1000
    lo -= 1000
  }
  const span = hi - lo
  lo -= span * 0.08
  hi += span * 0.08

  const x = (d: number) => PAD.l + (d / HORIZON) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + ((hi - v) / (hi - lo)) * (H - PAD.t - PAD.b)
  // Degraus: o saldo muda no dia do movimento e mantém-se até ao seguinte.
  const path = (s: number[]) => s.map((v, d) => `${d === 0 ? 'M' : 'L'}${x(d).toFixed(1)},${y(d === 0 ? v : s[d - 1]).toFixed(1)}L${x(d).toFixed(1)},${y(v).toFixed(1)}`).join('')
  const area = (s: number[]) => `${path(s)}L${x(HORIZON).toFixed(1)},${y(0).toFixed(1)}L${x(0).toFixed(1)},${y(0).toFixed(1)}Z`

  const ticks = narrow ? [0, 30, 60, 90] : [0, 15, 30, 45, 60, 75, 90]
  const yTicks = niceTicks(lo, hi, compact || narrow ? 3 : 4)
  const t = { duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] as const }
  const minV = simulated[minDay]

  return (
    <div ref={box} className="w-full">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full overflow-visible">
      <defs>
        <clipPath id={`bz-${uid}`}>
          <rect x={PAD.l} y={y(0)} width={W - PAD.l - PAD.r} height={Math.max(0, H - PAD.b - y(0))} />
        </clipPath>
        <linearGradient id={`sf-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0052FF" stopOpacity="0.16" />
          <stop offset="1" stopColor="#0052FF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grelha e eixos */}
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="#0B1030" strokeOpacity="0.07" />
          <text x={PAD.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#0B1030" fillOpacity="0.5">
            {money(v)}
          </text>
        </g>
      ))}
      {ticks.map((d) => (
        <text key={d} x={x(d)} y={H - 8} textAnchor={d === 0 ? 'start' : d === HORIZON ? 'end' : 'middle'} fontSize="11" fill="#0B1030" fillOpacity="0.5">
          {shortDate(d)}
        </text>
      ))}

      {/* Zona do simulado e parte abaixo de zero */}
      <motion.path initial={false} animate={{ d: area(simulated) }} transition={t} fill={`url(#sf-${uid})`} />
      <motion.path initial={false} animate={{ d: area(simulated) }} transition={t} fill="#E5484D" fillOpacity="0.14" clipPath={`url(#bz-${uid})`} />

      {/* Zero */}
      <line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} stroke="#E5484D" strokeOpacity="0.55" strokeDasharray="3 4" />
      <text x={W - PAD.r} y={y(0) - 6} textAnchor="end" fontSize="10.5" fill="#B4232A" fillOpacity="0.8">
        {zeroLabel}
      </text>

      {/* Linhas */}
      <motion.path initial={false} animate={{ d: path(current) }} transition={t} fill="none" stroke="#0B1030" strokeOpacity="0.38" strokeWidth="1.6" strokeDasharray="5 5" />
      <motion.path initial={false} animate={{ d: path(simulated) }} transition={t} fill="none" stroke="#0052FF" strokeWidth="2.4" strokeLinejoin="round" />

      {/* Ponto mais baixo (simulado) */}
      <motion.g initial={false} animate={{ x: x(minDay), y: y(minV) }} transition={t}>
        <circle r="9" fill="#0052FF" fillOpacity="0.15" />
        <circle r="4.5" fill="#fff" stroke="#0052FF" strokeWidth="2.4" />
      </motion.g>
    </svg>
    </div>
  )
}

function niceTicks(lo: number, hi: number, count: number) {
  const raw = (hi - lo) / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const out: number[] = []
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(Math.round(v) || 0)
  return out
}
