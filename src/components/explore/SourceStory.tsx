import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EVIDENCE } from './copy'
import type { Evidence, ExploreCopy, Lang } from './copy'
import { BlueFog } from './LightArcs'

/**
 * Scroll-telling das fontes: a secção fica fixa enquanto se faz scroll e cada
 * dado entra a seu tempo — número a contar e a ganhar nitidez, fonte ao lado,
 * linha luminosa a encher. Ordem: Europa → Reino Unido → EUA → mundo → Portugal.
 * Com movimento reduzido mostra a lista completa, sem fixar.
 */
const ORDER = ['eu', 'uk', 'fed', 'ifc', 'bdp']
const EASE = [0.22, 1, 0.36, 1] as const

export function SourceStory({ t, lang, onSimulate }: { t: ExploreCopy; lang: Lang; onSimulate: () => void }) {
  const reduced = useReducedMotion() ?? false
  const items = ORDER.map((id) => EVIDENCE.find((e) => e.id === id)!).filter(Boolean)
  const steps = items.length + 2 // abertura + dados + fecho
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 })
  const [step, setStep] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setStep(Math.min(steps - 1, Math.max(0, Math.floor(v * steps * 0.999)))))

  if (reduced) {
    return (
      <section aria-labelledby="ex-story" className="relative bg-[#040817] px-5 py-24 text-white sm:px-6">
        <div className="mx-auto max-w-content">
          <h2 id="ex-story" className="font-display text-[34px] font-semibold tracking-[-0.035em] sm:text-[48px]">
            {t.storyIntroTitle[0]}
            <span className="text-[#7CB8FF]">{t.storyIntroTitle[1]}</span>
          </h2>
          <ul className="mt-12 grid gap-6 md:grid-cols-2">
            {items.map((e) => (
              <li key={e.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <p className="font-display text-[44px] font-semibold tracking-[-0.04em] text-[#9CC8FF]">{e.value[lang]}</p>
                <p className="mt-2 text-[16px] text-white/85">{e.label[lang]}</p>
                <SourceMeta e={e} t={t} lang={lang} />
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[13px] text-white/50">{t.contextDisclaimer}</p>
        </div>
      </section>
    )
  }

  const current = step >= 1 && step <= items.length ? items[step - 1] : null

  return (
    <section aria-labelledby="ex-story" className="relative bg-[#040817] text-white">
      <div ref={ref} style={{ height: `${steps * 85}svh` }} className="relative">
        <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
          <BlueFog />
          {/* Linha luminosa de progresso (motivo da marca) */}
          <div aria-hidden="true" className="absolute bottom-0 left-5 top-0 w-px bg-white/10 sm:left-8 lg:left-[max(2rem,calc((100vw-1200px)/2))]">
            <motion.div style={{ scaleY: fill }} className="h-full w-full origin-top bg-[linear-gradient(180deg,#7CB8FF,#0052FF)] shadow-[0_0_14px_#1E90FF]" />
          </div>

          <div className="relative mx-auto w-full max-w-content px-10 pt-14 sm:px-14 sm:pt-0 lg:px-16">
            <h2 id="ex-story" className="sr-only">
              {t.storyIntroTitle[0]}
              {t.storyIntroTitle[1]}
            </h2>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="intro" initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }} transition={{ duration: 0.6, ease: EASE }} className="max-w-[860px]">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#7CB8FF]">{t.storyEyebrow}</p>
                  <p className="mt-5 font-display text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[64px] lg:text-[76px]">
                    {t.storyIntroTitle[0]}
                    <span className="bg-[linear-gradient(90deg,#9CC8FF,#3D86FF)] bg-clip-text text-transparent">{t.storyIntroTitle[1]}</span>
                  </p>
                  <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-white/60">{t.storyIntroSub}</p>
                  <p className="mt-10 inline-flex items-center gap-2 text-[13px] text-white/45">
                    <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
                    {t.scrollHint}
                  </p>
                </motion.div>
              )}

              {current && (
                <motion.div key={current.id} initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -40, filter: 'blur(12px)' }} transition={{ duration: 0.65, ease: EASE }} className="grid items-center gap-5 sm:gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#7CB8FF]">
                      {String(step).padStart(2, '0')} / {String(items.length).padStart(2, '0')} · {current.geography[lang]}
                    </p>
                    <CountUp key={current.id + lang} e={current} lang={lang} />
                    <p className="mt-3 max-w-[560px] text-[17px] leading-[1.4] text-white/85 sm:mt-4 sm:text-[24px]">{current.label[lang]}</p>
                    {current.extra && (
                      <ul className="mt-4 flex flex-wrap gap-2 sm:mt-6">
                        {current.extra[lang].map((x) => (
                          <li key={x} className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[12px] text-white/75 sm:px-3.5 sm:py-1.5 sm:text-[13px]">{x}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl sm:rounded-[28px] sm:p-7">
                    <SourceMeta e={current} t={t} lang={lang} />
                  </div>
                </motion.div>
              )}

              {step === steps - 1 && (
                <motion.div key="outro" initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }} transition={{ duration: 0.6, ease: EASE }} className="max-w-[860px]">
                  <p className="font-display text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[64px] lg:text-[72px]">
                    {t.storyOutroTitle[0]}
                    <span className="bg-[linear-gradient(90deg,#9CC8FF,#3D86FF)] bg-clip-text text-transparent">{t.storyOutroTitle[1]}</span>
                  </p>
                  <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-white/60">{t.storyOutroSub}</p>
                  <button type="button" onClick={onSimulate} className="mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-[#070D2B] shadow-[0_20px_50px_-20px_rgba(30,144,255,0.9)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow">
                    {t.storyCta}
                    <ArrowUpRight className="h-4 w-4 rotate-45" aria-hidden="true" />
                  </button>
                  <p className="mt-8 max-w-[560px] text-[12.5px] leading-relaxed text-white/40">{t.contextDisclaimer}</p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
          {/* Segmentos de progresso */}
          <div aria-hidden="true" className="absolute bottom-8 left-1/2 flex w-[min(1100px,calc(100%-5rem))] -translate-x-1/2 gap-1.5">
            {items.map((e, i) => (
              <span key={e.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
                <span className={cn('block h-full rounded-full bg-[#5CA8FF] transition-[width] duration-500', step > i ? 'w-full' : 'w-0')} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CountUp({ e, lang }: { e: Evidence; lang: Lang }) {
  const c = e.count[lang]
  const [n, setN] = useState(0)
  useEffect(() => {
    const ctrl = animate(0, c.to, { duration: 1.1, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(v) })
    return () => ctrl.stop()
  }, [c.to])
  const shown = c.decimals ? n.toFixed(c.decimals).replace('.', lang === 'pt' ? ',' : '.') : Math.round(n).toString()
  return (
    <p className="mt-4 font-display text-[68px] font-semibold leading-[0.9] tracking-[-0.06em] sm:mt-5 sm:text-[140px] lg:text-[168px]" aria-label={e.value[lang]}>
      <span aria-hidden="true" className="bg-[linear-gradient(180deg,#FFFFFF_10%,#9CC8FF_70%,#3D86FF)] bg-clip-text text-transparent [text-shadow:0_0_60px_rgba(30,144,255,0.35)]">
        {c.prefix}
        {shown}
        <span className="text-[0.42em] tracking-[-0.03em]">{c.suffix}</span>
      </span>
    </p>
  )
}

function SourceMeta({ e, t, lang }: { e: Evidence; t: ExploreCopy; lang: Lang }) {
  return (
    <dl className="grid gap-4 text-[13.5px]">
      <div>
        <dt className="text-white/45">{t.sourceInstitution}</dt>
        <dd className="mt-0.5 font-medium text-white">{e.institution}</dd>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-white/45">{t.sourceGeography}</dt>
          <dd className="mt-0.5 text-white/85">{e.geography[lang]}</dd>
        </div>
        <div>
          <dt className="text-white/45">{t.sourcePeriod}</dt>
          <dd className="mt-0.5 text-white/85">{e.period[lang]}</dd>
        </div>
      </div>
      <div>
        <dt className="text-white/45">{t.sourceDefinition}</dt>
        <dd className="mt-0.5 leading-relaxed text-white/75 max-sm:line-clamp-3">{e.definition[lang]}</dd>
      </div>
      <a href={e.url} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/15">
        {t.sourceLink}
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </dl>
  )
}
