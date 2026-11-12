import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { MotionConfig, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowRight, Check, Lock } from 'lucide-react'
import { ConsentCheckbox, Honeypot } from '@/components/forms/fields'
import { useLanguage } from '@/i18n/LanguageContext'
import { isPreviewMode, isValidEmail, submitForm } from '@/lib/forms'
import { cn } from '@/lib/utils'
import { FormSuccess } from '@/pages/FormSuccess'
import { WaitlistPageClassic } from '@/pages/WaitlistPageClassic'

/**
 * Lista de espera (12/11/2026) — a partir da Lovable (título ao centro e uma única
 * caixa grande onde se escreve), da Ramp (um campo, um botão grande) e da Searchable
 * (a lista de espera como alternativa ao programa). Mesma linguagem da página
 * Finer Pioneers: fundo branco, azul na frase-chave, o céu Finer e o mundo em baixo.
 * Campos, validação e envio iguais à versão anterior (em ?versao=anterior).
 */
const copy = {
  pt: {
    kicker: 'Lista de espera',
    title: ['Uma nova forma de gerir o seu negócio ', 'está a chegar.'],
    sub: 'Acompanhe a evolução da Finer One e seja dos primeiros a receber novidades sobre o acesso à plataforma.',
    points: ['Novidades sobre o lançamento', 'Primeiros a saber quando o acesso abrir', 'Sem ligar contas nem partilhar dados financeiros'],
    formTitle: 'Entrar na lista de espera',
    name: 'Nome',
    email: 'Email profissional',
    consent: ['Li o ', 'aviso de privacidade', ' e aceito receber comunicações da Finer One sobre o acesso à plataforma. Posso cancelar a qualquer momento.'],
    submit: 'Entrar na lista',
    sending: 'A enviar…',
    fine: 'A inscrição não exige ligação bancária nem partilha de dados financeiros.',
    errors: {
      name: 'Indique o seu nome.',
      email: 'Indique um email válido.',
      consent: 'É necessário aceitar para se inscrever.',
      rate: 'Recebemos vários envios deste dispositivo. Tente novamente mais tarde.',
      network: 'Não foi possível enviar. Verifique a ligação e tente novamente.',
      server: 'Ocorreu um erro ao enviar. Tente novamente dentro de alguns minutos.',
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
    consent: ['I have read the ', 'privacy notice', ' and agree to receive communications from Finer One about platform access. I can unsubscribe at any time.'],
    submit: 'Join the list',
    sending: 'Sending…',
    fine: 'Signing up does not require a bank connection or sharing financial data.',
    errors: {
      name: 'Please enter your name.',
      email: 'Please enter a valid email.',
      consent: 'You need to agree to sign up.',
      rate: 'We received several submissions from this device. Please try again later.',
      network: 'Could not send. Check your connection and try again.',
      server: 'Something went wrong. Please try again in a few minutes.',
    },
    successTitle: 'You are on the list.',
    successBody: 'Thank you. We will send you news about Finer One and platform access.',
    previewNote: 'Preview version: the form works, but no data was sent or stored.',
    pioneersTitle: 'Want to be more involved?',
    pioneersBody: 'The Finer Pioneers programme is looking for 10 business owners to test the platform with the team.',
    pioneersCta: 'Discover Finer Pioneers',
  },
}

const EASE = [0.22, 1, 0.36, 1] as const
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const rise: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } } }

export function WaitlistPage() {
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('versao') === 'anterior') return <WaitlistPageClassic />
  return (
    <MotionConfig reducedMotion="user">
      <Waitlist />
    </MotionConfig>
  )
}

function Waitlist() {
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

  // Campo "dentro da caixa" (sem rebordo próprio): a caixa grande é que tem o foco, como na Lovable.
  const field = (id: 'name' | 'email', label: string, input: React.ReactNode) => (
    <label htmlFor={`wl-${id}`} className={cn('block rounded-2xl px-4 py-3 transition-colors focus-within:bg-[#F3F7FF]', errors[id] && 'bg-red-50')}>
      <span className="block text-[12px] font-semibold text-[#0B1030]/55">{label}</span>
      {input}
      {errors[id] && (
        <span id={`wl-${id}-error`} role="alert" className="mt-1 block text-[12px] font-medium text-red-700">
          {errors[id]}
        </span>
      )}
    </label>
  )
  const inputCls = 'mt-0.5 w-full bg-transparent text-[16px] text-[#070D2B] outline-none placeholder:text-[#0B1030]/35'

  return (
    <section aria-labelledby="wl-titulo" className="relative isolate overflow-hidden bg-white pb-20 pt-36 text-navy sm:pt-40 lg:min-h-[100svh] lg:pb-28">
      {/* O céu Finer a subir do fundo e o mundo em baixo (como a atmosfera da Lovable, com a nossa identidade) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[62%]">
        <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_100%,rgba(0,82,255,0.55),transparent_70%),linear-gradient(180deg,#FFFFFF_0%,#E3EEFF_30%,#8DB8FF_58%,#2F74FF_80%,#0A40C8_100%)]" />
        <img
          src="/images/cta-earth.webp"
          alt=""
          className="absolute inset-x-0 bottom-0 h-[58%] w-full object-cover object-[50%_10%]"
          style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, #000 50%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 50%)' }}
        />
      </div>

      <motion.div variants={group} initial="hidden" animate="show" className="mx-auto max-w-[760px] px-5 text-center sm:px-6">
        <motion.p variants={rise} className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">
          <span aria-hidden="true" className="h-px w-8 bg-accent-deep/60" />
          {t.kicker}
          <span aria-hidden="true" className="h-px w-8 bg-accent-deep/60" />
        </motion.p>
        <motion.h1 variants={rise} id="wl-titulo" className="mx-auto mt-5 max-w-[720px] text-balance font-display text-[38px] font-bold leading-[1.03] tracking-[-0.035em] text-[#070D2B] sm:text-[52px] lg:text-[58px]">
          {t.title[0]}
          <span className="text-accent-deep">{t.title[1]}</span>
        </motion.h1>
        <motion.p variants={rise} className="mx-auto mt-5 max-w-[540px] text-[16.5px] leading-[1.6] text-[#0B1030]/65 sm:text-[17.5px]">
          {t.sub}
        </motion.p>

        {/* A caixa grande (como o campo da Lovable) */}
        <motion.div variants={rise} className="relative mx-auto mt-10 max-w-[680px] text-left">
          <div aria-hidden="true" className="absolute -inset-4 rounded-[36px] bg-[radial-gradient(closest-side,rgba(0,82,255,0.22),transparent)] blur-2xl" />
          <div className="relative rounded-[28px] border border-[#0B1030]/[0.08] bg-white p-2.5 shadow-[0_40px_90px_-40px_rgba(7,13,43,0.55)]">
            {status === 'done' ? (
              <div className="px-5 py-8">
                <FormSuccess title={t.successTitle} body={t.successBody} preview={preview} previewNote={t.previewNote}>
                  <a href="/pioneers/" className="group mx-auto mt-7 flex max-w-md items-center justify-between gap-4 rounded-2xl bg-[#070D2B] p-5 text-left text-white transition-colors hover:bg-[#0E1A4D]">
                    <span>
                      <span className="block font-display text-[16px] font-bold">{t.pioneersTitle}</span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-white/75">{t.pioneersBody}</span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                </FormSuccess>
              </div>
            ) : (
              <form noValidate onSubmit={onSubmit} aria-label={t.formTitle} className="[color-scheme:light]">
                <Honeypot value={honeypot} onChange={setHoneypot} />
                <div className="grid gap-1 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-center">
                  {field(
                    'name',
                    t.name,
                    <input id="wl-name" name="wl-name" autoComplete="name" maxLength={100} value={name} aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? 'wl-name-error' : undefined} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined, form: undefined })) }} className={inputCls} />,
                  )}
                  {field(
                    'email',
                    t.email,
                    <input id="wl-email" name="wl-email" type="email" inputMode="email" autoComplete="email" maxLength={254} placeholder="nome@empresa.pt" value={email} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'wl-email-error' : undefined} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined, form: undefined })) }} className={inputCls} />,
                  )}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="group m-1 inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-[20px] bg-[#070D2B] px-6 text-[15px] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(7,13,43,0.8)] transition-colors hover:bg-[#0E1A4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    {status === 'sending' ? t.sending : t.submit}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                </div>
                <div className="border-t border-[#0B1030]/[0.07] px-4 pb-2 pt-3.5">
                  <ConsentCheckbox
                    id="wl-consent"
                    checked={consent}
                    onChange={(v) => {
                      setConsent(v)
                      setErrors((x) => ({ ...x, consent: undefined }))
                    }}
                    error={errors.consent}
                  >
                    {t.consent[0]}
                    <a href="/privacidade/" target="_blank" rel="noopener" className="font-semibold text-accent underline underline-offset-2">
                      {t.consent[1]}
                    </a>
                    {t.consent[2]}
                  </ConsentCheckbox>
                </div>
                {errors.form && (
                  <p role="alert" className="mx-2 mb-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[13.5px] text-red-800">
                    {errors.form}
                  </p>
                )}
              </form>
            )}
          </div>
        </motion.div>

        {/* Os três pontos, discretos, por baixo da caixa */}
        <motion.ul variants={rise} className="mx-auto mt-7 flex max-w-[680px] flex-wrap justify-center gap-2.5 text-[13px] text-[#070D2B]">
          {t.points.map((p) => (
            <li key={p} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3.5 py-1.5 shadow-[0_8px_20px_-12px_rgba(7,13,43,0.5)] backdrop-blur-md">
              <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {p}
            </li>
          ))}
        </motion.ul>

        {/* A alternativa mais próxima (como a Searchable junta lista de espera e programa) */}
        {status !== 'done' && (
          <motion.a
            variants={rise}
            href="/pioneers/"
            className="group mx-auto mt-14 inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/15 py-2 pl-2 pr-5 text-[14px] text-white backdrop-blur-md transition-colors hover:bg-white/25"
          >
            <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-[#070D2B]">Finer Pioneers</span>
            {t.pioneersTitle}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </motion.a>
        )}

        <motion.p variants={rise} className="mx-auto mt-6 flex w-fit max-w-full items-center justify-center gap-2 rounded-full bg-[#03060F]/45 px-4 py-2 text-[12px] text-white/85 backdrop-blur-md">
          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t.fine}
        </motion.p>
      </motion.div>
    </section>
  )
}
