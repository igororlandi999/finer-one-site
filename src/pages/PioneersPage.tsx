import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowDown, ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react'
import { ConsentCheckbox, Field, Honeypot, SelectInput, TextArea, TextInput } from '@/components/forms/fields'
import { buttonClasses } from '@/components/ui/Button'
import { useLanguage } from '@/i18n/LanguageContext'
import { isPreviewMode, isValidEmail, submitForm } from '@/lib/forms'
import { cn } from '@/lib/utils'
import { FormSuccess } from '@/pages/FormSuccess'
import { PioneersPageClassic } from '@/pages/PioneersPageClassic'

/**
 * Finer Pioneers (12/11/2026) — a partir da Searchable (candidatura ao programa
 * por passos, com barra de progresso e resumo), da Lovable e da Searchable
 * (registo em ecrã dividido: formulário limpo + atmosfera da marca) e da Ramp.
 * Identidade Finer One: navy, o mundo, azul elétrico; formulário claro.
 * O conteúdo, os campos, a validação e o envio são os mesmos da versão anterior
 * (disponível em ?versao=anterior).
 */
const copy = {
  pt: {
    kicker: 'Finer Pioneers · Um convite a empresários',
    title: ['As melhores soluções constroem‑se ', 'com quem vive os desafios.'],
    sub: 'Procuramos 10 empresários para testar a Finer One em primeira mão, partilhar a sua experiência e ajudar a definir a evolução da plataforma.',
    cta: 'Candidatar-me',
    facts: ['10 lugares', 'Candidatura em 2 minutos', 'Sem ligar contas para se candidatar'],
    offerLabel: 'Oferta Finer Pioneers',
    offer: 'Primeiro mês grátis + 10% de desconto nos planos mensal e anual do Finer Plus.',
    builtBy: 'Construído por',
    whatEyebrow: 'O programa',
    whatTitle: ['O que é o ', 'Finer Pioneers'],
    whatBody: 'Um grupo restrito de empresários que acompanha de perto a construção da Finer One. Testam o MVP com a equipa, dão feedback honesto e ajudam a decidir o que vem a seguir.',
    stepsTitle: 'Como funciona',
    steps: [
      { title: 'Candidata-se', text: 'Conte-nos quem é, a sua empresa e o principal desafio financeiro que enfrenta.' },
      { title: 'Conversamos', text: 'A equipa analisa as candidaturas e contacta os empresários selecionados.' },
      { title: 'Testa e influencia', text: 'Experimenta o MVP, partilha feedback e acompanha as melhorias que ajuda a definir.' },
    ],
    gainsTitle: 'O que ganha',
    gains: [
      { title: 'Acesso antecipado', text: 'Experimenta a Finer One antes do lançamento.' },
      { title: 'Participação ativa', text: 'A sua experiência influencia diretamente as próximas melhorias.' },
      { title: 'Proximidade com a equipa', text: 'Contacto direto com quem está a construir a plataforma.' },
    ],
    teamTitle: 'Quem está a construir',
    team: [
      ['Igor Orlandi', 'Tecnologia e Inovação Estratégica'],
      ['Henrique Bértolo', 'Estratégia e Expansão de Negócio'],
      ['Sebastião Andrade', 'Estratégia e Performance Financeira'],
    ] as [string, string][],
    formTitle: 'Candidatura Finer Pioneers',
    stepOf: (n: number) => `Passo ${n} de 3`,
    stepTitles: ['Sobre si', 'A sua empresa', 'O seu desafio'],
    next: 'Continuar',
    back: 'Voltar',
    review: 'A sua candidatura',
    name: 'Nome',
    company: 'Empresa',
    sector: 'Setor de atividade',
    sectorPlaceholder: 'Selecione o setor',
    sectors: ['Agência / consultoria', 'Comércio', 'Construção', 'E-commerce', 'Indústria', 'Recrutamento / trabalho temporário', 'Restauração e hotelaria', 'Saúde', 'Serviços profissionais', 'Tecnologia', 'Transportes e logística', 'Outro'],
    email: 'Email profissional',
    challenge: 'Principal desafio financeiro',
    challengeHint: 'Escolha um tema para começar ou escreva livremente.',
    challengeChips: ['Recebimentos em atraso', 'Pressão de tesouraria', 'Custos a subir', 'Falta de previsão', 'Informação dispersa'],
    challengeExamples: ['Ex.: Tenho dificuldade em prever quando vou ter falta de caixa…', 'Ex.: Faturo bem, mas os clientes pagam tarde…', 'Ex.: Não sei que custos estão a crescer mais…'],
    consent: ['Li o ', 'aviso de privacidade', ' e aceito que a Finer One trate estes dados para avaliar a minha candidatura e contactar-me sobre o programa.'],
    submit: 'Enviar candidatura',
    sending: 'A enviar…',
    secure: 'Os seus dados são usados apenas para avaliar a candidatura. Não pedimos dados bancários.',
    errors: {
      name: 'Indique o seu nome.',
      company: 'Indique o nome da empresa.',
      sector: 'Selecione o setor de atividade.',
      email: 'Indique um email válido.',
      challenge: 'Descreva o desafio em pelo menos 10 caracteres.',
      consent: 'É necessário aceitar para enviar a candidatura.',
      rate: 'Recebemos vários envios deste dispositivo. Tente novamente mais tarde.',
      network: 'Não foi possível enviar. Verifique a ligação e tente novamente.',
      server: 'Ocorreu um erro ao enviar. Tente novamente dentro de alguns minutos.',
    },
    successTitle: 'Candidatura recebida.',
    successBody: 'Obrigado pelo interesse em construir a Finer One connosco. A equipa vai analisar a sua candidatura e entrará em contacto com os empresários selecionados.',
    previewNote: 'Versão de pré-visualização: o formulário funciona, mas nenhum dado foi enviado ou guardado.',
    backHome: 'Voltar à página inicial',
  },
  en: {
    kicker: 'Finer Pioneers · An invitation to business owners',
    title: ['The best solutions are built ', 'with those who live the challenges.'],
    sub: 'We are looking for 10 business owners to try Finer One first-hand, share their experience and help shape how the platform evolves.',
    cta: 'Apply now',
    facts: ['10 places', '2-minute application', 'No bank connection needed to apply'],
    offerLabel: 'Finer Pioneers offer',
    offer: 'First month free + 10% off the monthly and annual Finer Plus plans.',
    builtBy: 'Built by',
    whatEyebrow: 'The programme',
    whatTitle: ['What ', 'Finer Pioneers is'],
    whatBody: 'A small group of business owners who follow Finer One closely as it is built. They test the MVP with the team, give honest feedback and help decide what comes next.',
    stepsTitle: 'How it works',
    steps: [
      { title: 'Apply', text: 'Tell us who you are, about your company and your main financial challenge.' },
      { title: 'We talk', text: 'The team reviews applications and contacts the selected business owners.' },
      { title: 'Test and influence', text: 'Try the MVP, share feedback and follow the improvements you help define.' },
    ],
    gainsTitle: 'What you get',
    gains: [
      { title: 'Early access', text: 'Try Finer One before launch.' },
      { title: 'Active participation', text: 'Your experience directly shapes the next improvements.' },
      { title: 'Close to the team', text: 'Direct contact with the people building the platform.' },
    ],
    teamTitle: 'Who is building it',
    team: [
      ['Igor Orlandi', 'Technology and Strategic Innovation'],
      ['Henrique Bértolo', 'Strategy and Business Expansion'],
      ['Sebastião Andrade', 'Strategy and Financial Performance'],
    ] as [string, string][],
    formTitle: 'Finer Pioneers application',
    stepOf: (n: number) => `Step ${n} of 3`,
    stepTitles: ['About you', 'Your company', 'Your challenge'],
    next: 'Continue',
    back: 'Back',
    review: 'Your application',
    name: 'Name',
    company: 'Company',
    sector: 'Industry',
    sectorPlaceholder: 'Select the industry',
    sectors: ['Agency / consulting', 'Retail', 'Construction', 'E-commerce', 'Manufacturing', 'Staffing / recruitment', 'Hospitality', 'Health', 'Professional services', 'Technology', 'Transport and logistics', 'Other'],
    email: 'Work email',
    challenge: 'Main financial challenge',
    challengeHint: 'Pick a topic to start or write freely.',
    challengeChips: ['Late payments', 'Cash pressure', 'Rising costs', 'No forecasting', 'Scattered information'],
    challengeExamples: ['E.g. I find it hard to predict when I will run short of cash…', 'E.g. Sales are good, but customers pay late…', 'E.g. I don’t know which costs are growing fastest…'],
    consent: ['I have read the ', 'privacy notice', ' and agree that Finer One may process this data to assess my application and contact me about the programme.'],
    submit: 'Send application',
    sending: 'Sending…',
    secure: 'Your data is only used to assess your application. We never ask for bank details.',
    errors: {
      name: 'Please enter your name.',
      company: 'Please enter the company name.',
      sector: 'Please select the industry.',
      email: 'Please enter a valid email.',
      challenge: 'Describe the challenge in at least 10 characters.',
      consent: 'You need to agree to send the application.',
      rate: 'We received several submissions from this device. Please try again later.',
      network: 'Could not send. Check your connection and try again.',
      server: 'Something went wrong. Please try again in a few minutes.',
    },
    successTitle: 'Application received.',
    successBody: 'Thank you for your interest in building Finer One with us. The team will review your application and contact the selected business owners.',
    previewNote: 'Preview version: the form works, but no data was sent or stored.',
    backHome: 'Back to homepage',
  },
}

type T = (typeof copy)['pt']
type Key = 'name' | 'company' | 'sector' | 'email' | 'challenge' | 'consent'
type Errors = Partial<Record<Key | 'form', string>>
/** Que campos pertencem a cada passo. */
const STEP_FIELDS: Key[][] = [['name', 'email'], ['company', 'sector'], ['challenge', 'consent']]

const EASE = [0.22, 1, 0.36, 1] as const
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const rise: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }

export function PioneersPage() {
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('versao') === 'anterior') return <PioneersPageClassic />
  return (
    <MotionConfig reducedMotion="user">
      <PioneersStory />
    </MotionConfig>
  )
}

function PioneersStory() {
  const { lang } = useLanguage()
  const t = copy[lang]
  return (
    <>
      {/* 1 · Topo: a proposta à esquerda, a candidatura à direita (à maneira da Searchable/Lovable) */}
      <section className="relative isolate overflow-hidden bg-navy-deep pb-16 pt-28 text-white sm:pt-32 lg:pb-24 lg:pt-36">
        <Atmosphere />
        <div className="mx-auto grid max-w-content items-start gap-12 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-16 lg:px-8 xl:gap-24">
          <motion.div variants={group} initial="hidden" animate="show" className="lg:pt-6">
            <motion.p variants={rise} className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7CB8FF]">
              <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-glow" />
              {t.kicker}
            </motion.p>
            <motion.h1 variants={rise} className="mt-6 text-balance font-display text-[36px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[48px] lg:text-[54px]">
              {t.title[0]}
              <span className="text-[#3D86FF] [text-shadow:0_0_28px_rgba(0,82,255,0.45)]">{t.title[1]}</span>
            </motion.h1>
            <motion.p variants={rise} className="mt-6 max-w-[540px] text-[16.5px] leading-[1.6] text-white/[0.78] sm:text-[18px]">
              {t.sub}
            </motion.p>

            {/* A oferta, em destaque */}
            <motion.div variants={rise} className="relative mt-9 max-w-[540px] overflow-hidden rounded-2xl border border-white/[0.12] bg-[linear-gradient(135deg,rgba(0,82,255,0.22),rgba(255,255,255,0.04)_60%)] p-5 backdrop-blur-sm sm:p-6">
              <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-glow/30 blur-3xl" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7CB8FF]">{t.offerLabel}</p>
              <p className="mt-2 font-display text-[19px] font-bold leading-snug tracking-[-0.015em] sm:text-[21px]">{t.offer}</p>
            </motion.div>

            <motion.ul variants={rise} className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-[14px] text-white/80">
              {t.facts.map((f) => (
                <li key={f} className="inline-flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/25 text-glow">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  {f}
                </li>
              ))}
            </motion.ul>

            {/* Quem está a construir (como os "experts" da Searchable) */}
            <motion.div variants={rise} className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {t.team.map(([name], i) => (
                  <span key={name} className={cn('flex h-10 w-10 items-center justify-center rounded-full border-2 border-navy-deep font-display text-[12.5px] font-bold text-white', ['bg-[#0052FF]', 'bg-[#1E3A8A]', 'bg-[#0A40C8]'][i])}>
                    {name.split(' ').map((p) => p[0]).join('')}
                  </span>
                ))}
              </div>
              <p className="text-[13.5px] leading-snug text-white/70">
                {t.builtBy} <span className="text-white">{t.team.map(([n]) => n.split(' ')[0]).join(', ').replace(/, ([^,]*)$/, lang === 'pt' ? ' e $1' : ' and $1')}</span>
              </p>
            </motion.div>

            <motion.a variants={rise} href="#candidatura" className={buttonClasses({ size: 'lg', className: 'group mt-9 font-semibold lg:hidden' })}>
              {t.cta}
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
            </motion.a>
          </motion.div>

          <ApplicationCard t={t} />
        </div>
      </section>

      {/* 2 · O programa, em claro (alternância escuro/claro da identidade) */}
      <section aria-labelledby="pio-programa" className="bg-white text-navy">
        <motion.div variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
            <div>
              <motion.p variants={rise} className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">
                <span aria-hidden="true" className="h-px w-8 bg-accent-deep/60" />
                {t.whatEyebrow}
              </motion.p>
              <motion.h2 variants={rise} id="pio-programa" className="mt-5 text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[44px]">
                {t.whatTitle[0]}
                <span className="text-accent-deep">{t.whatTitle[1]}</span>
              </motion.h2>
              <motion.p variants={rise} className="mt-5 max-w-[460px] text-[16.5px] leading-[1.65] text-[#0B1030]/70">
                {t.whatBody}
              </motion.p>
            </div>

            <div>
              <motion.p variants={rise} className="text-[13px] font-semibold text-[#0B1030]/45">{t.stepsTitle}</motion.p>
              <ol className="relative mt-6">
                <span aria-hidden="true" className="absolute bottom-6 left-[19px] top-6 w-px bg-gradient-to-b from-accent via-accent/40 to-transparent" />
                {t.steps.map((s, i) => (
                  <motion.li variants={rise} key={s.title} className="relative flex gap-5 pb-8 last:pb-0">
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-white font-display text-[13px] font-bold text-accent-deep shadow-[0_0_0_6px_#fff]">0{i + 1}</span>
                    <div className="pt-1.5">
                      <p className="font-display text-[19px] font-bold tracking-[-0.015em] text-[#070D2B]">{s.title}</p>
                      <p className="mt-1.5 max-w-[440px] text-[15px] leading-[1.6] text-[#0B1030]/65">{s.text}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>

          <motion.p variants={rise} className="mt-20 text-[13px] font-semibold text-[#0B1030]/45">{t.gainsTitle}</motion.p>
          <ul className="mt-6 grid gap-x-10 gap-y-8 border-t border-[#0B1030]/[0.08] pt-8 md:grid-cols-3">
            {t.gains.map((g, i) => (
              <motion.li variants={rise} key={g.title}>
                <span className="font-display text-[13px] font-bold text-accent-deep">0{i + 1}</span>
                <p className="mt-3 font-display text-[21px] font-bold tracking-[-0.02em] text-[#070D2B]">{g.title}</p>
                <p className="mt-2 text-[15px] leading-[1.6] text-[#0B1030]/65">{g.text}</p>
              </motion.li>
            ))}
          </ul>

          <motion.p variants={rise} className="mt-20 text-[13px] font-semibold text-[#0B1030]/45">{t.teamTitle}</motion.p>
          <ul className="mt-6 grid gap-x-10 gap-y-6 border-t border-[#0B1030]/[0.08] pt-8 sm:grid-cols-3">
            {t.team.map(([name, role], i) => (
              <motion.li variants={rise} key={name} className="flex items-center gap-4">
                <span aria-hidden="true" className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-[14px] font-bold text-white', ['bg-[#0052FF]', 'bg-[#1E3A8A]', 'bg-[#0A40C8]'][i])}>
                  {name.split(' ').map((p) => p[0]).join('')}
                </span>
                <span>
                  <span className="block font-display text-[17px] font-bold tracking-[-0.01em] text-[#070D2B]">{name}</span>
                  <span className="mt-0.5 block text-[13.5px] text-[#0B1030]/60">{role}</span>
                </span>
              </motion.li>
            ))}
          </ul>

          <motion.div variants={rise} className="mt-16 flex justify-center">
            <a href="#candidatura" className={buttonClasses({ size: 'lg', className: 'group font-semibold' })}>
              {t.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </motion.div>
        </motion.div>
      </section>
    </>
  )
}

/** Fundo do topo: o mundo da identidade a nascer por baixo, como no CTA da homepage. */
function Atmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <img src="/images/cta-earth.webp" alt="" className="absolute inset-x-0 bottom-0 h-[62%] w-full object-cover object-[50%_18%] opacity-90" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#03060F_0%,#03060F_32%,rgba(3,6,15,0.7)_55%,rgba(3,6,15,0.25)_80%,rgba(3,6,15,0.6)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_15%_20%,rgba(0,82,255,0.18),transparent_70%),radial-gradient(40%_40%_at_85%_30%,rgba(30,144,255,0.12),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white/[0.02]" />
    </div>
  )
}

/** Candidatura em 3 passos, com barra de progresso (Searchable) e o mesmo envio de antes. */
function ApplicationCard({ t }: { t: T }) {
  const reduced = useReducedMotion() ?? false
  const startedAt = useRef(Date.now())
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [values, setValues] = useState({ name: '', company: '', sector: '', email: '', challenge: '' })
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [preview, setPreview] = useState(isPreviewMode)

  const set = (key: keyof typeof values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }))
  }

  const check = (keys: Key[]): Errors => {
    const e: Errors = {}
    if (keys.includes('name') && values.name.trim().length < 2) e.name = t.errors.name
    if (keys.includes('email') && !isValidEmail(values.email)) e.email = t.errors.email
    if (keys.includes('company') && values.company.trim().length < 2) e.company = t.errors.company
    if (keys.includes('sector') && !values.sector) e.sector = t.errors.sector
    if (keys.includes('challenge') && values.challenge.trim().length < 10) e.challenge = t.errors.challenge
    if (keys.includes('consent') && !consent) e.consent = t.errors.consent
    return e
  }

  const focusFirst = (e: Errors) => {
    const first = Object.keys(e)[0]
    if (first) window.setTimeout(() => document.getElementById(`pio-${first}`)?.focus(), 60)
  }

  const go = (to: number) => {
    setDir(to > step ? 1 : -1)
    setStep(to)
    window.setTimeout(() => document.getElementById(`pio-${STEP_FIELDS[to][0]}`)?.focus({ preventScroll: true }), reduced ? 0 : 320)
  }

  const next = () => {
    const e = check(STEP_FIELDS[step])
    setErrors(e)
    if (Object.keys(e).length) return focusFirst(e)
    go(step + 1)
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (step < 2) return next()
    const e = check(['name', 'email', 'company', 'sector', 'challenge', 'consent'])
    setErrors(e)
    if (Object.keys(e).length) {
      const firstStep = STEP_FIELDS.findIndex((keys) => keys.some((k) => e[k]))
      if (firstStep !== step) go(firstStep)
      return focusFirst(e)
    }
    setStatus('sending')
    const result = await submitForm('pioneers', { ...values }, { honeypot, startedAt: startedAt.current })
    if (result.ok) {
      setPreview(result.preview)
      setStatus('done')
    } else {
      setErrors({ form: t.errors[result.reason === 'bot' ? 'server' : result.reason] })
      setStatus('idle')
    }
  }

  const addChip = (chip: string) => {
    setErrors((e) => ({ ...e, challenge: undefined }))
    setValues((v) => ({ ...v, challenge: v.challenge.includes(chip) ? v.challenge : v.challenge ? `${v.challenge.trim()} ${chip}.` : `${chip}. ` }))
  }

  const placeholder = useRotatingText(t.challengeExamples, !values.challenge && !reduced)

  return (
    <motion.div
      id="candidatura"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
      className="relative scroll-mt-24 lg:sticky lg:top-24"
    >
      {/* Halo azul por trás do cartão */}
      <div aria-hidden="true" className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(closest-side,rgba(0,82,255,0.35),transparent)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[24px] bg-white text-navy shadow-[0_50px_120px_-40px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.08)]">
        {/* O mundo da plataforma no topo do cartão */}
        <div aria-hidden="true" className="relative h-[92px] overflow-hidden">
          <img src="/images/finer-mundo.webp" alt="" className="h-full w-full object-cover object-top" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_30%,#fff_100%)]" />
        </div>

        <div className="-mt-12 px-6 pb-7 sm:px-8 sm:pb-8">
          {status === 'done' ? (
            <div className="pt-6">
              <FormSuccess title={t.successTitle} body={t.successBody} preview={preview} previewNote={t.previewNote}>
                <a href="/" className={buttonClasses({ variant: 'outline', size: 'md', className: 'mt-7 border-navy/15 bg-white text-navy hover:bg-ice' })}>
                  {t.backHome}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </FormSuccess>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} className="relative [color-scheme:light]" aria-labelledby="pio-form-titulo">
              <h2 id="pio-form-titulo" className="font-display text-[22px] font-bold tracking-[-0.02em] text-[#070D2B] sm:text-[24px]">{t.formTitle}</h2>

              {/* Progresso */}
              <div className="mt-4 flex items-center justify-between text-[12.5px]">
                <span className="font-semibold text-accent-deep" aria-live="polite">
                  {t.stepOf(step + 1)} · <span className="text-[#070D2B]">{t.stepTitles[step]}</span>
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

              <div className="relative mt-7 min-h-[196px]">
                <AnimatePresence mode="wait" initial={false} custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    initial={{ opacity: 0, x: 24 * dir }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 * dir }}
                    transition={{ duration: 0.28, ease: EASE }}
                    className="space-y-5"
                  >
                    {step === 0 && (
                      <>
                        <Field id="pio-name" label={t.name} error={errors.name}>
                          <TextInput id="pio-name" autoComplete="name" maxLength={100} value={values.name} onChange={(e) => set('name')(e.target.value)} error={errors.name} />
                        </Field>
                        <Field id="pio-email" label={t.email} error={errors.email}>
                          <TextInput id="pio-email" type="email" inputMode="email" autoComplete="email" maxLength={254} placeholder="nome@empresa.pt" value={values.email} onChange={(e) => set('email')(e.target.value)} error={errors.email} />
                        </Field>
                      </>
                    )}
                    {step === 1 && (
                      <>
                        <Field id="pio-company" label={t.company} error={errors.company}>
                          <TextInput id="pio-company" autoComplete="organization" maxLength={120} value={values.company} onChange={(e) => set('company')(e.target.value)} error={errors.company} />
                        </Field>
                        <Field id="pio-sector" label={t.sector} error={errors.sector}>
                          <SelectInput id="pio-sector" value={values.sector} onChange={(e) => set('sector')(e.target.value)} error={errors.sector}>
                            <option value="">{t.sectorPlaceholder}</option>
                            {t.sectors.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </SelectInput>
                        </Field>
                      </>
                    )}
                    {step === 2 && (
                      <>
                        {/* Resumo do que já preencheu (como o cartão "Your application" da Searchable) */}
                        <div className="rounded-xl border border-[#0B1030]/[0.07] bg-[#F7F9FE] px-4 py-3 text-[13px]">
                          <p className="font-semibold text-[#070D2B]">{t.review}</p>
                          <p className="mt-1 truncate text-[#0B1030]/65">
                            {values.name} · {values.company} · {values.sector}
                          </p>
                        </div>
                        <Field id="pio-challenge" label={t.challenge} hint={t.challengeHint} error={errors.challenge}>
                          <div className="mb-3 flex flex-wrap gap-2">
                            {t.challengeChips.map((chip) => {
                              const on = values.challenge.includes(chip)
                              return (
                                <button
                                  key={chip}
                                  type="button"
                                  onClick={() => addChip(chip)}
                                  aria-pressed={on}
                                  className={cn('rounded-full border px-3 py-1.5 text-[12.5px] transition-colors', on ? 'border-accent bg-accent text-white' : 'border-navy/15 bg-white text-navy/85 hover:border-accent/50 hover:text-navy')}
                                >
                                  {on ? '✓' : '+'} {chip}
                                </button>
                              )
                            })}
                          </div>
                          <TextArea id="pio-challenge" hasHint maxLength={1500} rows={3} placeholder={placeholder} value={values.challenge} onChange={(e) => set('challenge')(e.target.value)} error={errors.challenge} />
                        </Field>
                        <ConsentCheckbox
                          id="pio-consent"
                          checked={consent}
                          onChange={(v) => {
                            setConsent(v)
                            setErrors((e) => ({ ...e, consent: undefined }))
                          }}
                          error={errors.consent}
                        >
                          {t.consent[0]}
                          <a href="/privacidade/" target="_blank" rel="noopener" className="font-semibold text-accent underline underline-offset-2">
                            {t.consent[1]}
                          </a>
                          {t.consent[2]}
                        </ConsentCheckbox>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {errors.form && (
                <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-[13.5px] text-red-800">
                  {errors.form}
                </p>
              )}

              <div className="mt-7 flex items-center gap-3">
                {step > 0 && (
                  <button type="button" onClick={() => go(step - 1)} className="inline-flex h-12 items-center gap-1.5 rounded-xl px-3 text-[14px] font-semibold text-[#0B1030]/70 transition-colors hover:bg-[#0B1030]/[0.05] hover:text-[#070D2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {t.back}
                  </button>
                )}
                <button type="submit" disabled={status === 'sending'} className={buttonClasses({ size: 'lg', className: 'group flex-1 font-semibold' })}>
                  {step < 2 ? t.next : status === 'sending' ? t.sending : t.submit}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-4 flex items-center justify-center gap-2 text-center text-[12px] text-navy/60">
                <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {t.secure}
              </p>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/** Texto de exemplo que se vai escrevendo e trocando (como o pedido na Lovable). */
function useRotatingText(items: string[], active: boolean) {
  const [i, setI] = useState(0)
  const [n, setN] = useState(active ? 0 : items[0].length)
  useEffect(() => {
    if (!active) {
      setN(items[i].length)
      return
    }
    const full = items[i]
    const id = window.setTimeout(
      () => {
        if (n < full.length) setN(n + 1)
        else {
          setI((i + 1) % items.length)
          setN(0)
        }
      },
      n < full.length ? 38 : 2200,
    )
    return () => window.clearTimeout(id)
  }, [active, i, n, items])
  return items[i].slice(0, Math.max(n, 1))
}
