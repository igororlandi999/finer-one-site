import { useRef, useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { isValidEmail, resetSubmission, submitForm } from '@/lib/forms'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { CURRENCIES, DIAL_CODES } from './content'
import type { ExploreText } from './content'
import type { MonthlyInputs, ScenarioKind } from '@/lib/explore/monthly'

export type Lead = { name: string; email: string; company: string; dial: string; phone: string; currency: string; request: boolean; contact: boolean; marketing: boolean }
export const EMPTY_LEAD: Lead = { name: '', email: '', company: '', dial: '+351', phone: '', currency: 'EUR', request: false, contact: false, marketing: false }

type Props = {
  t: ExploreText['form']
  lead: Lead
  setLead: (l: Lead) => void
  scenario: ScenarioKind
  inputs: MonthlyInputs
  onBack: () => void
  onSuccess: (preview: boolean) => void
}

function newId() {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  }
}

/** Valores da simulação que entram no cálculo (meses do horizonte; saldo e pagamentos só se indicados). */
function snapshot(scenario: ScenarioKind, inp: MonthlyInputs, currency: string) {
  const H = inp.horizon
  const hasBalance = scenario === 'treasury' ? true : inp.hasBalance
  return {
    scenario,
    horizon: H,
    currency,
    inputs: {
      balance: hasBalance ? inp.balance : null,
      receipts: inp.receipts.slice(0, H),
      payments: hasBalance ? inp.payments.slice(0, H) : null,
      delayShare: inp.delayShare,
      delayDays: inp.delayDays,
      hasBalance,
    },
  }
}

/**
 * Formulário curto do Explorar, aberto por "Ver a minha análise completa".
 * Obrigatórios: nome, email, empresa e a confirmação do pedido. Telefone opcional.
 * Os valores da simulação seguem automaticamente com o pedido (não se repetem) e os
 * resultados são recalculados no recetor. A análise só abre com a confirmação do
 * recetor (id ou duplicate); comunicações comerciais são uma opção separada, desmarcada.
 */
export function LeadForm({ t, lead, setLead, scenario, inputs, onBack, onSuccess }: Props) {
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'company' | 'phone' | 'request' | 'form', string>>>({})
  const [sending, setSending] = useState(false)
  const inFlight = useRef(false) // trava o duplo clique antes de o botão ficar desativado
  const honeypot = useRef<HTMLInputElement>(null)
  const startedAt = useRef(Date.now())
  const simRef = useRef<{ key: string; id: string } | null>(null)

  const set = <K extends keyof Lead>(k: K, v: Lead[K]) => {
    setLead({ ...lead, [k]: v })
    if (k in errors) setErrors({ ...errors, [k]: undefined })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inFlight.current) return
    const err: typeof errors = {}
    const phoneDigits = lead.phone.replace(/\D/g, '')
    const totalDigits = lead.dial.replace(/\D/g, '').length + phoneDigits.length
    if (lead.name.trim().length < 2) err.name = t.errors.name
    if (!isValidEmail(lead.email)) err.email = t.errors.email
    if (lead.company.trim().length < 2) err.company = t.errors.company
    if (phoneDigits && (totalDigits < 7 || totalDigits > 15)) err.phone = t.errors.phone
    if (!lead.request) err.request = t.errors.request
    setErrors(err)
    if (Object.keys(err).length) {
      document.getElementById(`lf-${Object.keys(err)[0]}`)?.focus()
      return
    }

    // A mesma simulação mantém o mesmo identificador entre tentativas; uma simulação
    // diferente é um pedido novo (novo identificador de simulação e de submissão).
    const snap = snapshot(scenario, inputs, lead.currency)
    const key = JSON.stringify(snap)
    if (simRef.current?.key !== key) {
      if (simRef.current) resetSubmission('explore')
      simRef.current = { key, id: newId() }
    }

    inFlight.current = true
    setSending(true)
    track('lead_form_submitted', { scenario, horizon: inputs.horizon })
    const res = await submitForm(
      'explore',
      {
        name: lead.name.trim(),
        email: lead.email.trim(),
        company: lead.company.trim(),
        phone: phoneDigits ? `${lead.dial} ${phoneDigits}` : '',
        contact: lead.contact ? '1' : '0',
        marketing: lead.marketing ? '1' : '0',
        privacy: '1',
      },
      { honeypot: honeypot.current?.value ?? '', startedAt: startedAt.current },
      { simulation: { id: simRef.current.id, ...snap } },
    )
    inFlight.current = false
    setSending(false)
    if (!res.ok) {
      const key = res.reason === 'rate' ? 'rate' : res.reason === 'network' ? 'network' : res.reason === 'unavailable' ? 'unavailable' : res.reason === 'verification' ? 'verification' : 'server'
      setErrors({ form: t.errors[key] })
      return
    }
    track('lead_form_success', { scenario, horizon: inputs.horizon, preview: res.preview })
    onSuccess(res.preview)
  }

  const input = 'h-11 w-full rounded-xl border border-[#0B1030]/12 bg-white px-3.5 text-[14.5px] text-[#070D2B] placeholder:text-[#0B1030]/35 outline-none transition-[border-color,box-shadow] focus:border-[#070D2B] focus:ring-2 focus:ring-[#070D2B]/10'
  const opt = <span className="font-normal text-[#0B1030]/40"> · {t.optional}</span>

  return (
    <form onSubmit={submit} noValidate className="border-t border-[#0B1030]/10 pt-7 text-left">
      <h4 className="font-display text-[20px] font-bold tracking-[-0.02em] text-[#070D2B]">{t.title}</h4>
      <p className="mt-1 text-[13.5px] text-[#0B1030]/55">{t.sub}</p>

      {/* Campo-armadilha para robôs */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field id="lf-name" label={t.name} error={errors.name}>
          <input id="lf-name" className={input} autoComplete="name" value={lead.name} onChange={(e) => set('name', e.target.value)} maxLength={100} aria-invalid={!!errors.name} />
        </Field>
        <Field id="lf-email" label={t.email} error={errors.email}>
          <input id="lf-email" type="email" className={input} autoComplete="email" value={lead.email} onChange={(e) => set('email', e.target.value)} maxLength={254} aria-invalid={!!errors.email} />
        </Field>
        <Field id="lf-company" label={t.company} error={errors.company}>
          <input id="lf-company" className={input} autoComplete="organization" value={lead.company} onChange={(e) => set('company', e.target.value)} maxLength={120} aria-invalid={!!errors.company} />
        </Field>
        <Field id="lf-phone" label={<>{t.phone}{opt}</>} error={errors.phone}>
          <div className="flex gap-2">
            <select aria-label={t.dial} className={cn(input, 'w-[108px] shrink-0 appearance-none px-3 [&>option]:text-[#070D2B]')} value={lead.dial} onChange={(e) => set('dial', e.target.value)}>
              {DIAL_CODES.map((c) => (
                <option key={c.code} value={c.dial}>{`${c.code} ${c.dial}`}</option>
              ))}
            </select>
            <input id="lf-phone" type="tel" inputMode="tel" className={input} autoComplete="tel-national" value={lead.phone} onChange={(e) => set('phone', e.target.value.replace(/[^\d ]/g, ''))} maxLength={20} aria-invalid={!!errors.phone} />
          </div>
        </Field>
        <Field id="lf-currency" label={t.currency}>
          <select id="lf-currency" className={cn(input, 'appearance-none [&>option]:text-[#070D2B]')} value={lead.currency} onChange={(e) => set('currency', e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5 space-y-3">
        <Check id="lf-request" checked={lead.request} onChange={(v) => set('request', v)} invalid={!!errors.request}>
          {t.request}
        </Check>
        {errors.request && <p className="-mt-1 pl-7 text-[12px] text-[#C62D33]">{errors.request}</p>}
        <Check checked={lead.contact} onChange={(v) => set('contact', v)}>{t.contact}</Check>
        <Check checked={lead.marketing} onChange={(v) => set('marketing', v)}>{t.marketing}</Check>
      </div>

      <div className="mt-5 rounded-xl bg-[#F5F7FB] p-4">
        <p className="text-[12.5px] font-semibold text-[#070D2B]">{t.privacyTitle}</p>
        <dl className="mt-2 grid gap-x-6 gap-y-1.5 text-[12px] leading-snug sm:grid-cols-2">
          {t.privacy.map(([k, v]) => (
            <div key={k}>
              <dt className="inline font-medium text-[#070D2B]/80">{k}: </dt>
              <dd className="inline text-[#0B1030]/55">{v}</dd>
            </div>
          ))}
        </dl>
        <a href="/privacidade/" target="_blank" rel="noopener" className="mt-2.5 inline-block text-[12px] font-medium text-[#070D2B] underline decoration-[#0B1030]/25 underline-offset-4 hover:decoration-[#070D2B]">
          {t.policy}
        </a>
      </div>

      {errors.form && (
        <p role="alert" className="mt-4 rounded-lg border border-[#E5484D]/25 bg-[#FDECEC] px-3.5 py-2.5 text-[13px] text-[#9F2228]">
          {errors.form}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="text-[13px] font-medium text-[#0B1030]/55 underline decoration-[#0B1030]/20 underline-offset-4 hover:text-[#070D2B]">
          {t.back}
        </button>
        <button type="submit" disabled={sending} className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#070D2B] px-7 text-[15px] font-semibold text-white shadow-[0_12px_30px_-14px_rgba(7,13,43,0.8)] transition-[transform,background-color] hover:-translate-y-px hover:bg-[#0B1338] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#070D2B] focus-visible:ring-offset-2">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {sending ? t.sending : t.submit}
          {!sending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
        </button>
      </div>
    </form>
  )
}

function Field({ id, label, error, children }: { id: string; label: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-medium text-[#070D2B]/80">
        {label}
      </label>
      {children}
      {error && <p className="text-[12px] text-[#C62D33]">{error}</p>}
    </div>
  )
}

function Check({ id, checked, onChange, invalid, children }: { id?: string; checked: boolean; onChange: (v: boolean) => void; invalid?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-[#0B1030]/65">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={invalid || undefined} className="mt-0.5 h-4 w-4 shrink-0 accent-[#070D2B]" />
      {children}
    </label>
  )
}
