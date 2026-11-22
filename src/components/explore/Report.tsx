import { useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowRight, Printer } from 'lucide-react'
import { deepen, simulate } from '@/lib/explore/monthly'
import type { Kpi, Light, MonthlyInputs, Result, ScenarioKind } from '@/lib/explore/monthly'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { insightOf, useFmt } from './Simulator'
import type { Fmt } from './Simulator'
import { TEXT } from './content'
import type { Lang } from './content'
import { REPORT } from './reportText'
import { buildCfo } from './cfo'
import type { ReportText } from './reportText'

/**
 * Análise completa, com a estrutura de uma análise de tesouraria de consultora:
 * sumário executivo → ponte de tesouraria → previsão direta e margem de segurança →
 * cenários → sensibilidade → indicadores → alavancas → pressupostos.
 * Layout editorial (título à esquerda, conteúdo à direita, linhas finas).
 */
const EASE = [0.22, 1, 0.36, 1] as const
const rise: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -10% 0px' } } as const
const LIGHT: Record<Light, string> = { green: '#18A957', amber: '#E8A317', red: '#E5484D', na: '#B8C0D0' }
const NEG = 'text-[#C62D33]'

type Props = { lang: Lang; inp: MonthlyInputs; scenario: ScenarioKind; company: string; currency: string; preview: boolean; onAgain: () => void }

export function Report({ lang, inp, scenario, company, currency, preview, onAgain }: Props) {
  const R = REPORT[lang]
  const f = useFmt(currency, lang)
  const r = useMemo(() => simulate(inp), [inp])
  const d = useMemo(() => deepen(inp), [inp])
  const H = inp.horizon
  const bal = inp.hasBalance
  const yours = d.scenarios[1].r
  const stress = d.scenarios[2].r
  const cfo = useMemo(() => buildCfo(inp, r, d, f, lang), [inp, r, d, f, lang])
  const T = TEXT[lang].insight
  const insight = insightOf(inp, r, T, f)
  const X = lang === 'pt'
    ? { analysis: 'Análise da situação', analysisSub: 'A leitura de um CFO sobre os números da simulação.', calc: 'Como calculámos', calcSub: 'Cada número da análise, com a conta feita com os seus valores.', recs: 'Recomendações', high: 'Prioridade alta', medium: 'Prioridade média', plan: 'Plano de ação', planSub: 'O que fazer, quem faz e como medir. Para decidir já esta semana.', cols: ['Quando', 'Ação', 'Responsável', 'Indicador', 'Meta'] }
    : { analysis: 'Situation analysis', analysisSub: 'A CFO’s reading of the simulation figures.', calc: 'How we calculated', calcSub: 'Every figure in the analysis, worked out with your values.', recs: 'Recommendations', high: 'High priority', medium: 'Medium priority', plan: 'Action plan', planSub: 'What to do, who does it and how to measure it. Ready to decide this week.', cols: ['When', 'Action', 'Owner', 'Indicator', 'Target'] }

  useEffect(() => {
    track('full_report_viewed', { scenario, horizon: H, preview })
  }, [scenario, H, preview])

  const dropOf = (x: Result) => {
    let v = 0
    let m = 0
    x.base.months.forEach((b, i) => {
      const g = b.inflow - x.delayed.months[i].inflow
      if (g > v) {
        v = g
        m = i
      }
    })
    return { v, m }
  }

  const findings: string[] = bal
    ? [
        r.delayed.minClosing < 0 ? R.findings.lowNeg(f.money(r.delayed.minClosing), f.monthLong(r.delayed.minMonth)) : R.findings.low(f.money(r.delayed.minClosing), f.monthLong(r.delayed.minMonth)),
        R.findings.tied(f.money(d.tied), d.dsoIncrease),
        stress.delayed.minClosing < r.delayed.minClosing ? R.findings.stress(f.money(stress.delayed.minClosing), f.monthLong(stress.delayed.minMonth)) : R.findings.stressOk(f.money(stress.delayed.minClosing)),
      ]
    : [R.findings.cal(f.money(dropOf(r).v), f.monthLong(dropOf(r).m)), R.findings.tied(f.money(d.tied), d.dsoIncrease), R.findings.noBalance]

  return (
    <section id="relatorio" aria-labelledby="rel-titulo" className="relative scroll-mt-20 bg-white px-5 pb-16 pt-14 text-navy sm:px-6 lg:pb-20 lg:pt-20">
      <style>{'@media print{body *{visibility:hidden!important}#relatorio,#relatorio *{visibility:visible!important}#relatorio{position:absolute;left:0;top:0;width:100%;padding:0!important}.no-print{display:none!important}}'}</style>
      <div className="mx-auto max-w-[1120px]">
        {/* Cabeçalho */}
        <motion.header variants={group} {...inView} className="flex flex-col gap-6 border-b border-[#0B1030]/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <motion.p variants={rise} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">{R.eyebrow}</motion.p>
            <h2 id="rel-titulo" className="mt-4 text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[48px]">{R.title(company)}</h2>
            <motion.p variants={rise} className="mt-3 text-[14px] text-[#0B1030]/50">
              {f.monthLong(0).replace(/^./, (c) => c.toUpperCase())} — {f.monthLong(H - 1)}
            </motion.p>
          </div>
          <motion.div variants={rise} className="no-print flex flex-col items-start gap-2 sm:items-end">
            <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#0B1030]/15 px-4 text-[14px] font-semibold text-[#070D2B] transition-colors hover:border-[#070D2B]">
              <Printer className="h-4 w-4" aria-hidden="true" />
              {R.print}
            </button>
            <p className="max-w-[300px] text-[12px] leading-snug text-[#0B1030]/45 sm:text-right">{preview ? `${R.previewNote} ` : ''}{R.emailNote}</p>
          </motion.div>
        </motion.header>

        {/* 01 · Sumário executivo */}
        <Section n="01" title={R.s1}>
          <motion.p variants={rise} {...inView} className={cn('mb-6 inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold', cfo.level === 'risk' ? 'bg-[#FDECEC] text-[#9F2228]' : cfo.level === 'watch' ? 'bg-[#FFF5E0] text-[#7A5600]' : 'bg-[#E9F7EF] text-[#11703B]')}>
            <span className="h-2 w-2 rounded-full" style={{ background: cfo.level === 'risk' ? '#E5484D' : cfo.level === 'watch' ? '#E8A317' : '#18A957' }} />
            {cfo.diagnosis}
          </motion.p>
          {/* A primeira descoberta do simulador, agora desbloqueada */}
          <motion.div variants={rise} {...inView} className="mb-9">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">{T.eyebrow}</p>
            <p className={cn('mt-3 max-w-[760px] text-balance font-display text-[26px] font-bold leading-[1.15] tracking-[-0.03em] sm:text-[34px]', insight.tone === 'risk' ? NEG : 'text-[#070D2B]')}>{insight.title}</p>
            {bal && (
              <p className="mt-3 text-[15px] text-[#0B1030]/60">
                {T.pressure}: <strong className="font-semibold text-[#070D2B]">{r.pressure.length ? r.pressure.map((m) => f.monthLong(m)).join(', ') : T.none}</strong>
              </p>
            )}
          </motion.div>
          <motion.ol variants={group} {...inView} className="space-y-4">
            {findings.map((x, i) => (
              <motion.li key={x} variants={rise} className="flex gap-4 text-[18px] leading-[1.45] tracking-[-0.01em] text-[#070D2B] sm:text-[20px]">
                <span className="mt-[3px] font-display text-[13px] font-bold tabular-nums text-accent-deep">{i + 1}</span>
                {x}
              </motion.li>
            ))}
          </motion.ol>
          <motion.dl variants={group} {...inView} className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-[#0B1030]/[0.08] sm:grid-cols-3">
            {bal ? (
              <>
                <Fig k={R.figLow} v={f.money(r.delayed.minClosing)} sub={R.figLowSub(f.monthLong(r.delayed.minMonth))} neg={r.delayed.minClosing < 0} />
                <Fig k={R.figTied} v={f.money(d.tied)} sub={R.figTiedSub(d.dsoIncrease)} />
                <Fig k={R.figNeed} v={d.fundingNeed > 0 ? f.money(d.fundingNeed) : R.figNeedNone} sub={R.figNeedSub} neg={d.fundingNeed > 0} />
              </>
            ) : (
              <>
                <Fig k={R.figMoved} v={f.money(r.base.totalIn * (inp.delayShare / 100) * (inp.delayDays > 0 ? 1 : 0))} />
                <Fig k={R.figTied} v={f.money(d.tied)} sub={R.figTiedSub(d.dsoIncrease)} />
                <Fig k={R.figPushed} v={f.money(r.delayed.pushedOut)} />
              </>
            )}
          </motion.dl>
        </Section>

        {/* 02 · Análise da situação */}
        <Section n="02" title={X.analysis} sub={X.analysisSub}>
          <motion.div variants={group} {...inView} className="max-w-[720px] space-y-5">
            {cfo.analysis.map((p) => {
              const [head, ...rest] = p.split('. ')
              return (
                <motion.p key={p} variants={rise} className="text-[16px] leading-[1.7] text-[#0B1030]/70">
                  <strong className="font-semibold text-[#070D2B]">{head}.</strong> {rest.join('. ')}
                </motion.p>
              )
            })}
          </motion.div>
        </Section>

        {/* 03 · Ponte de tesouraria */}
        <Section n="03" title={R.s2} sub={R.s2Sub}>
          <Waterfall R={R} f={f} steps={bal ? [
            { k: R.bridge.opening, v: d.bridge.opening, total: true },
            { k: R.bridge.inflow, v: d.bridge.inflow },
            { k: R.bridge.delay, v: d.bridge.delayEffect, risk: true },
            { k: R.bridge.outflow, v: d.bridge.outflow },
            { k: R.bridge.closing, v: d.bridge.closing, total: true },
          ] : [
            { k: R.bridge.receipts, v: r.base.totalIn, total: true },
            { k: R.bridge.late, v: -r.delayed.pushedOut, risk: true },
            { k: R.bridge.received, v: r.delayed.totalIn, total: true },
          ]} />
        </Section>

        {/* 03 · Previsão direta */}
        <Section n="04" title={R.s3} sub={bal ? R.s3Sub(f.money(d.buffer)) : undefined}>
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[620px] text-[13.5px] tabular-nums">
              <thead>
                <tr className="text-[12px] text-[#0B1030]/45">
                  <th className="pb-3 text-left font-medium" />
                  {r.delayed.months.map((_, i) => (
                    <th key={i} className="pb-3 text-right font-medium capitalize">{f.month(i)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(bal
                  ? [
                      [R.rows.opening, yours.delayed.months.map((m) => m.opening), ''],
                      [R.rows.inflow, yours.delayed.months.map((m) => m.inflow), ''],
                      [R.rows.outflow, yours.delayed.months.map((m) => -m.outflow), ''],
                      [R.rows.net, yours.delayed.months.map((m) => m.net), 'line'],
                      [R.rows.closing, yours.delayed.months.map((m) => m.closing), 'strong'],
                      [R.rows.buffer, yours.delayed.months.map(() => d.buffer), 'muted'],
                      [R.rows.headroom, d.headroom, 'strong'],
                    ]
                  : [
                      [R.rows.planned, r.base.months.map((m) => m.inflow), ''],
                      [R.rows.delayed, r.delayed.months.map((m) => m.inflow), 'strong'],
                      [R.rows.diff, r.delayed.months.map((m, i) => m.inflow - r.base.months[i].inflow), 'line'],
                    ]
                ).map(([k, vals, kind]) => (
                  <tr key={k as string} className={cn(kind === 'line' || kind === 'strong' ? 'border-t border-[#0B1030]/10' : '')}>
                    <td className={cn('py-2 pr-4 text-left', kind === 'strong' ? 'font-semibold text-[#070D2B]' : 'text-[#0B1030]/60')}>{k as string}</td>
                    {(vals as number[]).map((v, i) => (
                      <td key={i} className={cn('py-2 text-right', v < 0 && kind !== '' ? NEG : kind === 'muted' ? 'text-[#0B1030]/40' : kind === 'strong' ? 'font-semibold text-[#070D2B]' : 'text-[#070D2B]/75')}>{f.money(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 04 · Cenários */}
        <Section n="05" title={R.s4} sub={R.s4Sub}>
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[520px] text-[14px] tabular-nums">
              <thead>
                <tr>
                  <th className="pb-3" />
                  {d.scenarios.map((s) => (
                    <th key={s.id} className={cn('pb-3 text-right align-bottom', s.id === 'yours' && 'text-accent-deep')}>
                      <span className="block font-display text-[16px] font-bold tracking-[-0.01em]">{R.sc[s.id]}</span>
                      <span className="block text-[11.5px] font-normal text-[#0B1030]/45">{R.sc.params(s.share, s.days)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0B1030]/[0.08] border-t border-[#0B1030]/10">
                {(bal
                  ? [
                      [R.sc.low, (x: Result) => f.money(x.delayed.minClosing), (x: Result) => x.delayed.minClosing < 0],
                      [R.sc.lowMonth, (x: Result) => f.month(x.delayed.minMonth), () => false],
                      [R.sc.end, (x: Result) => f.money(x.delayed.months[H - 1].closing), (x: Result) => x.delayed.months[H - 1].closing < 0],
                      [R.sc.need, (x: Result) => { const n = Math.max(0, d.buffer - x.delayed.minClosing); return n > 0 ? f.money(n) : '—' }, (x: Result) => d.buffer - x.delayed.minClosing > 0],
                    ]
                  : [
                      [R.sc.drop, (x: Result) => f.money(dropOf(x).v), () => false],
                      [R.sc.pushed, (x: Result) => f.money(x.delayed.pushedOut), () => false],
                    ]
                ).map(([k, val, neg]) => (
                  <tr key={k as string}>
                    <td className="py-3 pr-4 text-[#0B1030]/60">{k as string}</td>
                    {d.scenarios.map((s) => (
                      <td key={s.id} className={cn('py-3 text-right capitalize', (neg as (x: Result) => boolean)(s.r) ? `font-semibold ${NEG}` : s.id === 'yours' ? 'font-semibold text-[#070D2B]' : 'text-[#070D2B]/75')}>
                        {(val as (x: Result) => string)(s.r)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="py-3 pr-4 text-[#0B1030]/60">{R.sc.tied}</td>
                  {d.scenarios.map((s) => (
                    <td key={s.id} className={cn('py-3 text-right', s.id === 'yours' ? 'font-semibold text-[#070D2B]' : 'text-[#070D2B]/75')}>
                      {f.money(((inp.receipts.slice(0, H).reduce((a, b) => a + b, 0) / H) / 30) * (s.share / 100) * s.days)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* 05 · Sensibilidade */}
        <Section n="06" title={R.s5} sub={bal ? R.s5Sub : R.s5SubCal}>
          <Heatmap R={R} f={f} d={d} inp={inp} />
        </Section>

        {/* 06 · Indicadores */}
        <Section n="07" title={R.s6} sub={R.s6Sub}>
          <motion.ul variants={group} {...inView} className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-[#0B1030]/[0.08] sm:grid-cols-2 lg:grid-cols-4">
            {r.kpis.delayed.map((k) => (
              <motion.li key={k.id} variants={rise} className="bg-white p-5">
                <p className="text-[13px] font-medium text-[#0B1030]/60">{R.kpi[k.id].name}</p>
                <p className="mt-2 font-display text-[26px] font-bold tabular-nums tracking-[-0.02em] text-[#070D2B]">{kpiValue(k, R, lang)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#0B1030]/55">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: LIGHT[k.light] }} />
                  {R.lights[k.light]}
                </p>
                <p className="mt-4 text-[11.5px] leading-snug text-[#0B1030]/40">{R.kpi[k.id].how}</p>
              </motion.li>
            ))}
          </motion.ul>
        </Section>

        {/* 09 · Como calculámos */}
        <Section n="08" title={X.calc} sub={X.calcSub}>
          <motion.dl variants={group} {...inView} className="divide-y divide-[#0B1030]/[0.08] border-y border-[#0B1030]/[0.08]">
            {cfo.calc.map((c) => (
              <motion.div key={c.label} variants={rise} className="grid gap-1 py-3.5 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
                <dt className="text-[13.5px] text-[#0B1030]/55">{c.label}</dt>
                <dd className="font-mono text-[13.5px] tabular-nums text-[#070D2B]">{c.formula}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </Section>

        {/* 10 · Recomendações */}
        <Section n="09" title={X.recs} sub={R.s7Tag}>
          <motion.ol variants={group} {...inView} className="space-y-px overflow-hidden rounded-2xl bg-[#0B1030]/[0.08]">
            {cfo.recs.map((rc, i) => (
              <motion.li key={rc.title} variants={rise} className="bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display text-[13px] font-bold tabular-nums text-accent-deep">{String(i + 1).padStart(2, '0')}</span>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]', rc.priority === 'high' ? 'bg-[#070D2B] text-white' : 'bg-[#EEF1F6] text-[#0B1030]/65')}>{rc.priority === 'high' ? X.high : X.medium}</span>
                </div>
                <h4 className="mt-3 font-display text-[19px] font-bold tracking-[-0.02em] text-[#070D2B]">{rc.title}</h4>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#0B1030]/60">{rc.why}</p>
                <p className="mt-3 border-l-2 border-accent-deep pl-3 text-[14px] font-medium leading-relaxed text-[#070D2B]">{rc.impact}</p>
              </motion.li>
            ))}
          </motion.ol>
        </Section>

        {/* 11 · Plano de ação */}
        <Section n="10" title={X.plan} sub={X.planSub}>
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[640px] text-[13.5px]">
              <thead>
                <tr className="text-left text-[12px] text-[#0B1030]/45">
                  {X.cols.map((c) => (
                    <th key={c} className="pb-3 pr-4 font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0B1030]/[0.08] border-t border-[#0B1030]/10 align-top">
                {cfo.plan.map((p) => (
                  <tr key={p.action}>
                    <td className="whitespace-nowrap py-3.5 pr-4 font-semibold text-accent-deep">{p.when}</td>
                    <td className="py-3.5 pr-4 text-[#070D2B]">{p.action}</td>
                    <td className="py-3.5 pr-4 text-[#0B1030]/60">{p.owner}</td>
                    <td className="py-3.5 pr-4 text-[#0B1030]/60">{p.kpi}</td>
                    <td className="whitespace-nowrap py-3.5 font-semibold tabular-nums text-[#070D2B]">{p.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 12 · Pressupostos */}
        <Section n="11" title={R.s8}>
          <ul className="grid gap-x-10 gap-y-2.5 text-[13.5px] leading-snug text-[#0B1030]/55 sm:grid-cols-2">
            {R.assumptions.map((a) => (
              <li key={a} className="flex gap-3">
                <span className="mt-[8px] h-px w-3 shrink-0 bg-[#0B1030]/30" />
                {a}
              </li>
            ))}
          </ul>
        </Section>

        {/* Finer Pioneers: fotografia da identidade (estrada com luz) em vez de um bloco azul */}
        <motion.div variants={group} {...inView} className="no-print relative mt-12 overflow-hidden rounded-[28px] text-white">
          <img src="/images/para-quem-estrada.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 -z-0 h-full w-full object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,10,32,0.94)_0%,rgba(5,10,32,0.82)_45%,rgba(5,10,32,0.35)_100%)]" />
          <div className="relative max-w-[620px] px-6 py-14 sm:px-12 sm:py-16">
            <h3 className="text-balance font-display text-[28px] font-bold leading-[1.08] tracking-[-0.03em] sm:text-[38px]">{R.pioneersTitle}</h3>
            <motion.p variants={rise} className="mt-4 max-w-[520px] text-[16px] leading-[1.65] text-white/75">{R.pioneersSub}</motion.p>
            <motion.div variants={rise} className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a href="/pioneers/" onClick={() => track('pioneers_cta_clicked', { location: 'report' })} className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-[#070D2B] shadow-[0_14px_40px_-16px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-px">
                {R.pioneersCta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
              <button type="button" onClick={onAgain} className="text-[14px] font-semibold text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white">
                {R.again}
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function kpiValue(k: Kpi, R: ReportText, lang: Lang) {
  const loc = lang === 'pt' ? 'pt-PT' : 'en-GB'
  if (k.value === null) return R.na
  if (k.id === 'days') return `${Math.round(k.value)} ${lang === 'pt' ? 'dias' : 'days'}`
  if (k.id === 'cover') return `${k.value.toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}×`
  return `${(k.value * 100).toLocaleString(loc, { maximumFractionDigits: 1 })}%`
}

function Section({ n, title, sub, children }: { n: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <motion.div variants={group} {...inView} className="grid grid-cols-[minmax(0,1fr)] gap-6 border-b border-[#0B1030]/10 py-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12 lg:py-12">
      <div>
        <motion.p variants={rise} className="font-display text-[13px] font-bold tabular-nums text-accent-deep">{n}</motion.p>
        <h3 className="mt-2 font-display text-[24px] font-bold leading-[1.12] tracking-[-0.025em] text-[#070D2B] sm:text-[28px]">{title}</h3>
        {sub && <motion.p variants={rise} className="mt-3 max-w-[300px] text-[13.5px] leading-relaxed text-[#0B1030]/50">{sub}</motion.p>}
      </div>
      <motion.div variants={rise} className="min-w-0">{children}</motion.div>
    </motion.div>
  )
}

function Fig({ k, v, sub, neg }: { k: string; v: string; sub?: string; neg?: boolean }) {
  return (
    <motion.div variants={rise} className="bg-white p-5 sm:p-6">
      <dt className="text-[12.5px] text-[#0B1030]/55">{k}</dt>
      <dd className={cn('mt-2 font-display text-[28px] font-bold tabular-nums tracking-[-0.025em] sm:text-[32px]', neg ? NEG : 'text-[#070D2B]')}>{v}</dd>
      {sub && <dd className="mt-1 text-[12px] leading-snug text-[#0B1030]/45">{sub}</dd>}
    </motion.div>
  )
}

type Step = { k: string; v: number; total?: boolean; risk?: boolean }

function Waterfall({ steps, f }: { steps: Step[]; f: Fmt; R: ReportText }) {
  let run = 0
  const bars = steps.map((s) => {
    const from = s.total ? 0 : run
    const to = s.total ? s.v : run + s.v
    run = to
    return { ...s, lo: Math.min(from, to), hi: Math.max(from, to) }
  })
  const max = Math.max(1, ...bars.map((b) => b.hi))
  const min = Math.min(0, ...bars.map((b) => b.lo))
  const H = 220
  const y = (v: number) => ((max - v) / (max - min)) * H
  return (
    <div>
      <div className="relative" style={{ height: H + 28 }}>
        {min < 0 && <span className="absolute inset-x-0 border-t border-dashed border-[#0B1030]/25" style={{ top: y(0) + 24 }} />}
        <div className="absolute inset-x-0 bottom-0 top-6 grid gap-3 sm:gap-6" style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0,1fr))` }}>
          {bars.map((b, i) => (
            <div key={b.k} className="relative">
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                whileInView={{ opacity: 1, scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.12 }}
                className={cn('absolute inset-x-0 origin-bottom rounded-[6px]', b.total ? 'bg-[#070D2B]' : b.risk ? 'bg-[#E5484D]' : b.v >= 0 ? 'bg-accent' : 'bg-[#AFC3EA]')}
                style={{ top: y(b.hi), height: Math.max(2, y(b.lo) - y(b.hi)) }}
              />
              <span className={cn('absolute inset-x-0 -translate-y-full pb-1.5 text-center text-[12px] font-semibold tabular-nums sm:text-[13px]', b.risk || b.v < 0 && b.total ? 'text-[#C62D33]' : 'text-[#070D2B]')} style={{ top: y(b.hi) }}>
                {b.total ? f.money(b.v) : `${b.v >= 0 ? '+' : '−'}${f.money(Math.abs(b.v))}`}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:gap-6" style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0,1fr))` }}>
        {bars.map((b) => (
          <p key={b.k} className="text-center text-[11.5px] leading-snug text-[#0B1030]/55 sm:text-[12.5px]">{b.k}</p>
        ))}
      </div>
    </div>
  )
}

function Heatmap({ R, f, d, inp }: { R: ReportText; f: Fmt; d: ReturnType<typeof deepen>; inp: MonthlyInputs }) {
  const all = d.sensitivity.cells.flat()
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const tone = (v: number) => {
    if (v < 0) {
      const t = lo < 0 ? v / lo : 0
      return { background: `rgba(229,72,77,${0.08 + t * 0.5})`, color: t > 0.55 ? '#fff' : '#8E1F24' }
    }
    const t = hi > 0 ? v / hi : 0
    return { background: `rgba(10,64,200,${0.05 + t * 0.55})`, color: t > 0.55 ? '#fff' : '#070D2B' }
  }
  const near = (arr: number[], v: number) => arr.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a))
  const cs = near(d.sensitivity.shares, inp.delayShare)
  const cd = near(d.sensitivity.days, inp.delayDays)
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[460px] border-separate border-spacing-1.5 text-[13px] tabular-nums">
        <thead>
          <tr>
            <th className="pb-1 text-left text-[11.5px] font-medium text-[#0B1030]/45">{R.share} ↓ · {R.days} →</th>
            {d.sensitivity.days.map((x) => (
              <th key={x} className="pb-1 text-center text-[12px] font-semibold text-[#070D2B]">{x}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {d.sensitivity.shares.map((s, i) => (
            <tr key={s}>
              <th className="pr-2 text-left text-[12px] font-semibold text-[#070D2B]">{s}%</th>
              {d.sensitivity.days.map((x, j) => {
                const v = d.sensitivity.cells[i][j]
                const cur = s === cs && x === cd
                return (
                  <motion.td
                    key={x}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: (i + j) * 0.05 }}
                    className={cn('rounded-lg px-2 py-3 text-center font-semibold', cur && 'ring-2 ring-[#070D2B] ring-offset-1')}
                    style={tone(v)}
                  >
                    {f.axis(v)}
                  </motion.td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
