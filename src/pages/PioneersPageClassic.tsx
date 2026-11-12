import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowDown, ArrowRight, Check, Compass, Lock, MessagesSquare, Rocket, Send, Users } from 'lucide-react'
import { ConsentCheckbox, Field, Honeypot, SelectInput, TextArea, TextInput } from '@/components/forms/fields'
import { buttonClasses } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { LuminousLine } from '@/components/v2/LuminousLine'
import { useLanguage } from '@/i18n/LanguageContext'
import { isPreviewMode, isValidEmail, submitForm } from '@/lib/forms'
import { FormSuccess } from '@/pages/FormSuccess'

const copy = {
  pt: {
    kicker: 'Finer Pioneers · Um convite a empresários',
    title: ['As melhores soluções constroem‑se ', 'com quem vive os desafios.'],
    sub: 'Procuramos 10 empresários para testar a Finer One em primeira mão, partilhar a sua experiência e ajudar a definir a evolução da plataforma.',
    cta: 'Candidatar-me',
    facts: ['10 lugares', 'Candidatura em 2 minutos', 'Sem ligar contas para se candidatar'],
    offerLabel: 'Oferta Finer Pioneers',
    offer: 'Primeiro mês grátis + 10% de desconto nos planos mensal e anual do Finer Plus.',
    whatTitle: 'O que é o Finer Pioneers',
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
    formSub: 'Todos os campos são obrigatórios.',
    name: 'Nome',
    company: 'Empresa',
    sector: 'Setor de atividade',
    sectorPlaceholder: 'Selecione o setor',
    sectors: ['Agência / consultoria', 'Comércio', 'Construção', 'E-commerce', 'Indústria', 'Recrutamento / trabalho temporário', 'Restauração e hotelaria', 'Saúde', 'Serviços profissionais', 'Tecnologia', 'Transportes e logística', 'Outro'],
    email: 'Email profissional',
    challenge: 'Principal desafio financeiro',
    challengeHint: 'Escolha um tema para começar ou escreva livremente.',
    challengeChips: ['Recebimentos em atraso', 'Pressão de tesouraria', 'Custos a subir', 'Falta de previsão', 'Informação dispersa'],
    challengePlaceholder: 'Ex.: Tenho dificuldade em prever quando vou ter falta de caixa…',
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
    whatTitle: 'What Finer Pioneers is',
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
    formSub: 'All fields are required.',
    name: 'Name',
    company: 'Company',
    sector: 'Industry',
    sectorPlaceholder: 'Select the industry',
    sectors: ['Agency / consulting', 'Retail', 'Construction', 'E-commerce', 'Manufacturing', 'Staffing / recruitment', 'Hospitality', 'Health', 'Professional services', 'Technology', 'Transport and logistics', 'Other'],
    email: 'Work email',
    challenge: 'Main financial challenge',
    challengeHint: 'Pick a topic to start or write freely.',
    challengeChips: ['Late payments', 'Cash pressure', 'Rising costs', 'No forecasting', 'Scattered information'],
    challengePlaceholder: 'E.g. I find it hard to predict when I will run short of cash…',
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

type Errors = Partial<Record<'name' | 'company' | 'sector' | 'email' | 'challenge' | 'consent' | 'form', string>>

const stepIcons = [Send, MessagesSquare, Rocket]
const gainIcons = [Compass, Users, Check]

export function PioneersPageClassic() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const startedAt = useRef(Date.now())
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

  const validate = (): Errors => {
    const e: Errors = {}
    if (values.name.trim().length < 2) e.name = t.errors.name
    if (values.company.trim().length < 2) e.company = t.errors.company
    if (!values.sector) e.sector = t.errors.sector
    if (!isValidEmail(values.email)) e.email = t.errors.email
    if (values.challenge.trim().length < 10) e.challenge = t.errors.challenge
    if (!consent) e.consent = t.errors.consent
    return e
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      document.getElementById(`pio-${Object.keys(e)[0]}`)?.focus()
      return
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

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <img src="/images/mountain-line.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[70%_40%] opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/30" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-navy" />
          <LuminousLine viewBox="0 0 1600 600" d="M -40 560 C 400 540, 700 420, 980 330 S 1400 140, 1660 90" className="absolute inset-x-0 top-0 h-full w-full opacity-40" delay={300} />
        </div>
        <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-glow backdrop-blur">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {t.kicker}
            </p>
            <h1 className="mt-6 animate-fade-up text-balance font-display text-[34px] font-bold leading-[1.08] tracking-[-0.03em] text-white [animation-delay:100ms] sm:text-[48px] lg:text-[56px]">
              {t.title[0]}
              <span className="text-glow">{t.title[1]}</span>
            </h1>
            <p className="mt-6 max-w-2xl animate-fade-up text-[16px] leading-relaxed text-white/85 [animation-delay:200ms] sm:text-[18px]">{t.sub}</p>
            <div className="mt-9 flex animate-fade-up flex-col gap-5 [animation-delay:300ms] sm:flex-row sm:items-center">
              <a href="#candidatura" className={buttonClasses({ size: 'lg', className: 'group font-semibold' })}>
                {t.cta}
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
              </a>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-white/85">
                {t.facts.map((f) => (
                  <li key={f} className="inline-flex items-center gap-2">
                    <Check className="h-4 w-4 text-glow" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Programa */}
      <section aria-labelledby="pio-programa" className="bg-navy pb-24">
        <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
          <Reveal className="grid gap-10 border-t border-white/10 pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
              <h2 id="pio-programa" className="font-display text-[28px] font-bold tracking-[-0.02em] text-white sm:text-[34px]">{t.whatTitle}</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-white/80">{t.whatBody}</p>
            </div>
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.22em] text-glow">{t.stepsTitle}</h3>
              <ol className="mt-5 space-y-3">
                {t.steps.map((s, i) => {
                  const Icon = stepIcons[i]
                  return (
                    <li key={s.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-glow">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-display text-[16px] font-bold text-white">
                          <span className="mr-2 text-glow">0{i + 1}</span>
                          {s.title}
                        </p>
                        <p className="mt-1 text-[14.5px] leading-relaxed text-white/80">{s.text}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </Reveal>

          <Reveal className="mt-16">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.22em] text-glow">{t.gainsTitle}</h2>
            <p className="mt-5 border-y border-white/10 py-5 font-display text-[19px] font-semibold leading-snug tracking-[-0.01em] text-white sm:text-[22px]">
              <span className="mr-2 text-glow">{t.offerLabel}:</span>
              {t.offer}
            </p>
            <ul className="mt-5 grid gap-4 md:grid-cols-3">
              {t.gains.map((g, i) => {
                const Icon = gainIcons[i]
                return (
                  <li key={g.title} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6">
                    <Icon className="h-5 w-5 text-glow" aria-hidden="true" />
                    <p className="mt-5 font-display text-[18px] font-bold text-white">{g.title}</p>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-white/80">{g.text}</p>
                  </li>
                )
              })}
            </ul>
          </Reveal>

          <Reveal className="mt-16">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.22em] text-glow">{t.teamTitle}</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-3">
              {t.team.map(([name, role]) => (
                <li key={name} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/20 font-display text-[14px] font-bold text-white">
                    {name.split(' ').map((p) => p[0]).join('')}
                  </span>
                  <span>
                    <span className="block font-semibold text-white">{name}</span>
                    <span className="block text-[13px] text-white/75">{role}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Formulário */}
      <section id="candidatura" aria-labelledby="pio-form-titulo" className="scroll-mt-20 bg-navy px-3 pb-24 sm:px-4">
        <div className="mx-auto max-w-[760px] rounded-[28px] bg-white p-6 shadow-[0_50px_120px_-50px_rgba(0,0,0,0.9)] sm:p-10">
          {status === 'done' ? (
            <FormSuccess title={t.successTitle} body={t.successBody} preview={preview} previewNote={t.previewNote}>
              <a href="/" className={buttonClasses({ variant: 'outline', size: 'md', className: 'mt-7 border-navy/15 bg-white text-navy hover:bg-ice' })}>
                {t.backHome}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </FormSuccess>
          ) : (
            <form noValidate onSubmit={onSubmit} className="relative [color-scheme:light]">
              <h2 id="pio-form-titulo" className="font-display text-[24px] font-bold tracking-[-0.01em] text-navy sm:text-[28px]">{t.formTitle}</h2>
              <p className="mt-1 text-[13.5px] text-navy/75">{t.formSub}</p>

              <Honeypot value={honeypot} onChange={setHoneypot} />

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field id="pio-name" label={t.name} error={errors.name}>
                  <TextInput id="pio-name" autoComplete="name" maxLength={100} value={values.name} onChange={(e) => set('name')(e.target.value)} error={errors.name} />
                </Field>
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
                <Field id="pio-email" label={t.email} error={errors.email}>
                  <TextInput id="pio-email" type="email" inputMode="email" autoComplete="email" maxLength={254} placeholder="nome@empresa.pt" value={values.email} onChange={(e) => set('email')(e.target.value)} error={errors.email} />
                </Field>
              </div>

              <div className="mt-5">
                <Field id="pio-challenge" label={t.challenge} hint={t.challengeHint} error={errors.challenge}>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {t.challengeChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => addChip(chip)}
                        className="rounded-full border border-navy/15 bg-ice px-3 py-1.5 text-[12.5px] text-navy/85 transition-colors hover:border-accent/50 hover:text-navy"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                  <TextArea id="pio-challenge" hasHint maxLength={1500} placeholder={t.challengePlaceholder} value={values.challenge} onChange={(e) => set('challenge')(e.target.value)} error={errors.challenge} />
                </Field>
              </div>

              <div className="mt-6">
                <ConsentCheckbox id="pio-consent" checked={consent} onChange={(v) => { setConsent(v); setErrors((e) => ({ ...e, consent: undefined })) }} error={errors.consent}>
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

              <button type="submit" disabled={status === 'sending'} className={buttonClasses({ size: 'lg', className: 'mt-7 w-full font-semibold' })}>
                {status === 'sending' ? t.sending : t.submit}
              </button>
              <p className="mt-4 flex items-center justify-center gap-2 text-center text-[12.5px] text-navy/75">
                <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {t.secure}
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
