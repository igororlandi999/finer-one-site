import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SOURCES } from './content'
import type { ExploreText, Lang } from './content'

/**
 * Fontes: cartões que aparecem com o scroll (sem prender a página nem contadores).
 * O período, o âmbito e a definição só aparecem quando o cartão é aberto.
 */
const EASE = [0.22, 1, 0.36, 1] as const
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const rise: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } } }
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -12% 0px' } } as const

export function Sources({ t, lang, onSimulate }: { t: ExploreText; lang: Lang; onSimulate: () => void }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <section aria-labelledby="ex-fontes" className="relative isolate overflow-hidden bg-[#040817] py-24 text-white lg:py-32">
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(0,82,255,0.28),transparent)] blur-[80px]" />
      <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <motion.div variants={group} {...inView} className="mx-auto max-w-[820px] text-center">
          <motion.p variants={rise} className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-[#7CB8FF]">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-glow" aria-hidden="true" />
            {t.sourcesEyebrow}
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-glow" aria-hidden="true" />
          </motion.p>
          <motion.h2 variants={rise} id="ex-fontes" className="mt-4 text-balance font-display text-[32px] font-bold leading-[1.06] tracking-[-0.035em] sm:text-[46px]">
            {t.sourcesTitle[0]}
            <span className="text-accent [text-shadow:0_0_32px_rgba(0,82,255,0.45)]">{t.sourcesTitle[1]}</span>
          </motion.h2>
          <motion.p variants={rise} className="mx-auto mt-5 max-w-[600px] text-[16.5px] leading-[1.6] text-white/65">{t.sourcesSub}</motion.p>
        </motion.div>

        <motion.ul variants={group} {...inView} className="mt-14 grid grid-cols-[minmax(0,1fr)] items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SOURCES.map((s) => {
            const on = open === s.id
            return (
              <motion.li key={s.id} variants={rise} layout="position" className={cn('group relative overflow-hidden rounded-[22px] border bg-white/[0.035] transition-colors', on ? 'border-[#3D86FF]/50 bg-white/[0.06]' : 'border-white/10 hover:border-white/20')}>
                <span aria-hidden="true" className={cn('absolute inset-x-6 top-0 h-px transition-opacity duration-500', on ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')} style={{ background: 'linear-gradient(90deg,transparent,#1E90FF,transparent)' }} />
                <button type="button" aria-expanded={on} aria-controls={`src-${s.id}`} onClick={() => setOpen(on ? null : s.id)} className="block w-full p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-glow">
                  <span className="block font-display text-[40px] font-bold leading-none tracking-[-0.04em] text-white sm:text-[46px]">{s.value[lang]}</span>
                  <span className="mt-3 block text-[15px] leading-[1.5] text-white/75">{s.label[lang]}</span>
                  <span className="mt-5 flex items-center justify-between gap-3 text-[12.5px]">
                    <span className="truncate font-medium text-white/45">{lang === 'en' && s.short === 'Comissão Europeia' ? 'European Commission' : s.short}</span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-[#7CB8FF]">
                      {on ? t.sourceClose : t.sourceOpen}
                      <Plus className={cn('h-3.5 w-3.5 transition-transform duration-300', on && 'rotate-45')} aria-hidden="true" />
                    </span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div id={`src-${s.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
                      <dl className="mx-6 space-y-3 border-t border-white/10 pb-6 pt-4 text-[13px] leading-snug">
                        <div>
                          <dt className="text-white/40">{t.sourcePeriod}</dt>
                          <dd className="mt-0.5 font-medium text-white/85">{s.period[lang]}</dd>
                        </div>
                        <div>
                          <dt className="text-white/40">{t.sourceGeo}</dt>
                          <dd className="mt-0.5 text-white/75">{s.geography[lang]}</dd>
                        </div>
                        <div>
                          <dt className="text-white/40">{t.sourceDef}</dt>
                          <dd className="mt-0.5 text-white/70">{s.definition[lang]}</dd>
                        </div>
                        <div>
                          <dd className="text-white/50">{s.institution}</dd>
                          <dd className="mt-2">
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#7CB8FF] hover:text-white">
                              {t.sourceLink}
                              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          </dd>
                        </div>
                      </dl>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            )
          })}
        </motion.ul>

        <motion.div variants={rise} {...inView} className="mt-12 text-center">
          <button type="button" onClick={onSimulate} className="group inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-6 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_30px_-10px_rgba(0,82,255,0.95)] transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow">
            {t.sourcesCta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
