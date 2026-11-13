import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react'
import { ConsentCheckbox, Honeypot } from '@/components/forms/fields'
import { DEMO_VIDEO } from '@/config/demo'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useLanguage } from '@/i18n/LanguageContext'
import { isPreviewMode, isValidEmail, submitForm } from '@/lib/forms'
import { cn } from '@/lib/utils'
import { FormSuccess } from '@/pages/FormSuccess'
import { WaitlistPageClassic } from '@/pages/WaitlistPageClassic'

/**
 * Lista de espera (12/11/2026, v2).
 * Inscrição em 3 perguntas, uma de cada vez, com opções para escolher (como a Lovable
 * e o "Step 1 of 3" da Searchable). Por baixo: um primeiro olhar ao produto (o vídeo
 * da hero, que cresce com o scroll), o que o Finer Plus inclui (faixa em movimento) e
 * a escolha entre lista de espera e Finer Pioneers (como a Searchable junta os dois).
 * Versão anterior em ?versao=anterior.
 */
const copy = {
  pt: {
    kicker: 'Lista de espera',
    title: ['Uma nova forma de gerir o seu negócio ', 'está a chegar.'],
    sub: 'Acompanhe a evolução da Finer One e seja dos primeiros a receber novidades sobre o acesso à plataforma.',
    q: (n: number) => `Pergunta ${n} de 3`,
    qTitles: ['Comecemos por si.', 'Qual é a dimensão da sua empresa?', 'O que gostaria de acompanhar melhor?'],
    qHints: ['', 'Escolha uma opção.', 'Escolha uma ou mais opções.'],
    name: 'Nome',
    namePh: 'O seu nome',
    email: 'Email profissional',
    sizes: ['Só eu', '2 a 9 pessoas', '10 a 49 pessoas', '50 a 249 pessoas', '250 ou mais'],
    interests: ['Tesouraria', 'Recebimentos', 'Custos e despesas', 'Previsões', 'Tudo num só lugar'],
    next: 'Continuar',
    back: 'Voltar',
    consent: ['Li o ', 'aviso de privacidade', ' e aceito receber comunicações da Finer One sobre o acesso à plataforma. Posso cancelar a qualquer momento.'],
    submit: 'Entrar na lista',
    sending: 'A enviar…',
    fine: 'A inscrição não exige ligação bancária nem partilha de dados financeiros.',
    errors: {
      name: 'Indique o seu nome.',
      email: 'Indique um email válido.',
      size: 'Escolha a dimensão da empresa.',
      interests: 'Escolha pelo menos uma opção.',
      consent: 'É necessário aceitar para se inscrever.',
      rate: 'Recebemos vários envios deste dispositivo. Tente novamente mais tarde.',
      network: 'Não foi possível enviar. Verifique a ligação e tente novamente.',
      server: 'Ocorreu um erro ao enviar. Tente novamente dentro de alguns minutos.',
    },
    successTitle: 'Está na lista.',
    successBody: 'Obrigado. Vamos enviar-lhe novidades sobre a Finer One e sobre o acesso à plataforma.',
    previewNote: 'Versão de pré-visualização: o formulário funciona, mas nenhum dado foi enviado ou guardado.',
    lookEyebrow: 'Um primeiro olhar',
    lookTitle: ['Pergunte. Perceba. ', 'Decida o próximo passo.'],
    lookSub: 'Faça perguntas sobre o seu negócio, acompanhe a tesouraria e descubra o que merece a sua atenção.',
    videoLabel: 'Demonstração da plataforma Finer One, com dados fictícios',
    plusLabel: 'O Finer Plus inclui',
    plus: ['Finer Home', 'Cashflow', 'Receitas', 'Despesas', 'Clientes e Fornecedores', 'Finer Advisor', 'Alertas'],
    choiceEyebrow: 'Duas formas de começar',
    choiceTitle: ['Lista de espera ou ', 'Finer Pioneers?'],
    waitlistCard: { name: 'Lista de espera', for: 'Para acompanhar de perto', items: ['Novidades sobre o lançamento', 'Primeiros a saber quando o acesso abrir', 'Sem ligar contas nem partilhar dados financeiros'], cta: 'Entrar na lista' },
    pioneersCard: { name: 'Finer Pioneers', for: 'Para testar já, com a equipa', items: ['Experimenta a Finer One antes do lançamento', 'Contacto direto com a equipa', 'Primeiro mês grátis + 10% de desconto nos planos mensal e anual', '10 lugares'], cta: 'Candidatar-me' },
  },
  en: {
    kicker: 'Waitlist',
    title: ['A new way to run your business ', 'is coming.'],
    sub: 'Follow Finer One as it evolves and be among the first to hear about platform access.',
    q: (n: number) => `Question ${n} of 3`,
    qTitles: ['Let’s start with you.', 'How big is your company?', 'What would you like to keep a closer eye on?'],
    qHints: ['', 'Choose one option.', 'Choose one or more options.'],
    name: 'Name',
    namePh: 'Your name',
    email: 'Work email',
    sizes: ['Just me', '2 to 9 people', '10 to 49 people', '50 to 249 people', '250 or more'],
    interests: ['Cash position', 'Receivables', 'Costs and expenses', 'Forecasts', 'Everything in one place'],
    next: 'Continue',
    back: 'Back',
    consent: ['I have read the ', 'privacy notice', ' and agree to receive communications from Finer One about platform access. I can unsubscribe at any time.'],
    submit: 'Join the list',
    sending: 'Sending…',
    fine: 'Signing up does not require a bank connection or sharing financial data.',
    errors: {
      name: 'Please enter your name.',
      email: 'Please enter a valid email.',
      size: 'Choose your company size.',
      interests: 'Choose at least one option.',
      consent: 'You need to agree to sign up.',
      rate: 'We received several submissions from this device. Please try again later.',
      network: 'Could not send. Check your connection and try again.',
      server: 'Something went wrong. Please try again in a few minutes.',
    },
    successTitle: 'You are on the list.',
    successBody: 'Thank you. We will send you news about Finer One and platform access.',
    previewNote: 'Preview version: the form works, but no data was sent or stored.',
    lookEyebrow: 'A first look',
    lookTitle: ['Ask. Understand. ', 'Decide what comes next.'],
    lookSub: 'Ask questions about your business, follow your cash and find out what deserves your attention.',
    videoLabel: 'Finer One platform demo, with fictitious data',
    plusLabel: 'Finer Plus includes',
    plus: ['Finer Home', 'Cashflow', 'Revenue', 'Expenses', 'Customers and Suppliers', 'Finer Advisor', 'Alerts'],
    choiceEyebrow: 'Two ways to start',
    choiceTitle: ['Waitlist or ', 'Finer Pioneers?'],
    waitlistCard: { name: 'Waitlist', for: 'To follow along closely', items: ['Launch news', 'First to know when access opens', 'No bank connection or financial data needed'], cta: 'Join the list' },
    pioneersCard: { name: 'Finer Pioneers', for: 'To try it now, with the team', items: ['Try Finer One before launch', 'Direct contact with the team', 'First month free + 10% off the monthly and annual plans', '10 places'], cta: 'Apply now' },
  },
}
type T = (typeof copy)['pt']

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
  return (
    <>
      <section aria-labelledby="wl-titulo" className="relative isolate overflow-hidden bg-white pb-24 pt-36 text-navy sm:pt-40 lg:min-h-[100svh] lg:pb-32">
        {/* O céu Finer a subir do fundo e o mundo em baixo */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[58%]">
          <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_100%,rgba(0,82,255,0.55),transparent_70%),linear-gradient(180deg,#FFFFFF_0%,#E3EEFF_30%,#8DB8FF_58%,#2F74FF_80%,#0A40C8_100%)]" />
          <img
            src="/images/cta-earth.webp"
            alt=""
            className="absolute inset-x-0 bottom-0 h-[60%] w-full object-cover object-[50%_10%]"
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
          <motion.div variants={rise}>
            <SignupBox t={t} />
          </motion.div>
          <motion.p variants={rise} className="mx-auto mt-6 flex w-fit max-w-full items-center justify-center gap-2 rounded-full bg-[#03060F]/45 px-4 py-2 text-[12px] text-white/85 backdrop-blur-md">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {t.fine}
          </motion.p>
        </motion.div>
      </section>

      <FirstLook t={t} />
      <PlusStrip t={t} />
      <Choice t={t} />
    </>
  )
}

/* Inscrição: 3 perguntas, uma de cada vez */

type Err = Partial<Record<'name' | 'email' | 'size' | 'interests' | 'consent' | 'form', string>>

function SignupBox({ t }: { t: T }) {
  const reduced = useReducedMotion() ?? false
  const startedAt = useRef(Date.now())
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [size, setSize] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<Err>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [preview, setPreview] = useState(isPreviewMode)

  const go = (to: number) => {
    setDir(to > step ? 1 : -1)
    setStep(to)
    setErrors({})
  }

  const checkStep = (s: number): Err => {
    const e: Err = {}
    if (s === 0) {
      if (name.trim().length < 2) e.name = t.errors.name
      if (!isValidEmail(email)) e.email = t.errors.email
    }
    if (s === 1 && !size) e.size = t.errors.size
    if (s === 2) {
      if (!interests.length) e.interests = t.errors.interests
      if (!consent) e.consent = t.errors.consent
    }
    return e
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const e = checkStep(step)
    setErrors(e)
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0]
      document.getElementById(first === 'size' || first === 'interests' ? `wl-${first}-0` : `wl-${first}`)?.focus()
      return
    }
    if (step < 2) return go(step + 1)
    setStatus('sending')
    const result = await submitForm('waitlist', { name, email, size, interests: interests.join(', ') }, { honeypot, startedAt: startedAt.current })
    if (result.ok) {
      setPreview(result.preview)
      setStatus('done')
    } else {
      setErrors({ form: t.errors[result.reason === 'bot' ? 'server' : result.reason] })
      setStatus('idle')
    }
  }

  // Ao escolher a dimensão, avança sozinho (como a Lovable): um clique por pergunta.
  const pickSize = (s: string) => {
    setSize(s)
    setErrors({})
    window.setTimeout(() => go(2), reduced ? 0 : 260)
  }
  const toggleInterest = (s: string) => {
    setInterests((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]))
    setErrors((x) => ({ ...x, interests: undefined }))
  }

  const inputCls = 'mt-0.5 w-full bg-transparent text-[16px] text-[#070D2B] outline-none placeholder:text-[#0B1030]/35'
  const field = (id: 'name' | 'email', label: string, input: ReactNode) => (
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

  const option = (id: string, label: string, on: boolean, onClick: () => void, multi: boolean) => (
    <button
      key={label}
      id={id}
      type="button"
      onClick={onClick}
      {...(multi ? { 'aria-pressed': on } : { role: 'radio', 'aria-checked': on })}
      className={cn(
        'group inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-[14.5px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        on ? 'border-accent bg-accent text-white shadow-[0_10px_24px_-12px_rgba(0,82,255,0.9)]' : 'border-[#0B1030]/[0.14] bg-white text-[#070D2B] hover:-translate-y-0.5 hover:border-accent/50',
      )}
    >
      <span className={cn('flex h-4 w-4 items-center justify-center border', multi ? 'rounded-[5px]' : 'rounded-full', on ? 'border-white bg-white text-accent' : 'border-[#0B1030]/25')}>
        {on && <Check className="h-3 w-3" aria-hidden="true" />}
      </span>
      {label}
    </button>
  )

  return (
    <div id="inscricao" className="relative mx-auto mt-10 max-w-[680px] scroll-mt-28 text-left">
      <div aria-hidden="true" className="absolute -inset-4 rounded-[36px] bg-[radial-gradient(closest-side,rgba(0,82,255,0.22),transparent)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-[#0B1030]/[0.08] bg-white shadow-[0_40px_90px_-40px_rgba(7,13,43,0.55)]">
        {status === 'done' ? (
          <div className="px-5 py-8">
            <FormSuccess title={t.successTitle} body={t.successBody} preview={preview} previewNote={t.previewNote}>
              <a href="/pioneers/" className="group mx-auto mt-7 flex max-w-md items-center justify-between gap-4 rounded-2xl bg-[#070D2B] p-5 text-left text-white transition-colors hover:bg-[#0E1A4D]">
                <span>
                  <span className="block font-display text-[16px] font-bold">{t.pioneersCard.name}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-white/75">{t.pioneersCard.items[2]}</span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </FormSuccess>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} aria-label={t.kicker} className="[color-scheme:light]">
            <Honeypot value={honeypot} onChange={setHoneypot} />
            <div className="flex items-center justify-between gap-4 border-b border-[#0B1030]/[0.06] px-5 py-3.5">
              <p className="text-[12.5px] font-semibold text-accent-deep" aria-live="polite">
                {t.q(step + 1)}
              </p>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={cn('h-1.5 rounded-full transition-all duration-500', i === step ? 'w-6 bg-accent' : i < step ? 'w-1.5 bg-accent' : 'w-1.5 bg-[#0B1030]/15')} />
                ))}
              </div>
            </div>

            <div className="relative min-h-[150px] p-2.5">
              <AnimatePresence mode="wait" initial={false} custom={dir}>
                <motion.div key={step} initial={{ opacity: 0, x: 22 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 * dir }} transition={{ duration: 0.26, ease: EASE }}>
                  <p className="px-4 pb-1 pt-3 font-display text-[19px] font-bold tracking-[-0.015em] text-[#070D2B]">{t.qTitles[step]}</p>
                  {t.qHints[step] && <p className="px-4 text-[13px] text-[#0B1030]/55">{t.qHints[step]}</p>}

                  {step === 0 && (
                    <div className="mt-1 grid gap-1 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-center">
                      {field('name', t.name, <input id="wl-name" name="wl-name" autoComplete="name" maxLength={100} placeholder={t.namePh} value={name} aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? 'wl-name-error' : undefined} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined, form: undefined })) }} className={inputCls} />)}
                      {field('email', t.email, <input id="wl-email" name="wl-email" type="email" inputMode="email" autoComplete="email" maxLength={254} placeholder="nome@empresa.pt" value={email} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'wl-email-error' : undefined} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined, form: undefined })) }} className={inputCls} />)}
                      <button type="submit" className="group m-1 inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-[20px] bg-[#070D2B] px-6 text-[15px] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(7,13,43,0.8)] transition-colors hover:bg-[#0E1A4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                        {t.next}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                      </button>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="px-4 pb-3 pt-4">
                      <div role="radiogroup" aria-label={t.qTitles[1]} className="flex flex-wrap gap-2">
                        {t.sizes.map((s, i) => option(`wl-size-${i}`, s, size === s, () => pickSize(s), false))}
                      </div>
                      {errors.size && <p role="alert" className="mt-2 text-[12.5px] font-medium text-red-700">{errors.size}</p>}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="px-4 pb-2 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {t.interests.map((s, i) => option(`wl-interests-${i}`, s, interests.includes(s), () => toggleInterest(s), true))}
                      </div>
                      {errors.interests && <p role="alert" className="mt-2 text-[12.5px] font-medium text-red-700">{errors.interests}</p>}
                      <div className="mt-4 border-t border-[#0B1030]/[0.07] pt-3.5">
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
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {errors.form && (
              <p role="alert" className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-[13.5px] text-red-800">
                {errors.form}
              </p>
            )}

            {step > 0 && (
              <div className="flex items-center justify-between gap-3 border-t border-[#0B1030]/[0.06] px-3 py-3">
                <button type="button" onClick={() => go(step - 1)} className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold text-[#0B1030]/65 transition-colors hover:bg-[#0B1030]/[0.05] hover:text-[#070D2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  {t.back}
                </button>
                {step === 2 && (
                  <button type="submit" disabled={status === 'sending'} className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#070D2B] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#0E1A4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                    {status === 'sending' ? t.sending : t.submit}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

/* Um primeiro olhar: o vídeo da hero, que cresce com o scroll */

function FirstLook({ t }: { t: T }) {
  const reduced = useReducedMotion() ?? false
  const small = !useMediaQuery('(min-width: 768px)')
  const ref = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.4 })
  const scale = useTransform(p, [0, 1], reduced ? [1, 1] : [0.84, 1])
  const radius = useTransform(p, [0, 1], reduced ? [24, 24] : [40, 24])
  const tilt = useTransform(p, [0, 1], reduced ? [0, 0] : [10, 0])

  // Só reproduz quando está à vista (e nunca sozinho com movimento reduzido).
  useEffect(() => {
    const v = video.current
    if (!v || reduced) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => undefined) : v.pause()), { threshold: 0.3 })
    io.observe(v)
    return () => io.disconnect()
  }, [reduced, small])

  const portrait = small && DEMO_VIDEO.portrait
  return (
    <section aria-labelledby="wl-look" className="bg-white px-4 pb-10 pt-24 text-navy sm:pt-28">
      <motion.div variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} className="mx-auto max-w-[760px] text-center">
        <motion.p variants={rise} className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">
          <span aria-hidden="true" className="h-px w-8 bg-accent-deep/60" />
          {t.lookEyebrow}
        </motion.p>
        <motion.h2 variants={rise} id="wl-look" className="mt-5 text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[46px]">
          {t.lookTitle[0]}
          <span className="text-accent-deep">{t.lookTitle[1]}</span>
        </motion.h2>
        <motion.p variants={rise} className="mx-auto mt-4 max-w-[520px] text-[16.5px] leading-[1.6] text-[#0B1030]/65">
          {t.lookSub}
        </motion.p>
      </motion.div>

      <div ref={ref} className="mx-auto mt-12 max-w-[1100px] [perspective:1400px]">
        <motion.div style={{ scale, borderRadius: radius, rotateX: tilt }} className="relative overflow-hidden border border-[#0B1030]/[0.08] bg-[#070D2B] p-1.5 shadow-[0_60px_120px_-50px_rgba(7,13,43,0.6)] will-change-transform">
          <div className={cn('relative overflow-hidden rounded-[18px] bg-white', portrait ? 'mx-auto aspect-[4/5] max-w-[420px]' : 'aspect-video')}>
            <video
              key={portrait ? 'v' : 'h'}
              ref={video}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              loop
              playsInline
              preload="metadata"
              poster={portrait ? DEMO_VIDEO.portraitPoster : DEMO_VIDEO.poster}
              aria-label={t.videoLabel}
            >
              <source src={portrait ? DEMO_VIDEO.portrait : DEMO_VIDEO.src} type="video/mp4" />
            </video>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* O que o Finer Plus inclui — faixa em movimento */

function PlusStrip({ t }: { t: T }) {
  const reduced = useReducedMotion() ?? false
  const items = [...t.plus, ...t.plus]
  return (
    <section aria-label={t.plusLabel} className="overflow-hidden bg-white py-14">
      <p className="text-center text-[13px] font-semibold text-[#0B1030]/45">{t.plusLabel}</p>
      <div className="relative mt-6 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <ul className={cn('flex w-max gap-3', !reduced && 'animate-[wl-marquee_32s_linear_infinite] hover:[animation-play-state:paused]')}>
          {items.map((m, i) => (
            <li key={i} aria-hidden={i >= t.plus.length} className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-[#0B1030]/[0.08] bg-[#F7F9FE] px-5 py-2.5 font-display text-[16px] font-semibold tracking-[-0.01em] text-[#070D2B]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
              {m}
            </li>
          ))}
        </ul>
      </div>
      <style>{'@keyframes wl-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }'}</style>
    </section>
  )
}

/* Lista de espera ou Finer Pioneers? (como a Searchable junta os dois) */

function Choice({ t }: { t: T }) {
  const toTop = () => {
    document.getElementById('inscricao')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => document.getElementById('wl-name')?.focus({ preventScroll: true }), 600)
  }
  return (
    <section aria-labelledby="wl-choice" className="bg-white px-4 pb-24 pt-10 text-navy sm:pb-28">
      <motion.div variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="mx-auto max-w-[1000px]">
        <div className="text-center">
          <motion.p variants={rise} className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">
            <span aria-hidden="true" className="h-px w-8 bg-accent-deep/60" />
            {t.choiceEyebrow}
            <span aria-hidden="true" className="h-px w-8 bg-accent-deep/60" />
          </motion.p>
          <motion.h2 variants={rise} id="wl-choice" className="mt-5 font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[44px]">
            {t.choiceTitle[0]}
            <span className="text-accent-deep">{t.choiceTitle[1]}</span>
          </motion.h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <motion.div variants={rise} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="flex flex-col rounded-[24px] border border-[#0B1030]/[0.09] bg-white p-7 shadow-[0_30px_60px_-45px_rgba(7,13,43,0.5)]">
            <p className="text-[12.5px] font-semibold text-[#0B1030]/50">{t.waitlistCard.for}</p>
            <p data-sweep className="mt-2 font-display text-[26px] font-bold tracking-[-0.025em] text-[#070D2B]">{t.waitlistCard.name}</p>
            <ul className="mt-6 flex-1 space-y-3 border-t border-[#0B1030]/[0.07] pt-6">
              {t.waitlistCard.items.map((x) => (
                <li key={x} className="flex gap-3 text-[15px] text-[#0B1030]/75">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  {x}
                </li>
              ))}
            </ul>
            <button type="button" onClick={toTop} className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#0B1030]/15 text-[15px] font-semibold text-[#070D2B] transition-colors hover:border-[#070D2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              {t.waitlistCard.cta}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
          </motion.div>

          <motion.div variants={rise} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="relative flex flex-col overflow-hidden rounded-[24px] bg-[#070D2B] p-7 text-white shadow-[0_40px_80px_-40px_rgba(7,13,43,0.85)]">
            <img src="/images/cta-earth.webp" alt="" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full object-cover object-[50%_15%] opacity-60" style={{ maskImage: 'linear-gradient(to bottom, transparent, #000 60%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 60%)' }} />
            <div className="relative flex flex-1 flex-col">
              <p className="text-[12.5px] font-semibold text-[#7CB8FF]">{t.pioneersCard.for}</p>
              <p data-sweep className="mt-2 font-display text-[26px] font-bold tracking-[-0.025em]">{t.pioneersCard.name}</p>
              <ul className="mt-6 flex-1 space-y-3 border-t border-white/10 pt-6">
                {t.pioneersCard.items.map((x) => (
                  <li key={x} className="flex gap-3 text-[15px] text-white/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5CA8FF]" aria-hidden="true" />
                    {x}
                  </li>
                ))}
              </ul>
              <a href="/pioneers/" className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(0,82,255,0.95)] transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow">
                {t.pioneersCard.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
