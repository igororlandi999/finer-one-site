import { useEffect, useRef, useState } from 'react'
import { MotionConfig, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import { TEXT } from '@/components/explore/content'
import type { ExploreText } from '@/components/explore/content'
import { BlueFog, LightArcs } from '@/components/explore/LightArcs'
import { Simulator, initialSim } from '@/components/explore/Simulator'
import type { SimState } from '@/components/explore/Simulator'
import { LeadForm, EMPTY_LEAD } from '@/components/explore/LeadForm'
import type { Lead } from '@/components/explore/LeadForm'
import { Report } from '@/components/explore/Report'
import { Sources } from '@/components/explore/Sources'
import { track } from '@/lib/analytics'

/**
 * Finer One Explore (v3, 21/11/2026) — jornada híbrida:
 * experimentar sem registo → primeira descoberta → convite → formulário curto →
 * análise completa (só depois da confirmação do recetor) → Finer Pioneers.
 * Sem scroll preso, sem ciclos, sem carrosséis; movimento reduzido respeitado.
 */
const EASE = [0.22, 1, 0.36, 1] as const
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const rise: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -12% 0px' } } as const

const scrollTo = (id: string) => window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40)

export function ExplorePage() {
  const { lang } = useLanguage()
  const t = TEXT[lang]
  const [sim, setSim] = useState<SimState>(initialSim)
  const [lead, setLead] = useState<Lead>(EMPTY_LEAD)
  const [formOpen, setFormOpen] = useState(false)
  const [report, setReport] = useState<{ preview: boolean } | null>(null)
  const inp = sim.inputs[sim.scenario]

  useEffect(() => track('explore_view', { lang }, { once: true }), [lang])

  const openForm = () => {
    setFormOpen(true)
    track('lead_form_opened', { scenario: sim.scenario, horizon: inp.horizon })
  }

  return (
    <MotionConfig reducedMotion="user">
      <Hero t={t} onStart={() => scrollTo('simulacao')} />

      <section id="simulacao" aria-labelledby="ex-sim" className="relative flow-root scroll-mt-20 bg-white px-3 pb-14 text-navy sm:px-6 lg:pb-16">
        <SimCard className="relative z-10 mx-auto -mt-24 max-w-[1180px] rounded-[32px] border border-[#0B1030]/[0.06] bg-white p-4 shadow-[0_60px_140px_-60px_rgba(7,13,43,0.55)] sm:-mt-28 sm:p-8 lg:p-10">
          <div className="mb-7 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-accent-deep" aria-hidden="true" />
                {t.simEyebrow}
              </p>
              <h2 id="ex-sim" className="mt-3 text-balance font-display text-[30px] font-bold leading-[1.06] tracking-[-0.035em] text-[#070D2B] sm:text-[40px]">
                {t.simTitle[0]}
                <span className="text-accent-deep">{t.simTitle[1]}</span>
              </h2>
            </div>
            <p className="max-w-[400px] text-[14.5px] leading-relaxed text-[#0B1030]/55">{t.simSub}</p>
          </div>
          <Simulator t={t} lang={lang} sim={sim} setSim={setSim} currency={lead.currency} onReady={openForm} formOpen={formOpen}>
            <LeadForm
              t={t.form}
              lang={lang}
              lead={lead}
              setLead={setLead}
              scenario={sim.scenario}
              horizon={inp.horizon}
              onBack={() => setFormOpen(false)}
              onSuccess={(preview) => {
                setReport({ preview })
                setFormOpen(false)
                scrollTo('relatorio')
              }}
            />
          </Simulator>
        </SimCard>
      </section>

      {report && <Report lang={lang} inp={inp} scenario={sim.scenario} company={lead.company.trim()} currency={lead.currency} preview={report.preview} onAgain={() => scrollTo('simulacao')} />}

      <Sources t={t} lang={lang} />
      <FinalCta t={t} onStart={() => scrollTo('simulacao')} />
    </MotionConfig>
  )
}

/** Cartão do simulador: entra por baixo e abre-se com o scroll (como o palco da homepage). */
function SimCard({ className, children }: { className: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.35'] })
  const inset = useTransform(scrollYProgress, [0, 1], [5, 0])
  const clipPath = useTransform(inset, (v) => `inset(0 ${v}% 0 ${v}% round 32px)`)
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.25 }} style={reduced ? undefined : { clipPath }} className={className}>
      {children}
    </motion.div>
  )
}

/* ---------------- Abertura ---------------- */

function Hero({ t, onStart }: { t: ExploreText; onStart: () => void }) {
  const ref = useRef<HTMLElement>(null)
  return (
    <section ref={ref} aria-labelledby="ex-titulo" className="relative isolate overflow-hidden bg-[#040817] pb-40 pt-32 text-white sm:pb-48 sm:pt-40">
      <LightArcs target={ref} className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden sm:block" />
      <LightArcs target={ref} variant="mobile" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden sm:hidden" />
      <BlueFog />
      <motion.div variants={group} initial="hidden" animate="show" className="relative mx-auto flex max-w-[1100px] flex-col items-center px-5 text-center sm:px-6">
        <motion.p variants={rise} className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[#7CB8FF] sm:tracking-[0.3em]">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-glow" aria-hidden="true" />
          {t.heroEyebrow}
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-glow" aria-hidden="true" />
        </motion.p>
        <h1 id="ex-titulo" className="mt-7 max-w-[980px] text-balance font-display text-[34px] font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-[48px] lg:text-[58px]">
          {t.heroTitle[0]}
          <span className="text-accent [text-shadow:0_0_32px_rgba(0,82,255,0.45)]">{t.heroTitle[1]}</span>
        </h1>
        <motion.p variants={rise} className="mt-7 max-w-[600px] text-[16.5px] leading-[1.6] text-white/[0.78] sm:text-[18px]">{t.heroSub}</motion.p>
        <motion.div variants={rise} className="mt-10 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={onStart}
            className="group inline-flex h-[52px] items-center gap-2 rounded-lg bg-accent px-7 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_30px_-10px_rgba(0,82,255,0.95)] transition-[transform,box-shadow] duration-300 hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_16px_40px_-12px_rgba(30,144,255,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-2 focus-visible:ring-offset-[#040817]"
          >
            {t.start}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
          <p className="flex items-center gap-2 text-[13.5px] text-white/60">
            <Check className="h-3.5 w-3.5 text-[#5CA8FF]" aria-hidden="true" />
            {t.heroNote}
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ---------------- Convite final ---------------- */

function FinalCta({ t, onStart }: { t: ExploreText; onStart: () => void }) {
  const ref = useRef<HTMLElement>(null)
  return (
    <section ref={ref} aria-labelledby="ex-cta" className="relative isolate overflow-hidden bg-[#040817] py-24 text-white lg:py-28">
      <LightArcs target={ref} className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden sm:block" />
      <LightArcs target={ref} variant="mobile" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden sm:hidden" />
      <BlueFog />
      <motion.div variants={group} {...inView} className="relative mx-auto max-w-[860px] px-5 text-center sm:px-6">
        <h2 id="ex-cta" className="text-balance font-display text-[34px] font-bold leading-[1.06] tracking-[-0.035em] sm:text-[52px]">
          {t.ctaTitle[0]}
          <span className="text-glow">{t.ctaTitle[1]}</span>
        </h2>
        <motion.p variants={rise} className="mx-auto mt-5 max-w-[580px] text-[17px] leading-[1.6] text-white/70">{t.ctaSub}</motion.p>
        <motion.div variants={rise} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={onStart} className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-6 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_30px_-10px_rgba(0,82,255,0.95)] transition-transform hover:-translate-y-px">
            {t.start}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
          <a href="/pioneers/" onClick={() => track('pioneers_cta_clicked', { location: 'final' })} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/[0.18] bg-white/[0.04] px-6 text-[15px] font-semibold text-white transition-colors hover:border-white/40">
            {t.ctaPioneers}
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}
