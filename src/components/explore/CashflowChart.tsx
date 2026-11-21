import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { HORIZON } from '@/lib/explore/model'
import type { Projection } from '@/lib/explore/model'

/**
 * Gráfico do simulador, na linguagem do "Evolução do cashflow" da plataforma:
 * barras semanais de entradas (azul) e saídas (azul claro) do cenário simulado,
 * com o saldo projetado por cima — linha do cenário atual (tracejada) e do
 * simulado (azul, com brilho). Ao passar o rato, uma caixa mostra a semana.
 * A curva do saldo passa pelos pontos reais (nunca os ultrapassa).
 */
type Props = {
  current: Projection
  simulated: Projection
  money: (n: number) => string
  axisMoney: (n: number) => string
  shortDate: (day: number) => string
  labels: { inflow: string; outflow: string; current: string; simulated: string; week: (d: string) => string; balance: string }
  ariaLabel: string
}

const WEEKS = Math.ceil((HORIZON + 1) / 7) // 13

function monotone(p: [number, number][]) {
  const n = p.length
  if (n < 2) return ''
  const dx: number[] = []
  const m: number[] = []
  const t: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = p[i + 1][0] - p[i][0] || 1e-6
    m[i] = (p[i + 1][1] - p[i][1]) / dx[i]
  }
  t[0] = m[0]
  t[n - 1] = m[n - 2]
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i])
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d += `C${(p[i][0] + h).toFixed(1)},${(p[i][1] + h * t[i]).toFixed(1)} ${(p[i + 1][0] - h).toFixed(1)},${(p[i + 1][1] - h * t[i + 1]).toFixed(1)} ${p[i + 1][0].toFixed(1)},${p[i + 1][1].toFixed(1)}`
  }
  return d
}

export function CashflowChart({ current, simulated, money, axisMoney, shortDate, labels, ariaLabel }: Props) {
  const reduced = useReducedMotion() ?? false
  const uid = useId().replace(/:/g, '')
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(760)
  const [hover, setHover] = useState<number | null>(null)
  useEffect(() => {
    const el = box.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width) || 760))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const W = Math.max(300, Math.min(1000, width))
  const narrow = W < 560
  const H = narrow ? 260 : 320
  const P = { l: narrow ? 50 : 64, r: 10, t: 16, b: 30 }

  const weeks = useMemo(() => {
    const out = Array.from({ length: WEEKS }, (_, w) => ({ w, start: w * 7, end: Math.min(HORIZON, w * 7 + 6), inflow: 0, outflow: 0 }))
    for (const e of simulated.events) {
      const b = out[Math.min(WEEKS - 1, Math.floor(e.day / 7))]
      if (e.kind === 'in') b.inflow += e.amount
      else b.outflow += e.amount
    }
    return out
  }, [simulated.events])

  const maxBar = Math.max(1, ...weeks.map((w) => Math.max(w.inflow, w.outflow)))
  const all = [...current.series, ...simulated.series, maxBar, 0]
  let lo = Math.min(...all)
  let hi = Math.max(...all)
  const span = hi - lo || 1000
  lo -= span * 0.08
  hi += span * 0.06

  const plotW = W - P.l - P.r
  const x = (d: number) => P.l + (d / HORIZON) * plotW
  const y = (v: number) => P.t + ((hi - v) / (hi - lo)) * (H - P.t - P.b)

  const colW = plotW / WEEKS
  // Saldo no fim de cada semana, ao centro da coluna (como o "saldo final" da plataforma); começa no saldo de hoje.
  const cx = (w: number) => P.l + w * colW + colW / 2
  const weekEnd = (s: number[]) => weeks.map((wk) => s[wk.end])
  const linePts = (s: number[]): [number, number][] => [[P.l, y(s[0])], ...weekEnd(s).map((v, w) => [cx(w), y(v)] as [number, number]), [W - P.r, y(s[HORIZON])]]
  const line = (s: number[]) => monotone(linePts(s))
  const barW = Math.max(3, Math.min(14, colW * 0.26))
  const ticks = niceTicks(lo, hi, narrow ? 4 : 5)
  const dateTicks = narrow ? [0, 42, 84] : [0, 21, 42, 63, 84]
  const t = { duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] as const }
  const minW = Math.min(WEEKS - 1, Math.floor(simulated.minDay / 7))
  const hw = hover == null ? null : weeks[hover]

  return (
    <div ref={box} className="relative w-full" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="h-auto w-full overflow-visible">
        <defs>
          <linearGradient id={`area-${uid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1E90FF" stopOpacity="0.16" />
            <stop offset="1" stopColor="#1E90FF" stopOpacity="0" />
          </linearGradient>
          <filter id={`glow-${uid}`} filterUnits="userSpaceOnUse" x="-50" y="-50" width={W + 100} height={H + 100}>
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <clipPath id={`neg-${uid}`}>
            <rect x={P.l} y={y(0)} width={plotW} height={Math.max(0, H - P.b - y(0))} />
          </clipPath>
        </defs>

        {/* Grelha */}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="#0B1030" strokeOpacity={v === 0 ? 0.2 : 0.06} strokeDasharray={v === 0 ? '2 4' : undefined} />
            <text x={P.l - 10} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#0B1030" fillOpacity="0.45">
              {axisMoney(v)}
            </text>
          </g>
        ))}
        {dateTicks.map((d, i) => (
          <text key={d} x={x(d + 3)} y={H - 7} textAnchor={i === 0 ? 'start' : i === dateTicks.length - 1 ? 'end' : 'middle'} fontSize="11" fill="#0B1030" fillOpacity="0.45">
            {shortDate(d)}
          </text>
        ))}

        {/* Coluna em destaque */}
        {hw && <rect x={P.l + hw.w * colW + 2} y={P.t} width={colW - 4} height={H - P.t - P.b} rx="8" fill="#0052FF" fillOpacity="0.05" />}

        {/* Barras semanais: entradas e saídas (como na plataforma) */}
        {weeks.map((wk) => {
          const cx = P.l + wk.w * colW + colW / 2
          const hIn = y(0) - y(wk.inflow)
          const hOut = y(0) - y(wk.outflow)
          return (
            <g key={wk.w}>
              <motion.rect initial={false} animate={{ y: y(wk.inflow), height: Math.max(0, hIn) }} transition={{ ...t, delay: reduced ? 0 : wk.w * 0.02 }} x={cx - barW - 1} width={barW} rx={barW / 2.5} fill="#1E6BFF" fillOpacity={hover == null || hover === wk.w ? 0.9 : 0.35} />
              <motion.rect initial={false} animate={{ y: y(wk.outflow), height: Math.max(0, hOut) }} transition={{ ...t, delay: reduced ? 0 : wk.w * 0.02 }} x={cx + 1} width={barW} rx={barW / 2.5} fill="#9DB9F5" fillOpacity={hover == null || hover === wk.w ? 0.95 : 0.4} />
            </g>
          )
        })}

        {/* Saldo: área, zona negativa, linhas */}
        <motion.path initial={false} animate={{ d: `${line(simulated.series)}L${W - P.r},${y(0)}L${P.l},${y(0)}Z` }} transition={t} fill={`url(#area-${uid})`} />
        <motion.path initial={false} animate={{ d: `${line(simulated.series)}L${W - P.r},${y(0)}L${P.l},${y(0)}Z` }} transition={t} fill="#E5484D" fillOpacity="0.12" clipPath={`url(#neg-${uid})`} />
        <motion.path initial={false} animate={{ d: line(current.series) }} transition={t} fill="none" stroke="#0B1030" strokeOpacity="0.4" strokeWidth="1.8" strokeDasharray="5 5" />
        <motion.path initial={false} animate={{ d: line(simulated.series) }} transition={t} fill="none" stroke="#1E90FF" strokeWidth="7" strokeOpacity="0.3" filter={`url(#glow-${uid})`} />
        <motion.path initial={false} animate={{ d: line(simulated.series) }} transition={t} fill="none" stroke="#0052FF" strokeWidth="2.6" strokeLinecap="round" />

        {weekEnd(simulated.series).map((v, w) => (
          <motion.circle key={w} initial={false} animate={{ cx: cx(w), cy: y(v) }} transition={t} r={hover === w ? 4.5 : 3} fill="#fff" stroke="#0052FF" strokeWidth="2" />
        ))}

        {/* Semana do ponto mais baixo do cenário simulado */}
        <motion.g initial={false} animate={{ x: cx(minW), y: y(simulated.series[weeks[minW].end]) }} transition={t}>
          <circle r="12" fill="#1E90FF" fillOpacity="0.18" />
          <circle r="5" fill="#fff" stroke="#0052FF" strokeWidth="2.6" />
        </motion.g>

        {/* Zonas de rato por semana */}
        {weeks.map((wk) => (
          <rect key={wk.w} x={P.l + wk.w * colW} y={P.t} width={colW} height={H - P.t - P.b} fill="transparent" onMouseEnter={() => setHover(wk.w)} onTouchStart={() => setHover(wk.w)} />
        ))}
      </svg>

      {/* Caixa da semana (como o detalhe do gráfico da plataforma) */}
      {hw && (
        <div
          className="pointer-events-none absolute top-2 z-10 w-[200px] rounded-2xl border border-[#0B1030]/[0.08] bg-white/95 p-3.5 text-[12px] shadow-[0_20px_40px_-20px_rgba(7,13,43,0.35)] backdrop-blur"
          style={{ left: Math.min(Math.max(0, ((P.l + hw.w * colW + colW / 2) / W) * width - 100), width - 200) }}
        >
          <p className="font-semibold text-[#070D2B]">{labels.week(shortDate(hw.start))}</p>
          <dl className="mt-2 space-y-1 tabular-nums">
            <Row dot="#1E6BFF" k={labels.inflow} v={money(hw.inflow)} />
            <Row dot="#9DB9F5" k={labels.outflow} v={money(hw.outflow)} />
            <Row dot="#0052FF" k={`${labels.balance} · ${labels.simulated}`} v={money(simulated.series[hw.end])} strong />
            <Row dot="#9AA1B2" k={`${labels.balance} · ${labels.current}`} v={money(current.series[hw.end])} />
          </dl>
        </div>
      )}

      {/* Legenda */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-[#0B1030]/65">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#1E6BFF]" />{labels.inflow}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#9DB9F5]" />{labels.outflow}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-[3px] w-5 rounded-full bg-[#0052FF] shadow-[0_0_8px_#1E90FF]" />{labels.balance} · {labels.simulated}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0 w-5 border-t-2 border-dashed border-[#0B1030]/40" />{labels.balance} · {labels.current}</span>
      </div>
    </div>
  )
}

function Row({ dot, k, v, strong }: { dot: string; k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-[#0B1030]/60">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
        {k}
      </dt>
      <dd className={strong ? 'font-semibold text-[#070D2B]' : 'text-[#0B1030]/80'}>{v}</dd>
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
