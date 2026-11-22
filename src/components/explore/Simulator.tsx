import { useEffect, useId, useMemo, useRef } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, Lock, RotateCcw } from 'lucide-react'
import { SAMPLE, simulate } from '@/lib/explore/monthly'
import type { Horizon, MonthlyInputs, Result, ScenarioKind } from '@/lib/explore/monthly'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { MonthlyChart } from './MonthlyChart'
import type { ExploreText, Lang } from './content'

const EASE = [0.22, 1, 0.36, 1] as const

// ---------- Formatação ----------

export type Fmt = {
  money: (v: number) => string
  axis: (v: number) => string
  num: (v: number) => string
  month: (m: number, lang?: Lang) => string
  monthLong: (m: number, lang?: Lang) => string
  symbol: string
}

export function useFmt(currency: string, lang: Lang): Fmt {
  return useMemo(() => {
    const loc = lang === 'pt' ? 'pt-PT' : 'en-GB'
    const nf = new Intl.NumberFormat(loc, { style: 'currency', currency, maximumFractionDigits: 0 })
    const cf = new Intl.NumberFormat(loc, { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 0 })
    const plain = new Intl.NumberFormat(loc, { maximumFractionDigits: 0 })
    const symbol = nf.formatToParts(0).find((p) => p.type === 'currency')?.value ?? currency
    const now = new Date()
    const at = (m: number) => new Date(now.getFullYear(), now.getMonth() + 1 + m, 1)
    const short = (l: Lang) => new Intl.DateTimeFormat(l === 'pt' ? 'pt-PT' : 'en-GB', { month: 'short' })
    const long = (l: Lang) => new Intl.DateTimeFormat(l === 'pt' ? 'pt-PT' : 'en-GB', { month: 'long', year: 'numeric' })
    return {
      money: (v) => nf.format(Math.round(v) || 0),
      axis: (v) => cf.format(Math.round(v) || 0),
      num: (v) => plain.format(Math.round(v) || 0),
      month: (m, l = lang) => short(l).format(at(m)).replace('.', ''),
      monthLong: (m, l = lang) => long(l).format(at(m)),
      symbol,
    }
  }, [currency, lang])
}

// ---------- Estado da simulação ----------

export type SimState = {
  scenario: ScenarioKind
  inputs: Record<ScenarioKind, MonthlyInputs>
  perMonth: Record<ScenarioKind, { receipts: boolean; payments: boolean }>
}

export const initialSim = (): SimState => ({
  scenario: 'treasury',
  inputs: { treasury: { ...SAMPLE.treasury, receipts: [...SAMPLE.treasury.receipts], payments: [...SAMPLE.treasury.payments] }, clients: { ...SAMPLE.clients, receipts: [...SAMPLE.clients.receipts], payments: [...SAMPLE.clients.payments] } },
  perMonth: { treasury: { receipts: false, payments: false }, clients: { receipts: true, payments: false } },
})

/** Total de recebimentos deslocados dentro do horizonte (para o calendário). */
export function movedTotal(inp: MonthlyInputs) {
  if (inp.delayDays <= 0) return 0
  return inp.receipts.slice(0, inp.horizon).reduce((a, b) => a + Math.max(0, b), 0) * (inp.delayShare / 100)
}

export type Insight = { title: string; tone: 'risk' | 'warn' | 'ok' }

export function insightOf(inp: MonthlyInputs, r: Result, t: ExploreText['insight'], f: Fmt): Insight {
  if (inp.hasBalance) {
    const firstNeg = r.delayed.months.findIndex((m) => m.closing < 0)
    if (firstNeg >= 0 && r.base.minClosing >= 0) return { title: t.negTitle(f.monthLong(firstNeg)), tone: 'risk' }
    if (r.maxGap > 0.5) return { title: t.gapTitle(f.money(r.maxGap), f.monthLong(r.maxGapMonth)), tone: firstNeg >= 0 ? 'risk' : 'warn' }
    return { title: t.noneTitle, tone: 'ok' }
  }
  let drop = 0
  let dm = 0
  r.base.months.forEach((m, i) => {
    const d = m.inflow - r.delayed.months[i].inflow
    if (d > drop) {
      drop = d
      dm = i
    }
  })
  if (drop > 0.5) return { title: t.calTitle(f.money(drop), f.monthLong(dm)), tone: 'warn' }
  return { title: t.noneTitle, tone: 'ok' }
}

// ---------- Componente ----------

type Props = {
  t: ExploreText
  lang: Lang
  sim: SimState
  setSim: (fn: (s: SimState) => SimState) => void
  currency: string
  onReady: () => void
  formOpen: boolean
  /** A primeira descoberta só aparece depois de o visitante deixar o email. */
  unlocked: boolean
  children?: React.ReactNode // formulário, quando aberto
}

export function Simulator({ t, lang, sim, setSim, currency, onReady, formOpen, unlocked, children }: Props) {
  const f = useFmt(currency, lang)
  const inp = sim.inputs[sim.scenario]
  const r = useMemo(() => simulate(inp), [inp])
  const insight = insightOf(inp, r, t.insight, f)
  const tied = (inp.receipts.slice(0, inp.horizon).reduce((x, y) => x + Math.max(0, y), 0) / inp.horizon / 30) * (inp.delayShare / 100) * inp.delayDays
  const touched = useRef(false)

  const update = (patch: Partial<MonthlyInputs>) => {
    if (!touched.current) {
      touched.current = true
      track('simulation_started', { scenario: sim.scenario }, { once: true })
    }
    setSim((s) => ({ ...s, inputs: { ...s.inputs, [s.scenario]: { ...s.inputs[s.scenario], ...patch } } }))
  }
  const setPer = (key: 'receipts' | 'payments', v: boolean) => setSim((s) => ({ ...s, perMonth: { ...s.perMonth, [s.scenario]: { ...s.perMonth[s.scenario], [key]: v } } }))
  const reset = () => setSim((s) => ({ ...s, inputs: { ...s.inputs, [s.scenario]: { ...initialSim().inputs[s.scenario] } }, perMonth: { ...s.perMonth, [s.scenario]: initialSim().perMonth[s.scenario] } }))

  const insightRef = useRef<HTMLDivElement>(null)
  const readyRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const els: [Element | null, () => void][] = [
      [insightRef.current, () => track('first_insight_viewed', { scenario: sim.scenario, horizon: inp.horizon }, { once: true })],
      [readyRef.current, () => track('simulation_completed', { scenario: sim.scenario, horizon: inp.horizon }, { once: true })],
    ]
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && els.find(([el]) => el === e.target)?.[1]()), { threshold: 0.5 })
    els.forEach(([el]) => el && io.observe(el))
    return () => io.disconnect()
  }, [sim.scenario, inp.horizon])

  const tone = { risk: 'text-[#D13438]', warn: 'text-[#070D2B]', ok: 'text-[#070D2B]' }[insight.tone]

  return (
    <div>
      {/* Cenários */}
      <LayoutGroup id="scenarios">
        <div role="tablist" aria-label={t.simEyebrow} className="grid grid-cols-2 gap-1 rounded-2xl bg-[#F2F4F9] p-1 sm:inline-grid sm:min-w-[520px]">
          {(['treasury', 'clients'] as ScenarioKind[]).map((k) => {
            const on = sim.scenario === k
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setSim((s) => ({ ...s, scenario: k }))}
                className="relative rounded-xl px-4 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {on && <motion.span layoutId="scenario-pill" transition={{ duration: 0.35, ease: EASE }} className="absolute inset-0 rounded-xl bg-white shadow-[0_6px_18px_-10px_rgba(7,13,43,0.45)]" />}
                <span className={cn('relative block text-[14px] font-semibold', on ? 'text-[#070D2B]' : 'text-[#0B1030]/60')}>{t.scenarios[k].name}</span>
                <span className="relative mt-0.5 hidden text-[12px] leading-snug text-[#0B1030]/50 sm:block">{t.scenarios[k].hint}</span>
              </button>
            )
          })}
        </div>
      </LayoutGroup>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
        {/* Valores */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={sim.scenario} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }} className="space-y-5 rounded-[22px] bg-[#F5F7FB] p-5 sm:p-6">
            {sim.scenario === 'treasury' ? (
              <>
                <MoneyField label={t.f.balance} value={inp.balance} onChange={(v) => update({ balance: v })} f={f} />
                <MonthsField label={t.f.receipts} values={inp.receipts} horizon={inp.horizon} per={sim.perMonth.treasury.receipts} setPer={(v) => setPer('receipts', v)} onChange={(v) => update({ receipts: v })} f={f} t={t} />
                <MonthsField label={t.f.payments} values={inp.payments} horizon={inp.horizon} per={sim.perMonth.treasury.payments} setPer={(v) => setPer('payments', v)} onChange={(v) => update({ payments: v })} f={f} t={t} />
                <Slider label={t.f.delayShare} value={inp.delayShare} onChange={(v) => update({ delayShare: v })} />
                <Segmented label={t.f.delayDays} options={[15, 30, 45, 60, 90]} value={inp.delayDays} onChange={(v) => update({ delayDays: v })} suffix={t.f.days} id="days-t" />
              </>
            ) : (
              <>
                <MonthsField label={t.f.toReceive} values={inp.receipts} horizon={inp.horizon} per onChange={(v) => update({ receipts: v })} f={f} t={t} />
                <Slider label={t.f.delayShareClients} value={inp.delayShare} onChange={(v) => update({ delayShare: v })} />
                <Segmented label={t.f.delayDays} options={[15, 30, 60]} value={inp.delayDays} onChange={(v) => update({ delayDays: v })} suffix={t.f.days} id="days-c" />
                <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-[#0B1030]/70">
                  <input type="checkbox" checked={inp.hasBalance} onChange={(e) => update({ hasBalance: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-[#0052FF]" />
                  {t.f.withBalance}
                </label>
                <AnimatePresence initial={false}>
                  {inp.hasBalance && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: EASE }} className="space-y-5 overflow-hidden">
                      <MoneyField label={t.f.balance} value={inp.balance} onChange={(v) => update({ balance: v })} f={f} />
                      <MonthsField label={t.f.payments} values={inp.payments} horizon={inp.horizon} per={sim.perMonth.clients.payments} setPer={(v) => setPer('payments', v)} onChange={(v) => update({ payments: v })} f={f} t={t} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
            <div className="flex items-end justify-between gap-3">
              <Segmented label={t.f.horizon} options={[3, 6]} value={inp.horizon} onChange={(v) => update({ horizon: v as Horizon })} suffix={t.f.months} id="hz" />
              <button type="button" onClick={reset} className="mb-1 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0B1030]/50 hover:text-[#070D2B]">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                {t.f.reset}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Resultado */}
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#070D2B]">{inp.hasBalance ? t.chart.title : t.chart.titleCal}</p>
          <div className="mt-3">
            <MonthlyChart r={r} hasBalance={inp.hasBalance} t={t.chart} money={f.money} axis={f.axis} month={(m) => f.month(m)} />
          </div>

          <div ref={insightRef} className="mt-8 border-t border-[#0B1030]/10 pt-6">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">{t.insight.eyebrow}</p>
            {!unlocked ? (
              <div className="mt-4 flex flex-col items-start gap-4 rounded-2xl border border-[#0B1030]/[0.08] bg-[#F7F9FE] p-5 sm:p-6">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#070D2B] shadow-[0_6px_16px_-10px_rgba(7,13,43,0.5)] ring-1 ring-[#0B1030]/[0.06]">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="max-w-[520px] text-[15px] leading-relaxed text-[#0B1030]/70">{t.insight.locked}</p>
                </div>
                {!formOpen && (
                  <button type="button" onClick={onReady} className="group ml-[50px] inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#070D2B] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#0B1338] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#070D2B] focus-visible:ring-offset-2">
                    {t.insight.unlock}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            ) : (
            <>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p key={insight.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3, ease: EASE }} className={cn('mt-3 max-w-[640px] text-balance font-display text-[22px] font-bold leading-[1.2] tracking-[-0.025em] sm:text-[26px]', tone)} aria-live="polite">
                {insight.title}
              </motion.p>
            </AnimatePresence>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {inp.hasBalance ? (
                <>
                  <Stat k={t.insight.lowest} v={f.money(r.delayed.minClosing)} sub={`${f.money(r.base.minClosing)} ${t.insight.lowestBase}`} neg={r.delayed.minClosing < 0} />
                  <Stat k={t.insight.pressure} v={r.pressure.length ? r.pressure.map((m) => f.month(m)).join(', ') : t.insight.none} />
                  <Stat k={t.insight.tied} v={f.money(tied)} />
                </>
              ) : (
                <>
                  <Stat k={t.insight.moved} v={f.money(movedTotal(inp))} />
                  <Stat k={t.insight.tied} v={f.money(tied)} />
                </>
              )}
            </dl>
            </>
            )}
          </div>
        </div>
      </div>

      {/* Convite para a análise completa: o céu Finer da homepage, com um cartão branco por cima */}
      <SkyStage refEl={readyRef}>
        <div className="mx-auto max-w-[760px] rounded-[24px] bg-white/[0.95] p-6 text-[#070D2B] shadow-[0_30px_70px_-35px_rgba(7,13,43,0.5)] ring-1 ring-white/70 backdrop-blur-sm sm:p-9">
          <div className="text-center">
            <h3 className="text-balance font-display text-[26px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[34px]">{t.ready.title}</h3>
            <p className="mx-auto mt-3 max-w-[520px] text-[15px] leading-relaxed text-[#0B1030]/60">{t.ready.sub}</p>
          </div>
          {!formOpen && (
            <div className="mt-7 flex flex-col items-center gap-2.5">
              <button
                type="button"
                onClick={onReady}
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#070D2B] px-7 text-[15px] font-semibold text-white shadow-[0_12px_30px_-14px_rgba(7,13,43,0.8)] transition-[transform,background-color] duration-300 hover:-translate-y-px hover:bg-[#0B1338] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#070D2B] focus-visible:ring-offset-2"
              >
                {t.ready.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
              <p className="text-[12px] text-[#0B1030]/45">{t.ready.keep}</p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {formOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
                <div className="pt-7">{children}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SkyStage>
    </div>
  )
}

/** Palco com o céu Finer: abre-se do centro com o scroll e as nuvens descem devagar (como na homepage). */
function SkyStage({ refEl, children }: { refEl: React.RefObject<HTMLDivElement | null>; children: React.ReactNode }) {
  const reduced = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({ target: refEl, offset: ['start end', 'start 0.4'] })
  const clipPath = useTransform(scrollYProgress, [0, 1], ['inset(0% 10% 0% 10% round 28px)', 'inset(0% 0% 0% 0% round 28px)'])
  const { scrollYProgress: pass } = useScroll({ target: refEl, offset: ['start end', 'end start'] })
  const skyY = useTransform(pass, [0, 1], ['-6%', '6%'])
  return (
    <motion.div ref={refEl} style={reduced ? undefined : { clipPath }} className="relative isolate mt-12 overflow-hidden rounded-[28px] px-4 py-10 sm:px-10 sm:py-16">
      <motion.div aria-hidden="true" className="absolute inset-x-0 -inset-y-[8%] -z-10" style={reduced ? undefined : { y: skyY }}>
        <img src="/images/finer-sky.webp" alt="" decoding="async" loading="lazy" draggable={false} className="h-full w-full select-none object-cover" />
      </motion.div>
      {children}
    </motion.div>
  )
}

// ---------- Campos ----------

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-[13px] font-medium text-[#070D2B]/80">
      {children}
    </label>
  )
}

function MoneyInput({ value, onChange, f, id, label, small }: { value: number; onChange: (v: number) => void; f: Fmt; id?: string; label: string; small?: boolean }) {
  return (
    <div className={cn('flex items-center rounded-xl border border-[#0B1030]/12 bg-white focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15', small ? 'h-9 px-2.5' : 'h-11 px-3.5')}>
      <span className={cn('shrink-0 text-[#0B1030]/40', small ? 'text-[12px]' : 'text-[14px]')}>{f.symbol}</span>
      <input
        id={id}
        aria-label={label}
        inputMode="numeric"
        value={value ? f.num(value) : ''}
        placeholder="0"
        onChange={(e) => onChange(Math.min(999_999_999, Number(e.target.value.replace(/\D/g, '')) || 0))}
        className={cn('w-full min-w-0 bg-transparent pl-2 tabular-nums text-[#070D2B] outline-none', small ? 'text-[12.5px]' : 'text-[15px] font-medium')}
      />
    </div>
  )
}

function MoneyField({ label, value, onChange, f }: { label: string; value: number; onChange: (v: number) => void; f: Fmt }) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <MoneyInput id={id} label={label} value={value} onChange={onChange} f={f} />
    </div>
  )
}

function MonthsField({ label, values, horizon, per, setPer, onChange, f, t }: { label: string; values: number[]; horizon: number; per: boolean; setPer?: (v: boolean) => void; onChange: (v: number[]) => void; f: Fmt; t: ExploreText }) {
  const avg = Math.round(values.slice(0, horizon).reduce((a, b) => a + b, 0) / horizon)
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label>{label}</Label>
        {setPer && (
          <button type="button" onClick={() => setPer(!per)} className="shrink-0 whitespace-nowrap text-[12px] font-medium text-accent hover:underline">
            {per ? t.f.sameEvery : t.f.perMonth}
          </button>
        )}
      </div>
      {per ? (
        <div className="grid grid-cols-3 gap-2">
          {values.slice(0, horizon).map((v, i) => (
            <div key={i}>
              <span className="mb-0.5 block text-[11px] capitalize text-[#0B1030]/45">{f.month(i)}</span>
              <MoneyInput small label={`${label} — ${f.month(i)}`} value={v} f={f} onChange={(nv) => onChange(values.map((x, j) => (j === i ? nv : x)))} />
            </div>
          ))}
        </div>
      ) : (
        <MoneyInput label={label} value={avg} f={f} onChange={(nv) => onChange(values.map(() => nv))} />
      )}
    </div>
  )
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const id = useId()
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span className="rounded-md bg-accent/[0.08] px-2 py-0.5 text-[13px] font-semibold tabular-nums text-accent">{value}%</span>
      </div>
      <input id={id} type="range" min={0} max={100} step={5} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#0052FF]" />
    </div>
  )
}

function Segmented({ label, options, value, onChange, suffix, id }: { label: string; options: number[]; value: number; onChange: (v: number) => void; suffix: string; id: string }) {
  return (
    <div className="space-y-1.5" role="radiogroup" aria-label={label}>
      <Label>{label}</Label>
      <LayoutGroup id={id}>
        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-[#EEF1F7] p-1">
          {options.map((o) => {
            const on = o === value
            return (
              <button key={o} type="button" role="radio" aria-checked={on} onClick={() => onChange(o)} className="relative rounded-lg px-3 py-1.5 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                {on && <motion.span layoutId={`${id}-pill`} transition={{ duration: 0.3, ease: EASE }} className="absolute inset-0 rounded-lg bg-white shadow-[0_4px_12px_-6px_rgba(7,13,43,0.4)]" />}
                <span className={cn('relative tabular-nums', on ? 'text-[#070D2B]' : 'text-[#0B1030]/55')}>
                  {o} {o === options[options.length - 1] || options.length <= 3 ? suffix : ''}
                </span>
              </button>
            )
          })}
        </div>
      </LayoutGroup>
    </div>
  )
}

function Stat({ k, v, sub, neg }: { k: string; v: string; sub?: string; neg?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] text-[#0B1030]/50">{k}</dt>
      <dd className={cn('mt-0.5 truncate font-display text-[18px] font-bold tabular-nums tracking-[-0.02em]', neg ? 'text-[#D13438]' : 'text-[#070D2B]')}>{v}</dd>
      {sub && <dd className="text-[11.5px] text-[#0B1030]/45">{sub}</dd>}
    </div>
  )
}
