import { useEffect, useRef, useState } from 'react'
import { MotionConfig, motion, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowRight, ArrowUp } from 'lucide-react'
import { buttonClasses } from '@/components/ui/Button'
import { useLanguage } from '@/i18n/LanguageContext'
import { COPY } from '@/components/explore/copy'
import type { ExploreCopy } from '@/components/explore/copy'
import { BlueFog, LightArcs } from '@/components/explore/LightArcs'
import { SourceStory } from '@/components/explore/SourceStory'
import { Workspace } from '@/components/explore/Workspace'
import type { Mode, Phase, Preset } from '@/components/explore/Workspace'
import { cn } from '@/lib/utils'

/**
 * Explorar — experiência interativa de tesouraria (proposta aprovada a 21/11/2026).
 * Abertura navy com os arcos de luz da marca e nevoeiro azul (à maneira da
 * Lovable) e uma caixa de pergunta que abre a simulação; o simulador sobe por
 * cima da abertura; segue-se o scroll-telling das fontes, a ponte para a
 * plataforma e o convite final. O registo (empresa, contacto e telefone) é
 * pedido antes da simulação com os números da própria empresa.
 */
const EASE = [0.22, 1, 0.36, 1] as const
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const rise: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -12% 0px' } } as const

const PRESETS: Omit<Preset, 'key'>[] = [
  { scenario: 'treasury', adjust: { itemShift: { r4: 20 } } },
  { scenario: 'treasury', adjust: { itemShift: { p2: 15 } } },
  { scenario: 'order', adjust: {} },
]

export function ExplorePage() {
  const { lang } = useLanguage()
  const t = COPY[lang]
  const [phase, setPhase] = useState<Phase>('sim')
  const [mode, setMode] = useState<Mode>('example')
  const [preset, setPreset] = useState<Preset | undefined>(undefined)

  const scrollToSim = () => window.setTimeout(() => document.getElementById('simulacao')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  const goTo = (p: Phase, m?: Mode) => {
    if (m) setMode(m)
    setPhase(p)
    scrollToSim()
  }
  const run = (i: number) => {
    setPreset({ key: Date.now(), ...PRESETS[i] })
    if (mode !== 'own') setMode('example')
    setPhase('sim')
    scrollToSim()
  }

  return (
    <MotionConfig reducedMotion="user">
      <Hero t={t} onRun={run} onOwn={() => goTo('lead')} />

      {/* Simulador: o cartão sobe por cima da abertura */}
      <section id="simulacao" aria-labelledby="ex-work" className="relative flow-root scroll-mt-20 bg-white px-3 pb-24 text-navy sm:px-6">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.35 }} className="relative z-10 mx-auto -mt-28 max-w-[1180px] rounded-[32px] border border-[#0B1030]/[0.06] bg-white p-4 shadow-[0_60px_140px_-60px_rgba(7,13,43,0.55)] sm:-mt-32 sm:p-8 lg:p-10">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-accent-deep">{t.workEyebrow}</p>
              <h2 id="ex-work" className="mt-2 font-display text-[28px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#070D2B] sm:text-[36px]">
                {t.workTitle[0]}
                <span className="text-accent-deep">{t.workTitle[1]}</span>
              </h2>
            </div>
            <p className="max-w-[380px] text-[14.5px] leading-relaxed text-[#0B1030]/55">{t.workSub}</p>
          </div>
          <Workspace t={t} lang={lang} phase={phase} setPhase={(p) => goTo(p)} mode={mode} setMode={setMode} preset={preset} />
        </motion.div>
      </section>

      <SourceStory t={t} lang={lang} onSimulate={() => goTo(mode === 'own' ? 'sim' : 'lead')} />
      <Bridge t={t} />
      <FinalCta t={t} onStart={() => goTo('lead')} />
    </MotionConfig>
  )
}

/* ---------------- Abertura ---------------- */

function Hero({ t, onRun, onOwn }: { t: ExploreCopy; onRun: (i: number) => void; onOwn: () => void }) {
  const ref = useRef<HTMLElement>(null)
  return (
    <section ref={ref} aria-labelledby="ex-titulo" className="relative isolate overflow-hidden bg-[#040817] pb-44 pt-32 text-white sm:pb-52 sm:pt-36">
      <LightArcs target={ref} className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden sm:block" />
      <LightArcs target={ref} variant="mobile" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden sm:hidden" />
      <BlueFog />
      <motion.div variants={group} initial="hidden" animate="show" className="relative mx-auto flex max-w-[1200px] flex-col items-center px-5 text-center sm:px-6">
        <motion.span variants={rise} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-1.5 text-[12.5px] font-medium text-white/80 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5CA8FF] shadow-[0_0_10px_#5CA8FF]" />
          {t.heroBadge}
        </motion.span>
        <motion.h1 variants={rise} id="ex-titulo" className="mt-7 max-w-[920px] font-display text-[42px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[64px] lg:text-[78px]">
          {t.heroTitle[0]}
          <br className="hidden sm:block" />
          <span className="bg-[linear-gradient(90deg,#B9D8FF_0%,#5CA8FF_45%,#1E90FF_100%)] bg-clip-text text-transparent">{t.heroTitle[1]}</span>
        </motion.h1>
        <motion.p variants={rise} className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-white/65 sm:text-[18px]">{t.heroSub}</motion.p>
        <motion.div variants={rise} className="mt-11 w-full max-w-[720px]">
          <PromptBox t={t} onRun={onRun} />
        </motion.div>
        <motion.div variants={rise} className="mt-6 flex flex-col items-center gap-2 text-[13px] sm:flex-row sm:gap-4">
          <span className="text-white/45">{t.heroNote}</span>
          <span aria-hidden="true" className="hidden h-3 w-px bg-white/20 sm:block" />
          <button type="button" onClick={onOwn} className="inline-flex items-center gap-1.5 font-semibold text-white/85 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white">
            {t.promptOwn}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}

/** Caixa de pergunta (como o "Peça" da Lovable): escreve a pergunta, roda sozinha até alguém escolher. */
function PromptBox({ t, onRun }: { t: ExploreCopy; onRun: (i: number) => void }) {
  const reduced = useReducedMotion() ?? false
  const [idx, setIdx] = useState(0)
  const [touched, setTouched] = useState(false)
  const [chars, setChars] = useState(0)
  const parts = t.prompts[idx].q
  const full = parts.join('')

  // Escrita letra a letra
  useEffect(() => {
    if (reduced) return setChars(full.length)
    setChars(0)
    let n = 0
    const id = window.setInterval(() => {
      n += 1
      setChars(n)
      if (n >= full.length) window.clearInterval(id)
    }, 34)
    return () => window.clearInterval(id)
  }, [full, reduced])

  // Roda as perguntas até o visitante escolher uma
  useEffect(() => {
    if (touched || reduced) return
    const id = window.setTimeout(() => setIdx((i) => (i + 1) % t.prompts.length), 5200)
    return () => window.clearTimeout(id)
  }, [idx, touched, reduced, t.prompts.length])

  // Mostra as partes já escritas, com as palavras-chave em destaque
  let left = chars
  const shown = parts.map((p, i) => {
    const take = Math.max(0, Math.min(p.length, left))
    left -= p.length
    const txt = p.slice(0, take)
    if (!txt) return null
    if (i === 1) return <b key={i} className="font-semibold">{txt}</b>
    if (i === 3) return <span key={i} className="rounded-md bg-[#EAF2FF] px-1.5 font-medium text-[#0A40C8]">{txt}</span>
    return <span key={i}>{txt}</span>
  })

  return (
    <div className="rounded-[26px] bg-white p-2.5 text-left shadow-[0_30px_120px_-20px_rgba(30,144,255,0.6),0_0_0_1px_rgba(255,255,255,0.35)]">
      <p className="min-h-[64px] px-4 pb-1 pt-3 text-[17px] leading-relaxed text-[#070D2B] sm:min-h-[40px] sm:text-[18px]" aria-live="polite" aria-label={full}>
        <span aria-hidden="true">
          {shown}
          <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-1 animate-pulse bg-[#0052FF]" />
        </span>
      </p>
      <div className="mt-4 flex items-center justify-between gap-3 px-1.5 pb-1">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.heroBadge}>
          {t.prompts.map((p, i) => (
            <button
              key={p.chip}
              type="button"
              aria-pressed={i === idx}
              onClick={() => {
                setTouched(true)
                setIdx(i)
              }}
              className={cn('rounded-full px-3.5 py-1.5 text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent', i === idx ? 'bg-[#070D2B] font-medium text-white' : 'bg-[#F2F4F8] text-[#0B1030]/70 hover:bg-[#E8ECF4]')}
            >
              {p.chip}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onRun(idx)}
          aria-label={t.promptRun}
          className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0052FF] shadow-[0_8px_24px_-6px_rgba(0,82,255,0.9)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
        >
          <ArrowUp className="h-4 w-4 text-white transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/* ---------------- Ponte para a plataforma ---------------- */

function Bridge({ t }: { t: ExploreCopy }) {
  return (
    <section aria-labelledby="ex-bridge" className="bg-white py-24 text-navy lg:py-32">
      <motion.div variants={group} {...inView} className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[760px] text-center">
          <motion.p variants={rise} className="text-[12px] font-semibold uppercase tracking-[0.24em] text-accent-deep">{t.bridgeEyebrow}</motion.p>
          <motion.h2 variants={rise} id="ex-bridge" className="mt-4 font-display text-[34px] font-semibold leading-[1.06] tracking-[-0.04em] text-[#070D2B] sm:text-[48px]">
            {t.bridgeTitle[0]}
            <span className="text-accent-deep">{t.bridgeTitle[1]}</span>
          </motion.h2>
          <motion.p variants={rise} className="mx-auto mt-5 max-w-[580px] text-[17px] leading-[1.6] text-[#0B1030]/60">{t.bridgeSub}</motion.p>
        </div>
        <ul className="mt-16 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {t.bridge.map((b, i) => (
            <motion.li key={b.name} variants={rise} className="relative pt-7">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[#0B1030]/10" />
              <motion.span aria-hidden="true" className="absolute left-0 top-0 h-[2px] w-full origin-left bg-[linear-gradient(90deg,#0052FF,#5CA8FF)] shadow-[0_0_12px_rgba(30,144,255,0.6)]" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.12 }} />
              <h3 className="font-display text-[20px] font-semibold tracking-[-0.02em] text-[#070D2B]">{b.name}</h3>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-[#0B1030]/60">{b.text}</p>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}

/* ---------------- Convite final ---------------- */

function FinalCta({ t, onStart }: { t: ExploreCopy; onStart: () => void }) {
  const ref = useRef<HTMLElement>(null)
  return (
    <section ref={ref} aria-labelledby="ex-cta" className="relative isolate overflow-hidden bg-[#040817] py-28 text-white lg:py-36">
      <LightArcs target={ref} className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden sm:block" />
      <LightArcs target={ref} variant="mobile" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden sm:hidden" />
      <BlueFog />
      <motion.div variants={group} {...inView} className="relative mx-auto max-w-[860px] px-5 text-center sm:px-6">
        <motion.h2 variants={rise} id="ex-cta" className="text-balance font-display text-[36px] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-[56px]">
          {t.ctaTitle[0]}
          <span className="bg-[linear-gradient(90deg,#B9D8FF,#5CA8FF,#1E90FF)] bg-clip-text text-transparent">{t.ctaTitle[1]}</span>
        </motion.h2>
        <motion.p variants={rise} className="mx-auto mt-5 max-w-[560px] text-[17px] leading-[1.6] text-white/65">{t.ctaSub}</motion.p>
        <motion.div variants={rise} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={onStart} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-[#070D2B] shadow-[0_20px_60px_-20px_rgba(30,144,255,0.9)] transition-transform hover:-translate-y-0.5">
            {t.start}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <a href="/#demo" className={buttonClasses({ size: 'lg', className: 'font-semibold' })}>
            {t.ctaSee}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="/pioneers/" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-[15px] font-semibold text-white transition-colors hover:border-white">
            {t.ctaPioneers}
          </a>
        </motion.div>
        <motion.a variants={rise} href="/lista-espera/" className="mt-6 inline-block text-[14px] font-medium text-white/60 underline decoration-white/25 underline-offset-4 hover:text-white">
          {t.ctaWaitlist}
        </motion.a>
      </motion.div>
    </section>
  )
}
