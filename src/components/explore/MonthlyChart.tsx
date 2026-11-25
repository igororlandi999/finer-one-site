import { useLayoutEffect, useId, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { Result } from '@/lib/explore/monthly'
import type { ExploreText } from './content'

/**
 * Gráfico mensal do Explore: entradas e saídas em barras, saldo projetado em
 * linha (tracejado = sem atrasos, azul = com atrasos). Sem saldo indicado,
 * mostra o calendário de recebimentos (fantasma = previsto, azul = com atrasos).
 * Os valores mudam com uma transição curta; nada fica em ciclo.
 */
type Props = {
  r: Result
  hasBalance: boolean
  t: ExploreText['chart']
  money: (v: number) => string
  axis: (v: number) => string
  month: (m: number) => string
  compact?: boolean
}

const EASE = [0.22, 1, 0.36, 1] as const

export function MonthlyChart({ r, hasBalance, t, money, axis, month, compact }: Props) {
  const reduced = useReducedMotion() ?? false
  const uid = useId().replace(/:/g, '')
  const wrap = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(640)
  const [hover, setHover] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    setW(Math.max(280, Math.round(el.clientWidth || 640)))
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const H = compact ? 220 : w < 520 ? 260 : 320
  const padL = w < 520 ? 44 : 58
  const padR = 12
  const padT = 18
  const padB = 30
  const iw = w - padL - padR
  const ih = H - padT - padB
  const n = r.base.months.length
  const col = iw / n

  const vals: number[] = [0]
  r.base.months.forEach((m, i) => {
    const d = r.delayed.months[i]
    vals.push(m.inflow, d.inflow)
    if (hasBalance) vals.push(m.outflow, m.closing, d.closing)
  })
  let max = Math.max(...vals)
  let min = Math.min(...vals)
  if (max === min) max = min + 1
  const span = max - min
  max += span * 0.08
  if (min < 0) min -= span * 0.08
  const y = (v: number) => padT + ((max - v) / (max - min)) * ih
  const y0 = y(0)

  // Marcas do eixo (4 a 5 valores redondos)
  const step = niceStep((max - min) / 4)
  const ticks: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) ticks.push(v)

  const bw = Math.min(26, col * (hasBalance ? 0.24 : 0.34))
  const gap = 4
  const cx = (i: number) => padL + col * i + col / 2
  const line = (key: 'base' | 'delayed') => r[key].months.map((m, i) => `${i ? 'L' : 'M'}${cx(i).toFixed(1)},${y(m.closing).toFixed(1)}`).join(' ')
  const dur = reduced ? 0 : 0.45

  const bar = (x: number, v: number) => ({ x, y: Math.min(y(v), y0), width: bw, height: Math.max(0, Math.abs(y0 - y(v))) })
  // Em SVG, x/y no Motion seriam transformações; attrX/attrY animam os atributos.
  const abar = (x: number, v: number) => {
    const b = bar(x, v)
    return { attrX: b.x, attrY: b.y, width: b.width, height: b.height }
  }

  return (
    <div ref={wrap} className="relative w-full select-none overflow-x-clip">
      <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label={hasBalance ? t.aria : t.ariaCal} className="block" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={`in-${uid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3D86FF" />
            <stop offset="1" stopColor="#0052FF" />
          </linearGradient>
          <filter id={`glow-${uid}`} filterUnits="userSpaceOnUse" x="0" y="0" width={w} height={H}>
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {ticks.map((v) => (
          <g key={v}>
            <line x1={padL} x2={w - padR} y1={y(v)} y2={y(v)} stroke={v === 0 ? '#070D2B' : '#0B1030'} strokeOpacity={v === 0 ? 0.28 : 0.07} />
            <text x={padL - 8} y={y(v) + 4} textAnchor="end" className="fill-[#0B1030]/45 text-[10.5px] tabular-nums">
              {axis(v)}
            </text>
          </g>
        ))}

        {r.base.months.map((m, i) => {
          const d = r.delayed.months[i]
          const left = hasBalance ? cx(i) - bw - gap / 2 : cx(i) - bw / 2
          return (
            <g key={i}>
              {hover === i && <rect x={padL + col * i + 2} y={padT} width={col - 4} height={ih} rx={10} fill="#0052FF" fillOpacity="0.05" />}
              {/* Entradas previstas (fantasma) e com atrasos */}
              <rect {...bar(left, m.inflow)} rx={5} fill="none" stroke="#0052FF" strokeOpacity="0.35" strokeDasharray="3 3" />
              <motion.rect initial={false} animate={abar(left, d.inflow)} transition={{ duration: dur, ease: EASE }} rx={5} fill={`url(#in-${uid})`} />
              {hasBalance && <motion.rect initial={false} animate={abar(cx(i) + gap / 2, m.outflow)} transition={{ duration: dur, ease: EASE }} rx={5} fill="#C7D5F3" />}
              <text x={cx(i)} y={H - 9} textAnchor="middle" className="fill-[#0B1030]/55 text-[11px] font-medium capitalize">
                {month(i)}
              </text>
              <rect x={padL + col * i} y={padT} width={col} height={ih + padB} fill="transparent" onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} />
            </g>
          )
        })}

        {hasBalance && (
          <g key={n} pointerEvents="none">
            <motion.path initial={false} animate={{ d: line('base') }} transition={{ duration: dur, ease: EASE }} fill="none" stroke="#070D2B" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="5 5" />
            <motion.path initial={false} animate={{ d: line('delayed') }} transition={{ duration: dur, ease: EASE }} fill="none" stroke="#1E90FF" strokeWidth="7" strokeOpacity="0.45" filter={`url(#glow-${uid})`} />
            <motion.path initial={false} animate={{ d: line('delayed') }} transition={{ duration: dur, ease: EASE }} fill="none" stroke="#0052FF" strokeWidth="2.6" strokeLinejoin="round" />
            {r.delayed.months.map((m, i) => (
              <motion.circle key={i} initial={false} animate={{ cx: cx(i), cy: y(m.closing) }} transition={{ duration: dur, ease: EASE }} r={hover === i ? 5.5 : 4} fill="#fff" stroke={m.closing < 0 ? '#E5484D' : '#0052FF'} strokeWidth="2.4" />
            ))}
          </g>
        )}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 w-[210px] rounded-xl border border-[#0B1030]/[0.08] bg-white/95 p-3 text-[12px] shadow-[0_18px_40px_-18px_rgba(7,13,43,0.45)] backdrop-blur"
          style={{ left: Math.min(Math.max(cx(hover) - 105, 0), w - 210) }}
        >
          <p className="font-semibold capitalize text-[#070D2B]">{month(hover)}</p>
          <dl className="mt-1.5 space-y-1 tabular-nums">
            <Row k={`${hasBalance ? t.inflow : t.receipts} · ${t.base.toLowerCase()}`} v={money(r.base.months[hover].inflow)} />
            <Row k={`${hasBalance ? t.inflow : t.receipts} · ${t.delayed.toLowerCase()}`} v={money(r.delayed.months[hover].inflow)} strong />
            {hasBalance && <Row k={t.outflow} v={money(r.base.months[hover].outflow)} />}
            {hasBalance && <Row k={`${t.title} · ${t.base.toLowerCase()}`} v={money(r.base.months[hover].closing)} />}
            {hasBalance && <Row k={`${t.title} · ${t.delayed.toLowerCase()}`} v={money(r.delayed.months[hover].closing)} strong neg={r.delayed.months[hover].closing < 0} />}
          </dl>
        </div>
      )}

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-[#0B1030]/60">
        <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#0052FF]" />{hasBalance ? t.inflow : t.receipts} · {t.delayed.toLowerCase()}</li>
        <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px] border border-dashed border-[#0052FF]/60" />{hasBalance ? t.inflow : t.receipts} · {t.base.toLowerCase()}</li>
        {hasBalance && <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#C7D5F3]" />{t.outflow}</li>}
        {hasBalance && <li className="flex items-center gap-2"><span className="h-[3px] w-5 rounded bg-[#0052FF] shadow-[0_0_8px_#1E90FF]" />{t.title} · {t.delayed.toLowerCase()}</li>}
        {hasBalance && <li className="flex items-center gap-2"><span className="w-5 border-t-2 border-dashed border-[#070D2B]/45" />{t.title} · {t.base.toLowerCase()}</li>}
      </ul>
    </div>
  )
}

function Row({ k, v, strong, neg }: { k: string; v: string; strong?: boolean; neg?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-[#0B1030]/55">{k}</dt>
      <dd className={strong ? (neg ? 'font-semibold text-[#D13438]' : 'font-semibold text-[#070D2B]') : 'text-[#070D2B]/80'}>{v}</dd>
    </div>
  )
}

function niceStep(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1))))
  const f = raw / p
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p
}
