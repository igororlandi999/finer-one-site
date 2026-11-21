import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Lock, Plus, RotateCcw, Sparkles, X } from 'lucide-react'
import { ConsentCheckbox, Field, Honeypot, SelectInput, TextInput } from '@/components/forms/fields'
import { buttonClasses } from '@/components/ui/Button'
import { isValidEmail, submitForm } from '@/lib/forms'
import { cn } from '@/lib/utils'
import {
  HORIZON,
  NO_ADJUST,
  addDays,
  advise,
  compare,
  emptyInputs,
  iso,
  sampleInputs,
  today,
} from '@/lib/explore/model'
import type { Adjust, Comparison, Flow, Inputs, Invoice, ScenarioKind } from '@/lib/explore/model'
import { CashflowChart } from './CashflowChart'
import { LightArcs } from './LightArcs'
import { COUNTRIES, sampleLabel } from './copy'
import type { ExploreCopy, Lang } from './copy'

export type Phase = 'intro' | 'lead' | 'sim'
export type Mode = 'example' | 'own'
export type Preset = { key: number; scenario: ScenarioKind; adjust: Partial<Adjust> }

const EASE = [0.22, 1, 0.36, 1] as const
const SCENARIOS: ScenarioKind[] = ['treasury', 'clients', 'order']

type Lead = { company: string; country: string; sector: string; size: string; name: string; email: string; phone: string; role: string }
const EMPTY_LEAD: Lead = { company: '', country: 'PT', sector: '', size: '', name: '', email: '', phone: '', role: '' }
const STEP_FIELDS: (keyof Lead)[][] = [
  ['company', 'country', 'sector', 'size'],
  ['name', 'email', 'phone', 'role'],
]

function newId() {
  try {
    return crypto.randomUUID()
  } catch {
    return 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  }
}

function localized(inp: Inputs, lang: Lang): Inputs {
  const map = <T extends { label: string }>(xs: T[]) => xs.map((x) => ({ ...x, label: sampleLabel(x.label, lang) }))
  return { ...inp, receipts: map(inp.receipts), payments: map(inp.payments), invoices: map(inp.invoices) }
}

/** Formatação de moeda e datas pelo país escolhido (quando a língua coincide). */
function useFormat(countryCode: string, lang: Lang) {
  return useMemo(() => {
    const c = COUNTRIES.find((x) => x.code === countryCode) ?? COUNTRIES[0]
    const fallback = lang === 'pt' ? 'pt-PT' : 'en-IE'
    const moneyLocale = c.locale || fallback
    const dateLocale = c.locale && c.locale.startsWith(lang) ? c.locale : lang === 'pt' ? 'pt-PT' : 'en-GB'
    const nf = new Intl.NumberFormat(moneyLocale, { style: 'currency', currency: c.currency, maximumFractionDigits: 0 })
    const df = new Intl.DateTimeFormat(dateLocale, { day: 'numeric', month: 'short' })
    const dl = new Intl.DateTimeFormat(dateLocale, { day: 'numeric', month: 'long' })
    const base = today()
    const money = (n: number) => nf.format(Math.round(n) || 0)
    const cf = new Intl.NumberFormat(moneyLocale, { style: 'currency', currency: c.currency, notation: 'compact', maximumFractionDigits: 0 })
    const axisMoney = (n: number) => cf.format(Math.round(n) || 0)
    return {
      currency: c.currency,
      money,
      axisMoney,
      shortDate: (d: number) => df.format(addDays(base, d)),
      longDate: (d: number) => dl.format(addDays(base, d)),
    }
  }, [countryCode, lang])
}

export function Workspace({
  t,
  lang,
  phase,
  setPhase,
  mode,
  setMode,
  preset,
}: {
  t: ExploreCopy
  lang: Lang
  phase: Phase
  setPhase: (p: Phase) => void
  mode: Mode
  setMode: (m: Mode) => void
  preset?: Preset
}) {
  const [lead, setLead] = useState<Lead>(EMPTY_LEAD)
  const [leadId] = useState(newId)
  const [leadNote, setLeadNote] = useState<'saved' | 'preview' | null>(null)
  const [scenario, setScenario] = useState<ScenarioKind>('treasury')
  const [inputs, setInputs] = useState<Inputs>(() => localized(sampleInputs(), lang))
  const [adjust, setAdjust] = useState<Adjust>(NO_ADJUST)
  const [applied, setApplied] = useState<string[]>([])

  // A pergunta escolhida na abertura define o cenário e o ajuste do simulado.
  useEffect(() => {
    if (!preset) return
    setScenario(preset.scenario)
    setAdjust({ ...NO_ADJUST, ...preset.adjust, itemShift: { ...(preset.adjust.itemShift ?? {}) } })
    setApplied([])
  }, [preset])

  const country = mode === 'own' ? lead.country : lang === 'pt' ? 'PT' : 'OTHER'
  const fmt = useFormat(country, lang)
  const fmtPt = useFormat(country, 'pt')
  const fmtEn = useFormat(country, 'en')

  // O cálculo corre sobre valores "adiados" para a escrita continuar fluida.
  const dInputs = useDeferredValue(inputs)
  const dAdjust = useDeferredValue(adjust)
  const stale = dInputs !== inputs || dAdjust !== adjust
  const cmp = useMemo(() => compare(scenario, dInputs, dAdjust), [scenario, dInputs, dAdjust])
  const reading = useMemo(
    () =>
      advise(scenario, dInputs, dAdjust, cmp, {
        pt: { money: fmtPt.money, date: fmtPt.longDate },
        en: { money: fmtEn.money, date: fmtEn.longDate },
      }),
    [scenario, dInputs, dAdjust, cmp, fmtPt, fmtEn],
  )

  const hasData = (inputs.balance || 0) > 0 || [...inputs.receipts, ...inputs.payments, ...inputs.invoices].some((x) => x.amount > 0) || inputs.order.cost > 0

  const changeScenario = (k: ScenarioKind) => {
    setScenario(k)
    setAdjust(NO_ADJUST)
    setApplied([])
  }
  const resetAdjust = () => {
    setAdjust(NO_ADJUST)
    setApplied([])
  }
  const applyRec = (key: string, a: Partial<Adjust>) => {
    setAdjust((cur) => ({
      ...cur,
      ...a,
      itemShift: { ...cur.itemShift, ...Object.fromEntries(Object.entries(a.itemShift ?? {}).map(([k, v]) => [k, (cur.itemShift[k] ?? 0) + v])) },
    }))
    setApplied((x) => [...x, key])
    document.getElementById('explore-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: EASE }}>
            <Intro t={t} onStart={() => setPhase('lead')} onExample={() => { setMode('example'); setPhase('sim') }} />
          </motion.div>
        )}
        {phase === 'lead' && (
          <motion.div key="lead" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: EASE }}>
            <LeadForm
              t={t}
              lang={lang}
              lead={lead}
              setLead={setLead}
              leadId={leadId}
              scenario={scenario}
              onDone={(preview) => {
                setLeadNote(preview ? 'preview' : 'saved')
                setMode('own')
                setPhase('sim')
              }}
            />
          </motion.div>
        )}
        {phase === 'sim' && (
          <motion.div key="sim" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="space-y-6">
            {/* Faixa de contexto: exemplo ou dados guardados */}
            {mode === 'example' ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-accent/20 bg-[#F2F6FF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[14.5px] font-medium text-[#070D2B]">{t.exampleBanner}</p>
                <button type="button" onClick={() => setPhase('lead')} className={buttonClasses({ size: 'sm', className: 'shrink-0 font-semibold' })}>
                  {t.useMine}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {leadNote && (
                  <p role="status" className={cn('flex items-start gap-2 rounded-2xl px-5 py-3.5 text-[14px] font-medium', leadNote === 'saved' ? 'bg-[#EAF7EE] text-[#14532D]' : 'bg-[#FFF6E5] text-[#7A4B00]')}>
                    {leadNote === 'saved' ? <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                    {leadNote === 'saved' ? t.leadSaved(lead.company) : t.previewSaved}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px] text-[#0B1030]/65">
                  <span>{t.startValues}</span>
                  <button type="button" className="font-semibold text-accent-deep underline underline-offset-4" onClick={() => { setInputs(emptyInputs()); resetAdjust() }}>
                    {t.clearValues}
                  </button>
                  <button type="button" className="font-semibold text-accent-deep underline underline-offset-4" onClick={() => { setInputs(localized(sampleInputs(), lang)); resetAdjust() }}>
                    {t.restoreExample}
                  </button>
                </div>
              </div>
            )}

            <ScenarioTabs t={t} value={scenario} onChange={changeScenario} />

            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start">
              {/* Resultados primeiro no telemóvel; à direita no computador */}
              <div id="explore-results" className="min-w-0 scroll-mt-28 lg:order-2">
                <Results t={t} scenario={scenario} cmp={cmp} fmt={fmt} hasData={hasData} stale={stale} rate={dInputs.rate} />
              </div>
              <div className="min-w-0 lg:order-1">
                <InputsPanel t={t} scenario={scenario} inputs={inputs} setInputs={setInputs} adjust={adjust} setAdjust={setAdjust} onReset={resetAdjust} currency={fmt.currency} fmt={fmt} />
              </div>
            </div>

            {hasData && (
              <>
                <Advisor t={t} lang={lang} reading={reading} applied={applied} onApply={applyRec} />
                {mode === 'own' && <SaveSimulation t={t} lead={lead} leadId={leadId} scenario={scenario} inputs={dInputs} adjust={dAdjust} cmp={cmp} fmt={fmt} />}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------------- Entrada ---------------- */

function Intro({ t, onStart, onExample }: { t: ExploreCopy; onStart: () => void; onExample: () => void }) {
  return (
    <div className="grid gap-6 rounded-[28px] border border-[#0B1030]/[0.08] bg-white p-6 shadow-[0_40px_80px_-60px_rgba(7,13,43,0.5)] sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
      <ol className="grid gap-4 sm:grid-cols-3">
        {t.steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2F6FF] font-display text-[14px] font-bold text-accent-deep">{i + 1}</span>
            <span className="text-[15px] font-semibold text-[#070D2B]">{s}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onStart} className={buttonClasses({ size: 'lg', className: 'font-semibold' })}>
          {t.start}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={onExample} className={buttonClasses({ variant: 'outline', size: 'lg', className: 'border-[#0B1030]/15 bg-white text-[#070D2B] hover:bg-[#F7F9FE]' })}>
          {t.example}
        </button>
      </div>
    </div>
  )
}

/* ---------------- Formulário (2 passos) ---------------- */

function LeadForm({
  t,
  lang,
  lead,
  setLead,
  leadId,
  scenario,
  onDone,
}: {
  t: ExploreCopy
  lang: Lang
  lead: Lead
  setLead: (fn: (l: Lead) => Lead) => void
  leadId: string
  scenario: ScenarioKind
  onDone: (preview: boolean) => void
}) {
  const [step, setStep] = useState(0)
  const [consent, setConsent] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof Lead | 'consent' | 'form', string>>>({})
  const [status, setStatus] = useState<'idle' | 'sending'>('idle')
  const startedAt = useRef(Date.now())

  const set = (k: keyof Lead) => (v: string) => {
    setLead((l) => ({ ...l, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined, form: undefined }))
  }

  const validate = (keys: (keyof Lead)[]) => {
    const e: typeof errors = {}
    for (const k of keys) {
      const v = lead[k].trim()
      if (k === 'email') {
        if (!isValidEmail(v)) e.email = t.errors.email
      } else if (k === 'phone') {
        const digits = v.replace(/\D/g, '')
        if (digits.length < 7 || digits.length > 15) e.phone = t.errors.phone
      } else if (k === 'company' || k === 'name') {
        if (v.length < 2) e[k] = t.errors[k]
      } else if (!v) e[k] = t.errors[k]
    }
    return e
  }
  const focusFirst = (e: typeof errors) => {
    const first = (Object.keys(e) as string[]).find((k) => k !== 'form')
    if (first) window.setTimeout(() => document.getElementById(`ex-${first}`)?.focus(), 50)
  }

  const next = () => {
    const e = validate(STEP_FIELDS[0])
    setErrors(e)
    if (Object.keys(e).length) return focusFirst(e)
    setStep(1)
    window.setTimeout(() => document.getElementById('ex-name')?.focus(), 320)
  }

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (step === 0) return next()
    const e = validate([...STEP_FIELDS[0], ...STEP_FIELDS[1]])
    if (!consent) e.consent = t.errors.consent
    setErrors(e)
    if (Object.keys(e).length) {
      if (STEP_FIELDS[0].some((k) => e[k])) setStep(0)
      return focusFirst(e)
    }
    setStatus('sending')
    const result = await submitForm(
      'explore',
      {
        leadId,
        company: lead.company.trim(),
        country: lead.country,
        sector: lead.sector,
        size: lead.size,
        name: lead.name.trim(),
        email: lead.email.trim(),
        phone: `${COUNTRIES.find((c) => c.code === lead.country)?.dial ?? ''} ${lead.phone.trim()}`.trim(),
        role: lead.role,
        scenario,
        source: 'explore',
        marketing: marketing ? 'sim' : 'não',
      },
      { honeypot, startedAt: startedAt.current },
    )
    setStatus('idle')
    if (result.ok) onDone(result.preview)
    else setErrors({ form: t.errors[result.reason === 'bot' ? 'server' : result.reason] })
  }

  const privacyHref = '/privacidade/'
  const [before, after] = t.consent('@@').split('@@')

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby="ex-form-title" className="mx-auto max-w-[620px] rounded-[28px] border border-[#0B1030]/[0.08] bg-white p-6 shadow-[0_40px_80px_-60px_rgba(7,13,43,0.5)] [color-scheme:light] sm:p-9">
      <h3 id="ex-form-title" className="sr-only">{t.steps[step]}</h3>
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="font-semibold text-accent-deep" aria-live="polite">
          {t.stepOf(step + 1)} · <span className="text-[#070D2B]">{t.steps[step]}</span>
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1 overflow-hidden rounded-full bg-[#0B1030]/[0.08]">
            <span className={cn('block h-full rounded-full bg-accent transition-[width] duration-500 ease-out', i <= step ? 'w-full' : 'w-0')} />
          </span>
        ))}
      </div>

      <Honeypot value={honeypot} onChange={setHoneypot} />

      <div className="relative mt-7">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25, ease: EASE }} className="space-y-5">
            {step === 0 ? (
              <>
                <Field id="ex-company" label={t.company} error={errors.company}>
                  <TextInput id="ex-company" autoComplete="organization" maxLength={120} placeholder={t.companyPh} value={lead.company} onChange={(e) => set('company')(e.target.value)} error={errors.company} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="ex-country" label={t.country} error={errors.country}>
                    <SelectInput id="ex-country" value={lead.country} onChange={(e) => set('country')(e.target.value)} error={errors.country}>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {lang === 'pt' ? c.pt : c.en}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                  <Field id="ex-size" label={t.size} error={errors.size}>
                    <SelectInput id="ex-size" value={lead.size} onChange={(e) => set('size')(e.target.value)} error={errors.size}>
                      <option value="">{t.choose}</option>
                      {t.sizes.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </SelectInput>
                  </Field>
                </div>
                <Field id="ex-sector" label={t.sector} error={errors.sector}>
                  <SelectInput id="ex-sector" value={lead.sector} onChange={(e) => set('sector')(e.target.value)} error={errors.sector}>
                    <option value="">{t.choose}</option>
                    {t.sectors.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </SelectInput>
                </Field>
              </>
            ) : (
              <>
                <Field id="ex-name" label={t.name} error={errors.name}>
                  <TextInput id="ex-name" autoComplete="name" maxLength={100} placeholder={t.namePh} value={lead.name} onChange={(e) => set('name')(e.target.value)} error={errors.name} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="ex-email" label={t.email} error={errors.email}>
                    <TextInput id="ex-email" type="email" inputMode="email" autoComplete="email" maxLength={254} placeholder="nome@empresa.pt" value={lead.email} onChange={(e) => set('email')(e.target.value)} error={errors.email} />
                  </Field>
                  <Field id="ex-role" label={t.role} error={errors.role}>
                    <SelectInput id="ex-role" value={lead.role} onChange={(e) => set('role')(e.target.value)} error={errors.role}>
                      <option value="">{t.choose}</option>
                      {t.roles.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </SelectInput>
                  </Field>
                </div>
                <Field id="ex-phone" label={t.phone} error={errors.phone}>
                  <div className="relative">
                    <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-navy/55">{COUNTRIES.find((c) => c.code === lead.country)?.dial || '+'}</span>
                    <TextInput id="ex-phone" type="tel" inputMode="tel" autoComplete="tel-national" maxLength={20} placeholder={t.phonePh} value={lead.phone} onChange={(e) => set('phone')(e.target.value)} error={errors.phone} className="pl-[4.4rem]" />
                  </div>
                </Field>
                <p className="flex gap-3 rounded-2xl bg-[#F7F9FE] p-4 text-[13.5px] leading-[1.6] text-[#0B1030]/75">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-accent-deep" aria-hidden="true" />
                  <span>
                    {t.privacyBox}{' '}
                    <a href={privacyHref} target="_blank" rel="noreferrer" className="font-semibold text-accent-deep underline underline-offset-4">
                      {t.privacyLink}
                    </a>
                  </span>
                </p>
                <ConsentCheckbox id="ex-consent" checked={consent} onChange={(v) => { setConsent(v); setErrors((e) => ({ ...e, consent: undefined })) }} error={errors.consent}>
                  {before}
                  <a href={privacyHref} target="_blank" rel="noreferrer" className="font-semibold text-accent-deep underline underline-offset-4">
                    {t.privacyLink}
                  </a>
                  {after}
                </ConsentCheckbox>
                <ConsentCheckbox id="ex-marketing" checked={marketing} onChange={setMarketing}>
                  {t.marketing}
                </ConsentCheckbox>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {errors.form && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-[13.5px] font-medium text-red-800">
          {errors.form}
        </p>
      )}

      <div className="mt-7 flex items-center gap-3">
        {step === 1 && (
          <button type="button" onClick={() => setStep(0)} className={buttonClasses({ variant: 'outline', size: 'lg', className: 'border-[#0B1030]/15 bg-white px-4 text-[#070D2B] hover:bg-[#F7F9FE]' })}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{t.back}</span>
          </button>
        )}
        <button type="submit" disabled={status === 'sending'} className={buttonClasses({ size: 'lg', className: 'flex-1 font-semibold disabled:opacity-70' })}>
          {status === 'sending' ? t.sending : step === 0 ? t.next : t.submit}
          {status !== 'sending' && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </form>
  )
}

/* ---------------- Cenários ---------------- */

function ScenarioTabs({ t, value, onChange }: { t: ExploreCopy; value: ScenarioKind; onChange: (k: ScenarioKind) => void }) {
  return (
    <div role="tablist" aria-label={t.workEyebrow} className="grid gap-2 sm:grid-cols-3">
      {SCENARIOS.map((k) => {
        const on = k === value
        return (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(k)}
            className={cn(
              'rounded-2xl border px-5 py-4 text-left transition-[border-color,background-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              on ? 'border-accent bg-[#F2F6FF] shadow-[0_18px_40px_-28px_rgba(0,82,255,0.6)]' : 'border-[#0B1030]/10 bg-white hover:border-[#0B1030]/25',
            )}
          >
            <span className={cn('block font-display text-[16px] font-bold tracking-[-0.01em]', on ? 'text-accent-deep' : 'text-[#070D2B]')}>{t.scenarios[k].title}</span>
            <span className="mt-1 block text-[13px] leading-snug text-[#0B1030]/60">{t.scenarios[k].desc}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------------- Valores ---------------- */

const inputCls =
  'h-11 w-full rounded-xl border border-[#0B1030]/15 bg-white px-3 text-[14.5px] text-[#070D2B] outline-none transition-[border-color,box-shadow] placeholder:text-[#0B1030]/35 focus:border-accent focus:shadow-[0_0_0_4px_rgba(0,82,255,0.15)]'

function MoneyInput({ id, value, onChange, currency, label }: { id: string; value: number; onChange: (n: number) => void; currency: string; label: string }) {
  return (
    <div className="relative">
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step={100}
        aria-label={label}
        value={Number.isFinite(value) && value !== 0 ? value : ''}
        placeholder="0"
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className={cn(inputCls, 'pr-12 tabular-nums')}
      />
      <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#0B1030]/40">
        {currency}
      </span>
    </div>
  )
}

function Panel({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-[#0B1030]/[0.08] bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-display text-[15px] font-bold text-[#070D2B] [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="h-4 w-4 text-[#0B1030]/50 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="space-y-3 border-t border-[#0B1030]/[0.06] px-5 pb-5 pt-4">{children}</div>
    </details>
  )
}

function FlowRows({ t, rows, onChange, currency, prefix, placeholder }: { t: ExploreCopy; rows: Flow[]; onChange: (r: Flow[]) => void; currency: string; prefix: string; placeholder: string }) {
  const upd = (i: number, patch: Partial<Flow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-xl bg-[#F7F9FE] p-2.5">
          <input aria-label={t.rowLabel} value={r.label} placeholder={placeholder} maxLength={40} onChange={(e) => upd(i, { label: e.target.value })} className={cn(inputCls, 'col-span-2 h-10 bg-white')} />
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <MoneyInput id={`${prefix}-${r.id}-amt`} label={t.amount} value={r.amount} currency={currency} onChange={(n) => upd(i, { amount: n })} />
            <input type="date" aria-label={t.date} value={r.date} onChange={(e) => upd(i, { date: e.target.value })} className={cn(inputCls, 'px-2')} />
          </div>
          {rows.length > 1 && (
            <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="col-span-2 inline-flex items-center gap-1 justify-self-end text-[12.5px] font-medium text-[#0B1030]/50 hover:text-red-700">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              {t.remove}
            </button>
          )}
        </div>
      ))}
      {rows.length < 8 && (
        <button type="button" onClick={() => onChange([...rows, { id: prefix + Date.now(), label: '', amount: 0, date: iso(addDays(today(), 15)) }])} className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-accent-deep">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t.addRow}
        </button>
      )}
    </div>
  )
}

function InvoiceRows({ t, rows, onChange, currency }: { t: ExploreCopy; rows: Invoice[]; onChange: (r: Invoice[]) => void; currency: string }) {
  const upd = (i: number, patch: Partial<Invoice>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={r.id} className="grid gap-2 rounded-xl bg-[#F7F9FE] p-2.5">
          <input aria-label={t.rowLabel} value={r.label} placeholder={t.rowLabelPh} maxLength={40} onChange={(e) => upd(i, { label: e.target.value })} className={cn(inputCls, 'h-10 bg-white')} />
          <div className="grid grid-cols-2 gap-2">
            <MoneyInput id={`inv-${r.id}-amt`} label={t.amount} value={r.amount} currency={currency} onChange={(n) => upd(i, { amount: n })} />
            <input type="date" aria-label={t.due} value={r.due} onChange={(e) => upd(i, { due: e.target.value })} className={cn(inputCls, 'px-2')} />
          </div>
          <label className="flex items-center gap-3 text-[12.5px] font-medium text-[#0B1030]/65">
            <span className="w-24 shrink-0">{t.delay}</span>
            <input type="range" min={0} max={90} step={1} value={r.delay} onChange={(e) => upd(i, { delay: Number(e.target.value) })} className="w-full accent-[#0052FF]" aria-label={`${t.delay} — ${r.label}`} />
            <span className="w-10 text-right tabular-nums text-[#070D2B]">{r.delay}</span>
          </label>
          {rows.length > 1 && (
            <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="inline-flex items-center gap-1 justify-self-end text-[12.5px] font-medium text-[#0B1030]/50 hover:text-red-700">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              {t.remove}
            </button>
          )}
        </div>
      ))}
      {rows.length < 8 && (
        <button type="button" onClick={() => onChange([...rows, { id: 'i' + Date.now(), label: '', amount: 0, due: iso(addDays(today(), 15)), delay: 0 }])} className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-accent-deep">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t.addRow}
        </button>
      )}
    </div>
  )
}

function Slider({ label, value, min, max, onChange, describe }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void; describe: (n: number) => string }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-[13.5px] font-semibold text-[#070D2B]">
        {label}
        <span className="text-[13px] font-medium text-accent-deep">{describe(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-[#0052FF]" aria-valuetext={describe(value)} />
    </label>
  )
}

function InputsPanel({
  t,
  scenario,
  inputs,
  setInputs,
  adjust,
  setAdjust,
  onReset,
  currency,
  fmt,
}: {
  t: ExploreCopy
  scenario: ScenarioKind
  inputs: Inputs
  setInputs: (fn: (i: Inputs) => Inputs) => void
  adjust: Adjust
  setAdjust: (fn: (a: Adjust) => Adjust) => void
  onReset: () => void
  currency: string
  fmt: { money: (n: number) => string }
}) {
  const set = <K extends keyof Inputs>(k: K) => (v: Inputs[K]) => setInputs((i) => ({ ...i, [k]: v }))
  const changed = adjust.receiptShift || adjust.paymentShift || adjust.delayReduction || Object.values(adjust.itemShift).some(Boolean)
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-[#0B1030]/[0.08] bg-white p-5">
        <label htmlFor="ex-balance" className="text-[13.5px] font-semibold text-[#070D2B]">{t.balance}</label>
        <div className="mt-2">
          <MoneyInput id="ex-balance" label={t.balance} value={inputs.balance} currency={currency} onChange={set('balance')} />
        </div>
      </div>

      {scenario === 'clients' ? (
        <Panel title={t.invoices}>
          <InvoiceRows t={t} rows={inputs.invoices} onChange={set('invoices')} currency={currency} />
        </Panel>
      ) : (
        <Panel title={scenario === 'order' ? `${t.regularFlows} · ${t.receipts}` : t.receipts} defaultOpen={scenario !== 'order'}>
          <FlowRows t={t} rows={inputs.receipts} onChange={set('receipts')} currency={currency} prefix="r" placeholder={t.rowLabelPh} />
        </Panel>
      )}
      <Panel title={scenario === 'order' ? `${t.regularFlows} · ${t.payments}` : t.payments} defaultOpen={scenario !== 'order'}>
        <FlowRows t={t} rows={inputs.payments} onChange={set('payments')} currency={currency} prefix="p" placeholder={t.rowLabelPayPh} />
      </Panel>

      {scenario === 'order' && (
        <Panel title={t.orderTitle}>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-[12.5px] font-semibold text-[#070D2B]">
              {t.orderCost}
              <div className="mt-1.5">
                <MoneyInput id="ex-order-cost" label={t.orderCost} value={inputs.order.cost} currency={currency} onChange={(n) => set('order')({ ...inputs.order, cost: n })} />
              </div>
            </label>
            <label className="block text-[12.5px] font-semibold text-[#070D2B]">
              {t.orderCostDate}
              <input type="date" value={inputs.order.costDate} onChange={(e) => set('order')({ ...inputs.order, costDate: e.target.value })} className={cn(inputCls, 'mt-1.5 px-2')} />
            </label>
            <label className="block text-[12.5px] font-semibold text-[#070D2B]">
              {t.orderValue}
              <div className="mt-1.5">
                <MoneyInput id="ex-order-value" label={t.orderValue} value={inputs.order.value} currency={currency} onChange={(n) => set('order')({ ...inputs.order, value: n })} />
              </div>
            </label>
            <label className="block text-[12.5px] font-semibold text-[#070D2B]">
              {t.orderReceiptDate}
              <input type="date" value={inputs.order.receiptDate} onChange={(e) => set('order')({ ...inputs.order, receiptDate: e.target.value })} className={cn(inputCls, 'mt-1.5 px-2')} />
            </label>
          </div>
          {inputs.order.value > 0 && (
            <p className="text-[12.5px] text-[#0B1030]/60">
              {t.kMargin}: <span className="font-semibold text-[#070D2B]">{fmt.money(inputs.order.value - inputs.order.cost)}</span>
            </p>
          )}
        </Panel>
      )}

      <div className="rounded-2xl border border-[#0B1030]/[0.08] bg-white p-5">
        <label htmlFor="ex-rate" className="text-[13.5px] font-semibold text-[#070D2B]">{t.rate}</label>
        <p id="ex-rate-hint" className="mt-1 text-[12.5px] text-[#0B1030]/55">{t.rateHint}</p>
        <div className="relative mt-2 max-w-[160px]">
          <input id="ex-rate" type="number" inputMode="decimal" min={0} max={40} step={0.5} aria-describedby="ex-rate-hint" value={inputs.rate || ''} placeholder="0" onChange={(e) => set('rate')(Math.min(40, Math.max(0, Number(e.target.value) || 0)))} className={cn(inputCls, 'pr-9 tabular-nums')} />
          <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#0B1030]/40">%</span>
        </div>
      </div>

      {/* Ajustes do cenário simulado */}
      <div className="rounded-2xl border border-accent/25 bg-[#F7F9FF] p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-[15px] font-bold text-[#070D2B]">{t.simTitle}</p>
          {changed ? (
            <button type="button" onClick={onReset} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent-deep">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {t.reset}
            </button>
          ) : null}
        </div>
        <div className="mt-4 space-y-5">
          {scenario === 'clients' ? (
            <Slider label={t.delayReduction} value={adjust.delayReduction} min={0} max={60} onChange={(n) => setAdjust((a) => ({ ...a, delayReduction: n }))} describe={t.daysLess} />
          ) : scenario === 'order' ? (
            <Slider label={t.orderShift} value={adjust.itemShift['order-receipt'] ?? 0} min={-45} max={30} onChange={(n) => setAdjust((a) => ({ ...a, itemShift: { ...a.itemShift, 'order-receipt': n } }))} describe={t.daysEarlier} />
          ) : (
            <Slider label={t.receiptShift} value={adjust.receiptShift} min={-30} max={30} onChange={(n) => setAdjust((a) => ({ ...a, receiptShift: n }))} describe={t.daysEarlier} />
          )}
          <Slider label={t.paymentShift} value={adjust.paymentShift} min={-30} max={30} onChange={(n) => setAdjust((a) => ({ ...a, paymentShift: n }))} describe={t.daysEarlier} />
        </div>
      </div>
    </div>
  )
}

/* ---------------- Resultados ---------------- */

type Fmt = { money: (n: number) => string; axisMoney: (n: number) => string; shortDate: (d: number) => string; longDate: (d: number) => string; currency: string }

function Results({ t, scenario, cmp, fmt, hasData, stale, rate }: { t: ExploreCopy; scenario: ScenarioKind; cmp: Comparison; fmt: Fmt; hasData: boolean; stale: boolean; rate: number }) {
  const s = cmp.simulated
  const c = cmp.current
  const curLabel = scenario === 'order' ? t.currentOrder : t.current
  const simLabel = scenario === 'order' ? t.simulatedOrder : t.simulated

  if (!hasData) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-[#0B1030]/15 bg-[#F7F9FE] p-8 text-center text-[15px] text-[#0B1030]/60">
        {t.emptyChart}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-[#0B1030]/[0.07] bg-white p-5 sm:p-7">
        <div>
          <h3 className="font-display text-[19px] font-semibold tracking-[-0.02em] text-[#070D2B]">{t.chartTitle}</h3>
          <p className="mt-1 text-[12.5px] text-[#0B1030]/50">{t.chartSub}</p>
        </div>
        <div className="relative mt-4">
          <CashflowChart
            current={c}
            simulated={s}
            money={fmt.money}
            axisMoney={fmt.axisMoney}
            shortDate={fmt.shortDate}
            labels={{ inflow: t.chartInflow, outflow: t.chartOutflow, current: curLabel, simulated: simLabel, week: t.chartWeek, balance: t.chartBalance }}
            ariaLabel={t.chartLabel(fmt.money(s.min), fmt.longDate(s.minDay))}
          />
          <span aria-live="polite" className={cn('absolute right-0 top-0 rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-medium text-[#0B1030]/55 transition-opacity', stale ? 'opacity-100' : 'opacity-0')}>
            {stale ? t.calculating : ''}
          </span>
        </div>
      </div>

      {/* Indicadores principais */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Kpi label={t.kMin} value={fmt.money(s.min)} sub={t.kMinOn(fmt.longDate(s.minDay))} tone={s.min < 0 ? 'bad' : 'ok'} estimate={t.estimate} />
        <Kpi label={t.kShortfall} value={s.shortfall > 0 ? fmt.money(s.shortfall) : t.kNoShortfall} tone={s.shortfall > 0 ? 'bad' : 'ok'} estimate={t.estimate} />
        {scenario === 'order' && cmp.order ? (
          <>
            <Kpi label={t.kCashRequired} value={fmt.money(cmp.order.cashRequired)} estimate={t.estimate} />
            <Kpi label={t.kMargin} value={fmt.money(cmp.order.margin)} sub={`${Math.round(cmp.order.marginPct * 100)}%`} estimate={t.estimate} />
            {rate > 0 && <Kpi label={t.kMarginAfter} value={fmt.money(cmp.order.marginAfterFinancing)} estimate={t.estimate} />}
          </>
        ) : (
          <Kpi label={t.kReleased} value={fmt.money(Math.max(0, cmp.minImprovement))} sub={t.kReleasedHint} tone={cmp.minImprovement > 0 ? 'good' : undefined} estimate={t.estimate} />
        )}
        <Kpi label={t.kFinancing} value={rate > 0 ? fmt.money(s.financingCost) : t.kFinancingNoRate} estimate={t.estimate} />
      </div>

      {/* Comparação */}
      <div className="overflow-x-auto rounded-[20px] border border-[#0B1030]/[0.08] bg-white">
        <table className="w-full min-w-[420px] text-[13.5px]">
          <caption className="px-5 pt-4 text-left font-display text-[15px] font-bold text-[#070D2B]">{t.compareTitle}</caption>
          <thead>
            <tr className="text-left text-[12px] text-[#0B1030]/55">
              <th scope="col" className="px-5 py-3 font-medium" />
              <th scope="col" className="px-3 py-3 font-medium">{curLabel}</th>
              <th scope="col" className="px-5 py-3 font-semibold text-accent-deep">{simLabel}</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {(
              [
                [t.rows.min, fmt.money(c.min), fmt.money(s.min)],
                [t.rows.minDate, fmt.longDate(c.minDay), fmt.longDate(s.minDay)],
                [t.rows.shortfall, fmt.money(c.shortfall), fmt.money(s.shortfall)],
                [t.rows.daysNegative, String(c.daysNegative), String(s.daysNegative)],
                [t.rows.end, fmt.money(c.end), fmt.money(s.end)],
                [t.rows.financing, rate > 0 ? fmt.money(c.financingCost) : '—', rate > 0 ? fmt.money(s.financingCost) : '—'],
              ] as const
            ).map(([k, a, b]) => (
              <tr key={k} className="border-t border-[#0B1030]/[0.06]">
                <th scope="row" className="px-5 py-2.5 text-left font-medium text-[#0B1030]/70">{k}</th>
                <td className="px-3 py-2.5 text-[#0B1030]/75">{a}</td>
                <td className="px-5 py-2.5 font-semibold text-[#070D2B]">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recebimentos que mais pressionam */}
      {scenario !== 'order' && (
        <div className="rounded-[20px] border border-[#0B1030]/[0.08] bg-white p-5">
          <p className="font-display text-[15px] font-bold text-[#070D2B]">{t.pressureTitle}</p>
          {cmp.pressure.length ? (
            <ul className="mt-3 space-y-2">
              {cmp.pressure.map((p) => (
                <li key={p.id} className="flex items-center gap-2.5 text-[13.5px] text-[#0B1030]/75">
                  <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {t.pressureItem(p.label || '—', fmt.money(p.amount), fmt.longDate(p.day))}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13.5px] text-[#0B1030]/60">{t.pressureNone}</p>
          )}
        </div>
      )}

      <details className="group rounded-[20px] border border-[#0B1030]/[0.08] bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-display text-[15px] font-bold text-[#070D2B] [&::-webkit-details-marker]:hidden">
          {t.howTitle}
          <ChevronDown className="h-4 w-4 text-[#0B1030]/50 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
        </summary>
        <ul className="space-y-2 border-t border-[#0B1030]/[0.06] px-5 pb-5 pt-4">
          {t.how.map((h) => (
            <li key={h} className="relative pl-4 text-[13.5px] leading-[1.6] text-[#0B1030]/70">
              <span aria-hidden="true" className="absolute left-0 top-[9px] h-1 w-1 rounded-full bg-[#0B1030]/40" />
              {h}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}

function Kpi({ label, value, sub, tone, estimate }: { label: string; value: string; sub?: string; tone?: 'ok' | 'bad' | 'good'; estimate: string }) {
  return (
    <div className="rounded-[20px] border border-[#0B1030]/[0.07] bg-white p-5">
      <p className="flex items-start justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1030]/50">
        {label}
        <span className="shrink-0 rounded-full bg-[#F2F6FF] px-2 py-0.5 text-[9.5px] font-semibold tracking-[0.08em] text-accent-deep">{estimate}</span>
      </p>
      <motion.p key={value} initial={{ opacity: 0.4, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={cn('mt-3 font-display text-[28px] font-semibold tracking-[-0.03em] tabular-nums', tone === 'bad' ? 'text-[#B4232A]' : tone === 'good' ? 'text-[#15803D]' : 'text-[#070D2B]')}>
        {value}
      </motion.p>
      {sub && <p className="mt-1 text-[12.5px] text-[#0B1030]/55">{sub}</p>}
    </div>
  )
}

/* ---------------- Finer Advisor ---------------- */

function Advisor({ t, lang, reading, applied, onApply }: { t: ExploreCopy; lang: Lang; reading: ReturnType<typeof advise>; applied: string[]; onApply: (key: string, a: Partial<Adjust>) => void }) {
  const [headline, ...rest] = reading.identified
  return (
    <section aria-labelledby="ex-advisor" className="relative isolate overflow-hidden rounded-[30px] bg-[#040817] p-6 text-white sm:p-10">
      <LightArcs variant="card" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-16 -z-10 h-[300px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(30,144,255,0.35),transparent)] blur-[60px]" />
      <div className="relative">
        <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#7CB8FF]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {t.advisorEyebrow}
        </p>
        <h3 id="ex-advisor" className="mt-4 max-w-[800px] font-display text-[24px] font-medium leading-[1.3] tracking-[-0.02em] sm:text-[32px]">
          {headline?.[lang]}
        </h3>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <AdvisorBlock title={t.advisorIdentified} items={rest.map((x) => x[lang])} />
          <AdvisorBlock title={t.advisorPressure} items={reading.pressure.map((x) => x[lang])} />
          <div className="space-y-3">
            {reading.tests.map((r, i) => {
              const done = applied.includes(r.key)
              return (
                <div key={r.key} className={cn('rounded-2xl p-5', i === 0 ? 'bg-white text-[#070D2B]' : 'border border-white/10 bg-white/[0.05] text-white')}>
                  {i === 0 && <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-deep">{t.advisorTests}</p>}
                  <p className={cn('text-[14.5px] leading-[1.55]', i === 0 ? 'mt-2' : 'text-white/85')}>{r.text[lang]}</p>
                  {r.adjust &&
                    (done ? (
                      <p className={cn('mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold', i === 0 ? 'text-accent-deep' : 'text-[#7CB8FF]')}>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        {t.recApplied}
                      </p>
                    ) : (
                      <button type="button" onClick={() => onApply(r.key, r.adjust!)} className={cn('mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow', i === 0 ? 'text-accent' : 'text-white')}>
                        {t.simulateRec}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ))}
                </div>
              )
            })}
          </div>
        </div>
        <p className="mt-6 text-[12.5px] text-white/45">{t.advisorNote}</p>
      </div>
    </section>
  )
}

function AdvisorBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return <div className="hidden lg:block" />
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">{title}</p>
      <ul className="mt-2 space-y-2.5">
        {items.map((x) => (
          <li key={x} className="text-[14.5px] leading-[1.55] text-white/85">{x}</li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------- Enviar simulação ---------------- */

function SaveSimulation({ t, lead, leadId, scenario, inputs, adjust, cmp, fmt }: { t: ExploreCopy; lead: Lead; leadId: string; scenario: ScenarioKind; inputs: Inputs; adjust: Adjust; cmp: Comparison; fmt: Fmt }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'saved' | 'preview' | 'error'>('idle')
  const [error, setError] = useState('')
  const startedAt = useRef(Date.now() - 10000)
  const [sentKey, setSentKey] = useState('')
  const payloadKey = JSON.stringify([scenario, inputs, adjust])

  const send = async () => {
    setStatus('sending')
    const base = today()
    const at = (d: number) => iso(addDays(base, d))
    const relevant =
      scenario === 'clients'
        ? { balance: inputs.balance, invoices: inputs.invoices, payments: inputs.payments, rate: inputs.rate }
        : scenario === 'order'
          ? { balance: inputs.balance, receipts: inputs.receipts, payments: inputs.payments, order: inputs.order, rate: inputs.rate }
          : { balance: inputs.balance, receipts: inputs.receipts, payments: inputs.payments, rate: inputs.rate }
    const summary = (p: Comparison['current']) => ({ min: Math.round(p.min), minDate: at(p.minDay), shortfall: Math.round(p.shortfall), daysNegative: p.daysNegative, end: Math.round(p.end), financingCost: Math.round(p.financingCost) })
    const results = {
      currency: fmt.currency,
      horizonDays: HORIZON,
      current: summary(cmp.current),
      simulated: summary(cmp.simulated),
      minImprovement: Math.round(cmp.minImprovement),
      order: cmp.order ? { cashRequired: cmp.order.cashRequired, margin: Math.round(cmp.order.margin), marginAfterFinancing: Math.round(cmp.order.marginAfterFinancing) } : undefined,
      adjust,
    }
    const result = await submitForm(
      'explore-sim',
      {
        leadId,
        email: lead.email.trim(),
        scenario,
        country: lead.country,
        source: 'explore',
        inputs: JSON.stringify({ startDate: iso(base), ...relevant }).slice(0, 8000),
        results: JSON.stringify(results).slice(0, 8000),
      },
      { honeypot: '', startedAt: startedAt.current },
    )
    if (result.ok) {
      setStatus(result.preview ? 'preview' : 'saved')
      setSentKey(payloadKey)
    } else {
      setStatus('error')
      setError(t.errors[result.reason === 'bot' ? 'server' : result.reason])
    }
  }

  const sentCurrent = sentKey === payloadKey
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-[#0B1030]/[0.08] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div className="max-w-[560px]">
        <p className="font-display text-[18px] font-bold tracking-[-0.01em] text-[#070D2B]">{t.saveTitle}</p>
        <p className="mt-1 text-[14px] leading-[1.6] text-[#0B1030]/65">{t.saveBody}</p>
        <p aria-live="polite" className="mt-2 text-[13.5px] font-medium">
          {status === 'saved' && sentCurrent && <span className="text-[#15803D]">{t.saved}</span>}
          {status === 'preview' && sentCurrent && <span className="text-[#7A4B00]">{t.savePreview}</span>}
          {status === 'error' && <span className="text-red-700">{error}</span>}
        </p>
      </div>
      <button type="button" onClick={send} disabled={status === 'sending' || ((status === 'saved' || status === 'preview') && sentCurrent)} className={buttonClasses({ size: 'lg', className: 'shrink-0 font-semibold disabled:opacity-60' })}>
        {status === 'sending' ? t.saving : (status === 'saved' || status === 'preview') && !sentCurrent ? t.saveAgain : t.save}
        {status !== 'sending' && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  )
}
