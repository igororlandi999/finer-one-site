import { useMemo, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react'
import { buttonClasses } from '@/components/ui/Button'
import { useLanguage } from '@/i18n/LanguageContext'
import { CashChart } from '@/components/explore/CashChart'
import { COPY, EVIDENCE } from '@/components/explore/copy'
import type { ExploreCopy, Lang } from '@/components/explore/copy'
import { Workspace } from '@/components/explore/Workspace'
import type { Mode, Phase } from '@/components/explore/Workspace'
import { NO_ADJUST, addDays, compare, sampleInputs, today } from '@/lib/explore/model'
import { cn } from '@/lib/utils'

/**
 * Explorar (21/11/2026) — experiência interativa de tesouraria e geração de leads.
 * Percurso: perceber o problema → "Iniciar simulação" → empresa e contacto
 * (guardados antes da simulação personalizada) → valores → resultados e
 * comparação → leitura do Finer Advisor → ponte para a plataforma e CTA.
 * "Explorar um exemplo" mostra uma empresa de exemplo sem pedir dados.
 */
const EASE = [0.22, 1, 0.36, 1] as const
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const rise: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -12% 0px' } } as const

export function ExplorePage() {
  const { lang } = useLanguage()
  const t = COPY[lang]
  const [phase, setPhase] = useState<Phase>('intro')
  const [mode, setMode] = useState<Mode>('example')

  const goTo = (p: Phase, m?: Mode) => {
    if (m) setMode(m)
    setPhase(p)
    window.setTimeout(() => document.getElementById('simulacao')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  return (
    <MotionConfig reducedMotion="user">
      <Hero t={t} lang={lang} onStart={() => goTo('lead')} onExample={() => goTo('sim', 'example')} />
      <Context t={t} lang={lang} />

      <section id="simulacao" aria-labelledby="ex-work" className="scroll-mt-20 bg-[#F7F9FE] py-20 text-navy lg:py-28">
        <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
          <motion.div variants={group} {...inView} className="mx-auto max-w-[680px] text-center">
            <motion.p variants={rise} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">{t.workEyebrow}</motion.p>
            <motion.h2 variants={rise} id="ex-work" className="mt-4 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.035em] text-[#070D2B] sm:text-[44px]">
              {t.workTitle[0]}
              <span className="text-accent-deep">{t.workTitle[1]}</span>
            </motion.h2>
            <motion.p variants={rise} className="mt-4 text-[17px] leading-[1.6] text-[#0B1030]/65">{t.workSub}</motion.p>
          </motion.div>
          <div className="mt-12">
            <Workspace t={t} lang={lang} phase={phase} setPhase={(p) => goTo(p)} mode={mode} setMode={setMode} />
          </div>
        </div>
      </section>

      <Bridge t={t} />
      <FinalCta t={t} />
    </MotionConfig>
  )
}

/* 1 · Abertura com uma projeção que mergulha abaixo de zero e recupera */
function Hero({ t, lang, onStart, onExample }: { t: ExploreCopy; lang: Lang; onStart: () => void; onExample: () => void }) {
  const preview = useMemo(() => compare('treasury', sampleInputs(), NO_ADJUST), [])
  const base = today()
  const df = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-PT' : 'en-GB', { day: 'numeric', month: 'short' })
  const money = (n: number) => new Intl.NumberFormat(lang === 'pt' ? 'pt-PT' : 'en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, notation: 'compact' }).format(n)
  return (
    <section aria-labelledby="ex-titulo" className="relative overflow-hidden bg-white pb-16 pt-32 text-navy sm:pt-36 lg:pb-24">
      <div className="mx-auto grid max-w-content items-center gap-12 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:px-8">
        <motion.div variants={group} initial="hidden" animate="show">
          <motion.p variants={rise} className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">
            <span aria-hidden="true" className="h-px w-8 bg-accent-deep/60" />
            {t.eyebrow}
          </motion.p>
          <motion.h1 variants={rise} id="ex-titulo" className="mt-6 text-balance font-display text-[40px] font-bold leading-[1.02] tracking-[-0.04em] text-[#070D2B] sm:text-[56px] lg:text-[62px]">
            {t.heroTitle[0]}
            <span className="text-accent-deep">{t.heroTitle[1]}</span>
          </motion.h1>
          <motion.p variants={rise} className="mt-6 max-w-[520px] text-[17px] leading-[1.6] text-[#0B1030]/65 sm:text-[18.5px]">{t.heroSub}</motion.p>
          <motion.div variants={rise} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onStart} className={buttonClasses({ size: 'lg', className: 'font-semibold' })}>
              {t.start}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={onExample} className={buttonClasses({ variant: 'outline', size: 'lg', className: 'border-[#0B1030]/15 bg-white text-[#070D2B] hover:bg-[#F7F9FE]' })}>
              {t.example}
            </button>
          </motion.div>
          <motion.p variants={rise} className="mt-5 text-[13px] text-[#0B1030]/50">{t.heroNote}</motion.p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.25 }} className="relative">
          <div aria-hidden="true" className="absolute -inset-8 -z-10 rounded-[40px] bg-[radial-gradient(60%_60%_at_60%_40%,rgba(0,82,255,0.12),transparent_70%)]" />
          <div className="rounded-[28px] border border-[#0B1030]/[0.08] bg-white p-5 shadow-[0_50px_100px_-60px_rgba(7,13,43,0.55)] sm:p-6">
            <CashChart
              compact
              current={preview.current.series}
              simulated={preview.current.series}
              minDay={preview.current.minDay}
              money={money}
              shortDate={(d) => df.format(addDays(base, d))}
              zeroLabel={lang === 'pt' ? 'Zero' : 'Zero'}
              label={t.heroChartLabel}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* 2 · Contexto internacional — dados com fonte, período e definição */
function Context({ t, lang }: { t: ExploreCopy; lang: Lang }) {
  const [open, setOpen] = useState(false)
  const featured = EVIDENCE.filter((e) => e.featured)
  return (
    <section aria-labelledby="ex-context" className="bg-white pb-20 text-navy lg:pb-28">
      <motion.div variants={group} {...inView} className="mx-auto max-w-content border-t border-[#0B1030]/[0.08] px-5 pt-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div>
            <motion.p variants={rise} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">{t.contextEyebrow}</motion.p>
            <motion.h2 variants={rise} id="ex-context" className="mt-4 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.035em] text-[#070D2B] sm:text-[42px]">
              {t.contextTitle[0]}
              <span className="text-accent-deep">{t.contextTitle[1]}</span>
            </motion.h2>
          </div>
          <motion.p variants={rise} className="self-end text-[17px] leading-[1.6] text-[#0B1030]/65">{t.contextSub}</motion.p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {featured.map((e) => (
            <motion.a
              key={e.id}
              variants={rise}
              href={e.url}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-[24px] border border-[#0B1030]/[0.08] bg-white p-6 transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-[0_30px_60px_-45px_rgba(0,82,255,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="font-display text-[44px] font-bold leading-none tracking-[-0.04em] text-accent-deep">{e.value[lang]}</span>
              <span className="mt-3 text-[15px] leading-[1.5] text-[#070D2B]">{e.label[lang]}</span>
              <span className="mt-auto pt-5 text-[12.5px] leading-[1.5] text-[#0B1030]/55">
                {e.institution} · {e.geography[lang]} · {e.period[lang]}
              </span>
              <span className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent-deep">
                {t.sourceLink}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </motion.a>
          ))}
        </div>

        <motion.p variants={rise} className="mt-5 text-[13px] leading-[1.6] text-[#0B1030]/55">{t.contextDisclaimer}</motion.p>

        <motion.div variants={rise} className="mt-6">
          <button type="button" aria-expanded={open} aria-controls="ex-sources" onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-2 rounded-full border border-[#0B1030]/15 px-5 py-2.5 text-[14px] font-semibold text-[#070D2B] transition-colors hover:border-[#070D2B]">
            {open ? t.hideSources : t.sources}
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', open && 'rotate-180')} aria-hidden="true" />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div id="ex-sources" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
                <ul className="mt-6 divide-y divide-[#0B1030]/[0.08] rounded-[24px] border border-[#0B1030]/[0.08]">
                  {EVIDENCE.map((e) => (
                    <li key={e.id} className="grid gap-4 p-6 md:grid-cols-[140px_minmax(0,1fr)]">
                      <span className="font-display text-[30px] font-bold leading-none tracking-[-0.03em] text-accent-deep">{e.value[lang]}</span>
                      <dl className="grid gap-x-8 gap-y-3 text-[13.5px] sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <dt className="sr-only">{t.sourceDefinition}</dt>
                          <dd className="text-[15px] leading-[1.55] text-[#070D2B]">{e.label[lang]}. {e.definition[lang]}</dd>
                        </div>
                        <div>
                          <dt className="text-[#0B1030]/45">{t.sourceInstitution}</dt>
                          <dd className="mt-0.5 font-medium text-[#070D2B]">{e.institution}</dd>
                        </div>
                        <div>
                          <dt className="text-[#0B1030]/45">{t.sourceGeography}</dt>
                          <dd className="mt-0.5 font-medium text-[#070D2B]">{e.geography[lang]}</dd>
                        </div>
                        <div>
                          <dt className="text-[#0B1030]/45">{t.sourcePeriod}</dt>
                          <dd className="mt-0.5 font-medium text-[#070D2B]">{e.period[lang]}</dd>
                        </div>
                        <div>
                          <dt className="sr-only">URL</dt>
                          <dd className="mt-0.5">
                            <a href={e.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-accent-deep underline decoration-accent-deep/30 underline-offset-4">
                              {t.sourceLink}
                              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* 7a · Ponte para a plataforma (funcionalidades que existem no plano Plus) */
function Bridge({ t }: { t: ExploreCopy }) {
  return (
    <section aria-labelledby="ex-bridge" className="bg-white py-20 text-navy lg:py-28">
      <motion.div variants={group} {...inView} className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <motion.p variants={rise} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">{t.bridgeEyebrow}</motion.p>
            <motion.h2 variants={rise} id="ex-bridge" className="mt-4 font-display text-[32px] font-bold leading-[1.06] tracking-[-0.035em] text-[#070D2B] sm:text-[40px]">
              {t.bridgeTitle[0]}
              <span className="text-accent-deep">{t.bridgeTitle[1]}</span>
            </motion.h2>
          </div>
          <motion.p variants={rise} className="self-end text-[17px] leading-[1.6] text-[#0B1030]/65">{t.bridgeSub}</motion.p>
        </div>
        <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {t.bridge.map((b, i) => (
            <motion.li key={b.name} variants={rise} className="relative pt-6">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[#0B1030]/10" />
              <motion.span aria-hidden="true" className="absolute left-0 top-0 h-[2px] w-full origin-left bg-accent" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.12 }} />
              <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-[#070D2B]">{b.name}</h3>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-[#0B1030]/65">{b.text}</p>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}

/* 7b · Convite final */
function FinalCta({ t }: { t: ExploreCopy }) {
  return (
    <section aria-labelledby="ex-cta" className="relative isolate overflow-hidden bg-[#070D2B] py-24 text-white lg:py-32">
      <img src="/images/sobre-linha.webp" alt="" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[6%] -z-10 h-[140px] w-full object-cover object-[65%_50%] opacity-80 mix-blend-screen" style={{ maskImage: 'linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)' }} />
      <motion.div variants={group} {...inView} className="mx-auto max-w-[820px] px-5 text-center sm:px-6">
        <motion.h2 variants={rise} id="ex-cta" className="text-balance font-display text-[34px] font-bold leading-[1.06] tracking-[-0.035em] sm:text-[48px]">
          {t.ctaTitle[0]}
          <span className="text-[#3D86FF]">{t.ctaTitle[1]}</span>
        </motion.h2>
        <motion.p variants={rise} className="mx-auto mt-5 max-w-[560px] text-[17px] leading-[1.6] text-white/70">{t.ctaSub}</motion.p>
        <motion.div variants={rise} className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/#demo" className={buttonClasses({ size: 'lg', className: 'font-semibold' })}>
            {t.ctaSee}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="/pioneers/" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-[15px] font-semibold text-white transition-colors hover:border-white">
            {t.ctaPioneers}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.div>
        <motion.a variants={rise} href="/lista-espera/" className="mt-6 inline-block text-[14px] font-medium text-white/65 underline decoration-white/25 underline-offset-4 hover:text-white">
          {t.ctaWaitlist}
        </motion.a>
      </motion.div>
    </section>
  )
}
