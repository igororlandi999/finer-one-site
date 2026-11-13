import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowUpRight, Bell, Lock, ShieldCheck } from 'lucide-react'
import { ConsentCheckbox, Field, Honeypot, TextInput } from '@/components/forms/fields'
import { buttonClasses } from '@/components/ui/Button'
import { useLanguage } from '@/i18n/LanguageContext'
import { isPreviewMode, isValidEmail, submitForm } from '@/lib/forms'
import { FormSuccess } from '@/pages/FormSuccess'

const copy = {
  pt: {
    kicker: 'Lista de espera',
    title: ['Uma nova forma de gerir o seu negócio ', 'está a chegar.'],
    sub: 'Acompanhe a evolução da Finer One e seja dos primeiros a receber novidades sobre o acesso à plataforma.',
    points: ['Novidades sobre o lançamento', 'Primeiros a saber quando o acesso abrir', 'Sem ligar contas nem partilhar dados financeiros'],
    formTitle: 'Entrar na lista de espera',
    name: 'Nome',
    email: 'Email profissional',
    emailPh: 'nome@empresa.pt',
    consent: ['Li o ', 'aviso de privacidade', ' e aceito receber comunicações da Finer One sobre o acesso à plataforma. Posso cancelar a qualquer momento.'],
    submit: 'Quero entrar na lista de espera',
    sending: 'A enviar…',
    fine: 'A inscrição não exige ligação bancária nem partilha de dados financeiros.',
    errors: {
      name: 'Indique o seu nome.',
      email: 'Indique um email válido.',
      consent: 'É necessário aceitar para se inscrever.',
      rate: 'Recebemos vários envios deste dispositivo. Tente novamente mais tarde.',
      network: 'Não foi possível enviar. Verifique a ligação e tente novamente.',
      server: 'Ocorreu um erro ao enviar. Tente novamente dentro de alguns minutos.',
      unavailable: 'O formulário está temporariamente indisponível. Escreva-nos para geral.finerone@gmail.com.',
      duplicate: 'Este email já está na lista de espera.',
    },
    successTitle: 'Está na lista.',
    successBody: 'Obrigado. Vamos enviar-lhe novidades sobre a Finer One e sobre o acesso à plataforma.',
    previewNote: 'Versão de pré-visualização: o formulário funciona, mas nenhum dado foi enviado ou guardado.',
    pioneersTitle: 'Quer participar mais de perto?',
    pioneersBody: 'O programa Finer Pioneers procura 10 empresários para testar a plataforma com a equipa.',
    pioneersCta: 'Conhecer o Finer Pioneers',
  },
  en: {
    kicker: 'Waitlist',
    title: ['A new way to run your business ', 'is coming.'],
    sub: 'Follow Finer One as it evolves and be among the first to hear about platform access.',
    points: ['Launch news', 'First to know when access opens', 'No bank connection or financial data needed'],
    formTitle: 'Join the waitlist',
    name: 'Name',
    email: 'Work email',
    emailPh: 'name@company.com',
    consent: ['I have read the ', 'privacy notice', ' and agree to receive communications from Finer One about platform access. I can unsubscribe at any time.'],
    submit: 'Join the waitlist',
    sending: 'Sending…',
    fine: 'Signing up does not require a bank connection or sharing financial data.',
    errors: {
      name: 'Please enter your name.',
      email: 'Please enter a valid email.',
      consent: 'You need to agree to sign up.',
      rate: 'We received several submissions from this device. Please try again later.',
      network: 'Could not send. Check your connection and try again.',
      server: 'Something went wrong. Please try again in a few minutes.',
      unavailable: 'This form is temporarily unavailable. Please email us at geral.finerone@gmail.com.',
      duplicate: 'This email is already on the waitlist.',
    },
    successTitle: 'You are on the list.',
    successBody: 'Thank you. We will send you news about Finer One and platform access.',
    previewNote: 'Preview version: the form works, but no data was sent or stored.',
    pioneersTitle: 'Want to be more involved?',
    pioneersBody: 'The Finer Pioneers programme is looking for 10 business owners to test the platform with the team.',
    pioneersCta: 'Discover Finer Pioneers',
  },
}

const pointIcons = [Bell, ArrowUpRight, ShieldCheck]

export function WaitlistPageClassic() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const startedAt = useRef(Date.now())
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'consent' | 'form', string>>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [preview, setPreview] = useState(isPreviewMode)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const e: typeof errors = {}
    if (name.trim().length < 2) e.name = t.errors.name
    if (!isValidEmail(email)) e.email = t.errors.email
    if (!consent) e.consent = t.errors.consent
    setErrors(e)
    if (Object.keys(e).length) {
      document.getElementById(`wl-${Object.keys(e)[0]}`)?.focus()
      return
    }
    if (status === 'sending') return
    setStatus('sending')
    const result = await submitForm('waitlist', { name, email }, { honeypot, startedAt: startedAt.current })
    if (result.ok) {
      setPreview(result.preview)
      setStatus('done')
    } else {
      setErrors({ form: t.errors[result.reason === 'bot' ? 'server' : result.reason] })
      setStatus('idle')
    }
  }

  return (
    <section aria-labelledby="wl-titulo" className="relative isolate overflow-hidden pb-24 pt-32 lg:pb-32 lg:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-navy-deep">
        <img src="/images/earth-europe.jpg" alt="" className="absolute inset-x-0 bottom-0 h-[70%] w-full object-cover object-top opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy-deep/70 to-navy-deep/20" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-navy" />
      </div>

      <div className="mx-auto grid max-w-content items-start gap-12 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-16 lg:px-8">
        <div className="lg:pt-6">
          <p className="animate-fade-up text-[12px] font-semibold uppercase tracking-[0.24em] text-glow">{t.kicker}</p>
          <h1 id="wl-titulo" className="mt-5 animate-fade-up text-balance font-display text-[34px] font-bold leading-[1.08] tracking-[-0.03em] text-white [animation-delay:100ms] sm:text-[48px] lg:text-[54px]">
            {t.title[0]}
            <span className="text-glow">{t.title[1]}</span>
          </h1>
          <p className="mt-6 max-w-xl animate-fade-up text-[16px] leading-relaxed text-white/85 [animation-delay:200ms] sm:text-[18px]">{t.sub}</p>
          <ul className="mt-8 animate-fade-up space-y-3 [animation-delay:300ms]">
            {t.points.map((p, i) => {
              const Icon = pointIcons[i]
              return (
                <li key={p} className="flex items-center gap-3 text-[15px] text-white/90">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-glow">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {p}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="animate-fade-up rounded-[28px] bg-white p-6 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)] [animation-delay:250ms] sm:p-8">
          {status === 'done' ? (
            <FormSuccess title={t.successTitle} body={t.successBody} preview={preview} previewNote={t.previewNote}>
              <div className="mt-7 rounded-2xl bg-navy p-5 text-left text-white">
                <p className="font-display text-[16px] font-bold">{t.pioneersTitle}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/80">{t.pioneersBody}</p>
                <a href="/pioneers/" className={buttonClasses({ size: 'md', className: 'mt-4 font-semibold' })}>
                  {t.pioneersCta}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </FormSuccess>
          ) : (
            <form noValidate onSubmit={onSubmit} className="relative [color-scheme:light]">
              <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-navy">{t.formTitle}</h2>
              <Honeypot value={honeypot} onChange={setHoneypot} />
              <div className="mt-6 space-y-5">
                <Field id="wl-name" label={t.name} error={errors.name}>
                  <TextInput id="wl-name" autoComplete="name" maxLength={100} value={name} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined, form: undefined })) }} error={errors.name} />
                </Field>
                <Field id="wl-email" label={t.email} error={errors.email}>
                  <TextInput id="wl-email" type="email" inputMode="email" autoComplete="email" maxLength={254} placeholder={t.emailPh} value={email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined, form: undefined })) }} error={errors.email} />
                </Field>
                <ConsentCheckbox id="wl-consent" checked={consent} onChange={(v) => { setConsent(v); setErrors((x) => ({ ...x, consent: undefined })) }} error={errors.consent}>
                  {t.consent[0]}
                  <a href="/privacidade/" target="_blank" rel="noopener" className="font-semibold text-accent underline underline-offset-2">
                    {t.consent[1]}
                  </a>
                  {t.consent[2]}
                </ConsentCheckbox>
              </div>
              {errors.form && (
                <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-[13.5px] text-red-800">
                  {errors.form}
                </p>
              )}
              <button type="submit" disabled={status === 'sending'} className={buttonClasses({ size: 'lg', className: 'mt-6 h-auto min-h-12 w-full whitespace-normal py-3 font-semibold' })}>
                {status === 'sending' ? t.sending : t.submit}
              </button>
              <p className="mt-4 flex items-start gap-2 text-[12.5px] text-navy/75">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {t.fine}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
