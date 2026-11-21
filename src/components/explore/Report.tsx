import { useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowRight, Info, Printer, RotateCcw, Sparkles } from 'lucide-react'
import { advise, simulate } from '@/lib/explore/monthly'
import type { Kpi, Light, MonthlyInputs, ScenarioKind } from '@/lib/explore/monthly'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { MonthlyChart } from './MonthlyChart'
import { insightOf, movedTotal, useFmt } from './Simulator'
import type { ExploreText, Lang } from './content'

const EASE = [0.22, 1, 0.36, 1] as const
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const rise: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -10% 0px' } } as const

const LIGHT: Record<Light, string> = { green: '#18A957', amber: '#E8A317', red: '#E5484D', na: '#B8C0D0' }

type Props = { t: ExploreText; lang: Lang; inp: MonthlyInputs; scenario: ScenarioKind; company: string; currency: string; preview: boolean; onAgain: () => void }

/** Análise completa — só aparece depois da confirmação do recetor (ou em pré-visualização, assinalada). */
export function Report({ t, lang, inp, scenario, company, currency, preview, onAgain }: Props) {
  const R = t.report
  const f = useFmt(currency, lang)
  const r = useMemo(() => simulate(inp), [inp])
  const r3 = useMemo(() => simulate({ ...inp, horizon: 3 }), [inp])
  const r6 = useMemo(() => simulate({ ...inp, horizon: 6 }), [inp])
  const notes = advise(inp, r, { money: f.money, month: (m, l) => f.monthLong(m, l) })
  const insight = insightOf(inp, r, t.insight, f)
  const H = inp.horizon
  const last = (p: typeof r.base) => p.months[p.months.length - 1]?.closing ?? 0

  useEffect(() => {
    track('full_report_viewed', { scenario, horizon: H, preview })
  }, [scenario, H, preview])

  const summary = inp.hasBalance
    ? r.maxGap > 0.5
      ? R.summaryText({ h: H, share: inp.delayShare, days: inp.delayDays, gap: f.money(r.maxGap), month: f.monthLong(r.maxGapMonth), end: f.money(last(r.delayed)), endBase: f.money(last(r.base)) })
      : R.summaryNone(H, f.money(last(r.delayed)))
    : R.summaryCal({ h: H, share: inp.delayShare, days: inp.delayDays, moved: f.money(movedTotal(inp)), pushed: f.money(r.delayed.pushedOut) })

  const avg = (a: number[]) => a.slice(0, H).reduce((x, y) => x + y, 0) / H
  const situation: [string, string][] = [
    ...(inp.hasBalance ? ([[t.f.balance, f.money(inp.balance)]] as [string, string][]) : []),
    [scenario === 'clients' ? t.f.toReceive : t.f.receipts, `${f.money(avg(inp.receipts))} (${lang === 'pt' ? 'média' : 'average'})`],
    ...(inp.hasBalance ? ([[t.f.payments, `${f.money(avg(inp.payments))} (${lang === 'pt' ? 'média' : 'average'})`]] as [string, string][]) : []),
    [scenario === 'clients' ? t.f.delayShareClients : t.f.delayShare, `${inp.delayShare}%`],
    [t.f.delayDays, `${inp.delayDays} ${t.f.days}`],
    [t.f.horizon, `${H} ${t.f.months}`],
  ]

  const cmp: [string, number, number][] = [
    [R.rows.totalIn, r.base.totalIn, r.delayed.totalIn],
    ...(inp.hasBalance
      ? ([
          [R.rows.totalOut, r.base.totalOut, r.delayed.totalOut],
          [R.rows.min, r.base.minClosing, r.delayed.minClosing],
          [R.rows.end, last(r.base), last(r.delayed)],
        ] as [string, number, number][])
      : []),
    [R.rows.pushed, 0, r.delayed.pushedOut],
  ]

  const kpiValue = (k: Kpi) => {
    if (k.value === null) return R.na
    if (k.id === 'days') return `${Math.round(k.value)} ${t.f.days}`
    if (k.id === 'cover') return k.value.toLocaleString(lang === 'pt' ? 'pt-PT' : 'en-GB', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
    return `${(k.value * 100).toLocaleString(lang === 'pt' ? 'pt-PT' : 'en-GB', { maximumFractionDigits: 1 })}%`
  }

  return (
    <section id="relatorio" aria-labelledby="rel-titulo" className="relative scroll-mt-20 bg-[#F6F8FC] px-3 py-20 text-navy sm:px-6 lg:py-28">
      <style>{'@media print{body *{visibility:hidden!important}#relatorio,#relatorio *{visibility:visible!important}#relatorio{position:absolute;left:0;top:0;width:100%;padding:0!important;background:#fff!important}.no-print{display:none!important}}'}</style>
      <motion.div variants={group} initial="hidden" animate="show" className="mx-auto max-w-[1080px]">
        <motion.div variants={rise} className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-accent" aria-hidden="true" />
              {R.eyebrow}
            </p>
            <h2 id="rel-titulo" className="mt-3 font-display text-[32px] font-bold leading-[1.05] tracking-[-0.035em] text-[#070D2B] sm:text-[44px]">
              {R.title(company)}
            </h2>
            <p className="mt-2 text-[13.5px] capitalize text-[#0B1030]/50">
              {f.monthLong(0)} — {f.monthLong(H - 1)}
            </p>
          </div>
          <button type="button" onClick={() => window.print()} className="no-print inline-flex h-11 items-center gap-2 self-start rounded-lg border border-[#0B1030]/12 bg-white px-4 text-[14px] font-semibold text-[#070D2B] transition-colors hover:border-accent sm:self-auto">
            <Printer className="h-4 w-4" aria-hidden="true" />
            {R.print}
          </button>
        </motion.div>

        <motion.div variants={rise} className="no-print mt-6 space-y-2">
          {preview && <Notice tone="warn">{R.previewNote}</Notice>}
          <Notice>{R.emailNote}</Notice>
        </motion.div>

        {/* Resumo executivo */}
        <Card title={R.summary} className="mt-8">
          <p className={cn('font-display text-[22px] font-bold leading-[1.25] tracking-[-0.02em] sm:text-[26px]', insight.tone === 'risk' ? 'text-[#D13438]' : 'text-[#070D2B]')}>{insight.title}</p>
          <p className="mt-3 max-w-[780px] text-[15px] leading-[1.65] text-[#0B1030]/65">{summary}</p>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* Situação simulada */}
          <Card title={R.situation}>
            <dl className="divide-y divide-[#0B1030]/[0.06]">
              {situation.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 py-2.5 text-[14px]">
                  <dt className="text-[#0B1030]/60">{k}</dt>
                  <dd className="text-right font-semibold tabular-nums text-[#070D2B]">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Comparação */}
          <Card title={R.comparison}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-[14px] tabular-nums">
                <thead>
                  <tr className="text-left text-[12px] text-[#0B1030]/50">
                    <th className="pb-2 font-medium" />
                    <th className="pb-2 text-right font-medium">{R.base}</th>
                    <th className="pb-2 text-right font-medium">{R.delayed}</th>
                    <th className="pb-2 text-right font-medium">{R.diff}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0B1030]/[0.06]">
                  {cmp.map(([k, a, b]) => (
                    <tr key={k}>
                      <td className="py-2.5 text-[#0B1030]/65">{k}</td>
                      <td className="py-2.5 text-right text-[#070D2B]/80">{f.money(a)}</td>
                      <td className={cn('py-2.5 text-right font-semibold', b < 0 ? 'text-[#D13438]' : 'text-[#070D2B]')}>{f.money(b)}</td>
                      <td className={cn('py-2.5 text-right', b - a < 0 ? 'text-[#D13438]' : 'text-[#0B1030]/55')}>{b - a === 0 ? '—' : f.money(b - a)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Perspetiva */}
        <Card title={R.outlook(H)} className="mt-5">
          {inp.hasBalance && (
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              {[
                { h: 3, p: r3 },
                { h: 6, p: r6 },
              ].map(({ h, p }) => (
                <div key={h} className="rounded-2xl border border-[#0B1030]/[0.07] bg-[#FAFBFD] p-4">
                  <p className="text-[12px] font-medium text-[#0B1030]/50">
                    {R.rows.end} · {h} {t.f.months}
                  </p>
                  <p className={cn('mt-1 font-display text-[24px] font-bold tabular-nums tracking-[-0.02em]', last(p.delayed) < 0 ? 'text-[#D13438]' : 'text-[#070D2B]')}>{f.money(last(p.delayed))}</p>
                  <p className="text-[12px] text-[#0B1030]/45">
                    {f.money(last(p.base))} {t.insight.lowestBase}
                  </p>
                </div>
              ))}
            </div>
          )}
          <MonthlyChart r={r} hasBalance={inp.hasBalance} t={t.chart} money={f.money} axis={f.axis} month={(m) => f.month(m)} compact />
          {inp.hasBalance && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] text-[13.5px] tabular-nums">
                <caption className="mb-2 text-left text-[12px] text-[#0B1030]/50">{R.delayed}</caption>
                <thead>
                  <tr className="text-[12px] text-[#0B1030]/50">
                    {[R.month, R.opening, R.inflow, R.outflow, R.net, R.closing].map((h, i) => (
                      <th key={h} className={cn('pb-2 font-medium', i ? 'text-right' : 'text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0B1030]/[0.06]">
                  {r.delayed.months.map((m, i) => (
                    <tr key={i}>
                      <td className="py-2 capitalize text-[#0B1030]/65">{f.month(i)}</td>
                      <td className="py-2 text-right text-[#070D2B]/75">{f.money(m.opening)}</td>
                      <td className="py-2 text-right text-[#070D2B]/75">{f.money(m.inflow)}</td>
                      <td className="py-2 text-right text-[#070D2B]/75">{f.money(m.outflow)}</td>
                      <td className={cn('py-2 text-right', m.net < 0 ? 'text-[#D13438]' : 'text-[#070D2B]/75')}>{f.money(m.net)}</td>
                      <td className={cn('py-2 text-right font-semibold', m.closing < 0 ? 'text-[#D13438]' : 'text-[#070D2B]')}>{f.money(m.closing)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Indicadores */}
        <Card title={R.indicators} sub={R.indicatorsSub} className="mt-5">
          <motion.ul variants={group} {...inView} className="grid gap-3 sm:grid-cols-2">
            {r.kpis.delayed.map((k, i) => {
              const meta = R.kpi[k.id]
              const b = r.kpis.base[i]
              return (
                <motion.li key={k.id} variants={rise} className="rounded-2xl border border-[#0B1030]/[0.07] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13.5px] font-semibold text-[#070D2B]">{meta.name}</p>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#F2F4F9] px-2.5 py-1 text-[11.5px] font-medium text-[#0B1030]/70">
                      <span className="h-2 w-2 rounded-full" style={{ background: LIGHT[k.light], boxShadow: `0 0 8px ${LIGHT[k.light]}` }} />
                      {R.lights[k.light]}
                    </span>
                  </div>
                  <p className="mt-2 font-display text-[26px] font-bold tabular-nums tracking-[-0.02em] text-[#070D2B]">{kpiValue(k)}</p>
                  {k.value === null ? (
                    <p className="text-[12px] text-[#0B1030]/45">{R.naHint}</p>
                  ) : (
                    <p className="text-[12px] text-[#0B1030]/45">
                      {kpiValue(b)} {t.insight.lowestBase}
                    </p>
                  )}
                  <p className="mt-3 border-t border-[#0B1030]/[0.06] pt-3 text-[12px] leading-snug text-[#0B1030]/55">{meta.how}</p>
                  <p className="mt-1 text-[11.5px] leading-snug text-[#0B1030]/40">{meta.ref}</p>
                </motion.li>
              )
            })}
          </motion.ul>
          <p className="mt-4 flex gap-2 text-[12.5px] leading-snug text-[#0B1030]/50">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {R.notInExplore}
          </p>
        </Card>

        {/* Finer Advisor */}
        <div className="relative mt-5 overflow-hidden rounded-[24px] bg-[#070D2B] p-6 text-white sm:p-8">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#1E90FF,transparent)]" />
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-[#7CB8FF]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <h3 data-no-sweep className="font-display text-[22px] font-bold tracking-[-0.02em]">{R.advisor}</h3>
            <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/60">{R.advisorTag}</span>
          </div>
          <motion.ul variants={group} {...inView} className="mt-5 space-y-3">
            {notes.map((n) => (
              <motion.li key={n.pt} variants={rise} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-[14.5px] leading-relaxed text-white/80">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: n.tone === 'risk' ? '#FF6B6B' : n.tone === 'warn' ? '#F5B83D' : '#5CA8FF' }} />
                {n[lang]}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Pressupostos */}
        <Card title={R.assumptions} className="mt-5">
          <ul className="grid gap-x-8 gap-y-2.5 text-[13.5px] leading-snug text-[#0B1030]/60 sm:grid-cols-2">
            {R.assumptionsList.map((a) => (
              <li key={a} className="flex gap-2.5">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                {a}
              </li>
            ))}
          </ul>
        </Card>

        {/* Finer Pioneers */}
        <motion.div variants={rise} {...inView} className="no-print relative mt-10 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0A1440,#070D2B_60%)] p-8 text-center text-white sm:p-12">
          <span aria-hidden="true" className="absolute inset-x-10 top-0 h-[2px] bg-[linear-gradient(90deg,transparent,#0052FF,#5CA8FF,transparent)] shadow-[0_0_18px_rgba(30,144,255,0.8)]" />
          <h3 data-no-sweep className="mx-auto max-w-[640px] text-balance font-display text-[26px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[34px]">{R.pioneersTitle}</h3>
          <p className="mx-auto mt-3 max-w-[520px] text-[15px] leading-relaxed text-white/65">{R.pioneersSub}</p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="/pioneers/" onClick={() => track('pioneers_cta_clicked', { location: 'report' })} className="group inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-6 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_30px_-10px_rgba(0,82,255,0.95)] transition-transform hover:-translate-y-px">
              {R.pioneersCta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <button type="button" onClick={onAgain} className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/15 px-5 text-[14.5px] font-semibold text-white/85 transition-colors hover:border-white/40">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {R.again}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

function Card({ title, sub, className, children }: { title: string; sub?: string; className?: string; children: React.ReactNode }) {
  return (
    <motion.div variants={rise} {...inView} className={cn('rounded-[24px] border border-[#0B1030]/[0.07] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(7,13,43,0.35)] sm:p-7', className)}>
      <h3 data-no-sweep className="font-display text-[19px] font-bold tracking-[-0.02em] text-[#070D2B]">{title}</h3>
      {sub && <p className="mt-1 text-[13px] text-[#0B1030]/50">{sub}</p>}
      <div className="mt-4">{children}</div>
    </motion.div>
  )
}

function Notice({ children, tone }: { children: React.ReactNode; tone?: 'warn' }) {
  return (
    <p className={cn('flex gap-2.5 rounded-xl border px-4 py-3 text-[13px] leading-snug', tone === 'warn' ? 'border-[#E8A317]/30 bg-[#FFF8E6] text-[#7A5600]' : 'border-[#0052FF]/15 bg-[#F2F7FF] text-[#0B1030]/70')}>
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  )
}
