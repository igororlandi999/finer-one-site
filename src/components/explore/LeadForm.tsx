import { useRef, useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { isValidEmail, submitForm } from '@/lib/forms'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { COUNTRIES, CURRENCIES, SECTORS, SIZES } from './content'
import type { ExploreText, Lang } from './content'
import type { Horizon, ScenarioKind } from '@/lib/explore/monthly'

export type Lead = { name: string; email: string; company: string; country: string; size: string; sector: string; phone: string; currency: string; contact: boolean; marketing: boolean }
export const EMPTY_LEAD: Lead = { name: '', email: '', company: '', country: '', size: '', sector: '', phone: '', currency: 'EUR', contact: false, marketing: false }

type Props = {
  t: ExploreText['form']
  lang: Lang
  lead: Lead
  setLead: (l: Lead) => void
  scenario: ScenarioKind
  horizon: Horizon
  onBack: () => void
  onSuccess: (preview: boolean) => void
}


/**
 * Formulário curto (estratégia B: depois da primeira descoberta).
 * Obrigatórios: nome, email, empresa e país. Não envia valores da simulação.
 */
export function LeadForm({ t, lang, lead, setLead, scenario, horizon, onBack, onSuccess }: Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof Lead | 'form', string>>>({})
  const [sending, setSending] = useState(false)
  const honeypot = useRef<HTMLInputElement>(null)
  const startedAt = useRef(Date.now())

  const set = <K extends keyof Lead>(k: K, v: Lead[K]) => {
    const next = { ...lead, [k]: v }
    if (k === 'country') {
      const c = COUNTRIES.find((x) => x.code === v)
      if (c) next.currency = c.currency
    }
    setLead(next)
    if (errors[k]) setErrors({ ...errors, [k]: undefined })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    const err: typeof errors = {}
    if (lead.name.trim().length < 2) err.name = t.errors.name
    if (!isValidEmail(lead.email)) err.email = t.errors.email
    if (lead.company.trim().length < 2) err.company = t.errors.company
    if (!lead.country) err.country = t.errors.country
    setErrors(err)
    if (Object.keys(err).length) {
      document.getElementById(`lf-${Object.keys(err)[0]}`)?.focus()
      return
    }
    setSending(true)
    track('lead_form_submitted', { scenario, horizon })
    // Mesmo recetor da Lista de Espera e dos Finer Pioneers (Google Apps Script → Folha + email).
    // Os nomes vão em português, legíveis na folha. Os valores da simulação não são enviados.
    const label = <T extends { pt: string }>(list: (T & { value?: string; code?: string })[], v: string) => list.find((x) => (x.value ?? x.code) === v)?.pt ?? ''
    const res = await submitForm(
      'explore',
      {
        name: lead.name.trim(),
        email: lead.email.trim(),
        company: lead.company.trim(),
        country: label(COUNTRIES, lead.country),
        size: label(SIZES, lead.size),
        sector: label(SECTORS, lead.sector),
        phone: lead.phone.trim(),
        currency: lead.currency,
        scenario,
        horizon: String(horizon),
        stage: lead.contact ? 'pediu_contacto' : 'pediu_relatorio',
        contact: lead.contact ? 'sim' : 'não',
        marketing: lead.marketing ? 'sim' : 'não',
        source: 'Explore Finer One',
      },
      { honeypot: honeypot.current?.value ?? '', startedAt: startedAt.current },
    )
    setSending(false)
    if (!res.ok) {
      const key = res.reason === 'rate' ? 'rate' : res.reason === 'network' ? 'network' : res.reason === 'unavailable' ? 'unavailable' : res.reason === 'verification' ? 'verification' : 'server'
      setErrors({ form: t.errors[key] })
      return
    }
    track('lead_form_success', { scenario, horizon, preview: res.preview })
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
        <Field id="lf-country" label={t.country} error={errors.country}>
          <select id="lf-country" className={cn(input, 'appearance-none [&>option]:text-[#070D2B]')} value={lead.country} onChange={(e) => set('country', e.target.value)} aria-invalid={!!errors.country}>
            <option value="">{t.choose}</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c[lang]}</option>
            ))}
          </select>
        </Field>
        <Field id="lf-size" label={<>{t.size}{opt}</>}>
          <select id="lf-size" className={cn(input, 'appearance-none [&>option]:text-[#070D2B]')} value={lead.size} onChange={(e) => set('size', e.target.value)}>
            <option value="">{t.choose}</option>
            {SIZES.map((s) => (
              <option key={s.value} value={s.value}>{s[lang]}</option>
            ))}
          </select>
        </Field>
        <Field id="lf-sector" label={<>{t.sector}{opt}</>}>
          <select id="lf-sector" className={cn(input, 'appearance-none [&>option]:text-[#070D2B]')} value={lead.sector} onChange={(e) => set('sector', e.target.value)}>
            <option value="">{t.choose}</option>
            {SECTORS.map((s) => (
              <option key={s.value} value={s.value}>{s[lang]}</option>
            ))}
          </select>
        </Field>
        <Field id="lf-phone" label={<>{t.phone}{opt}</>}>
          <input id="lf-phone" type="tel" className={input} autoComplete="tel" value={lead.phone} onChange={(e) => set('phone', e.target.value.replace(/[^\d+ ()-]/g, ''))} maxLength={30} />
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

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-[#0B1030]/65">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#070D2B]" />
      {children}
    </label>
  )
}
