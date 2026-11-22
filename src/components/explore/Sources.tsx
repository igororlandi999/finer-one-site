import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowUpRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SOURCES } from './content'
import type { ExploreText, Lang } from './content'

/**
 * Fontes em estilo editorial (como as peças da identidade Finer One): fundo claro,
 * números grandes em azul-marinho, linhas finas e a linha de luz azul como único
 * acento. Sem cartões, sem scroll preso e sem contadores. O período, o âmbito e a
 * definição aparecem quando a fonte é aberta.
 */
const EASE = [0.22, 1, 0.36, 1] as const
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const rise: Variants = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } }
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -12% 0px' } } as const

export function Sources({ t, lang }: { t: ExploreText; lang: Lang }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <section aria-labelledby="ex-fontes" className="relative bg-gradient-to-b from-white via-[#F7F9FE] to-ice py-20 text-navy lg:py-28">
      <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <motion.div variants={group} {...inView} className="max-w-[760px]">
          <motion.p variants={rise} className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-accent-deep" aria-hidden="true" />
            {t.sourcesEyebrow}
          </motion.p>
          <h2 id="ex-fontes" className="mt-4 text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[48px] lg:text-[56px]">
            {t.sourcesTitle[0]}
            <span className="text-accent-deep">{t.sourcesTitle[1]}</span>
          </h2>
          <motion.p variants={rise} className="mt-5 max-w-[560px] text-[17px] leading-[1.6] text-[#0B1030]/60">{t.sourcesSub}</motion.p>
        </motion.div>

        <motion.ul variants={group} {...inView} className="mt-12 grid grid-cols-[minmax(0,1fr)] items-start gap-x-12 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {SOURCES.map((s) => {
            const on = open === s.id
            return (
              <motion.li key={s.id} variants={rise} className="group relative border-t border-[#0B1030]/12">
                <span aria-hidden="true" className={cn('absolute -top-px left-0 h-[2px] origin-left bg-[linear-gradient(90deg,#0052FF,#5CA8FF)] shadow-[0_0_12px_rgba(30,144,255,0.55)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]', on ? 'w-full scale-x-100' : 'w-full scale-x-0 group-hover:scale-x-100')} />
                <button type="button" aria-expanded={on} aria-controls={`src-${s.id}`} onClick={() => setOpen(on ? null : s.id)} className="block w-full pb-8 pt-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-4">
                  <span className="block font-display text-[48px] font-bold leading-none tracking-[-0.045em] text-[#070D2B] sm:text-[56px]">{s.value[lang]}</span>
                  <span className="mt-4 block max-w-[320px] text-[15.5px] leading-[1.55] text-[#0B1030]/65">{s.label[lang]}</span>
                  <span className="mt-6 flex items-center justify-between gap-3 text-[12.5px]">
                    <span className="truncate font-semibold uppercase tracking-[0.12em] text-[#0B1030]/40">{lang === 'en' && s.short === 'Comissão Europeia' ? 'European Commission' : s.short}</span>
                    <span aria-hidden="true" className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300', on ? 'border-[#070D2B] bg-[#070D2B] text-white' : 'border-[#0B1030]/15 text-[#070D2B] group-hover:border-[#070D2B]')}>
                      <Plus className={cn('h-3.5 w-3.5 transition-transform duration-300', on && 'rotate-45')} />
                    </span>
                    <span className="sr-only">{on ? t.sourceClose : t.sourceOpen}</span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div id={`src-${s.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
                      <dl className="space-y-3 pb-9 text-[13.5px] leading-snug">
                        <div className="flex gap-4">
                          <dt className="w-[92px] shrink-0 text-[#0B1030]/45">{t.sourcePeriod}</dt>
                          <dd className="font-semibold text-[#070D2B]">{s.period[lang]}</dd>
                        </div>
                        <div className="flex gap-4">
                          <dt className="w-[92px] shrink-0 text-[#0B1030]/45">{t.sourceGeo}</dt>
                          <dd className="text-[#070D2B]/80">{s.geography[lang]}</dd>
                        </div>
                        <div className="flex gap-4">
                          <dt className="w-[92px] shrink-0 text-[#0B1030]/45">{t.sourceDef}</dt>
                          <dd className="text-[#0B1030]/65">{s.definition[lang]}</dd>
                        </div>
                        <div className="pt-1">
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#070D2B] underline decoration-[#0B1030]/20 underline-offset-4 hover:decoration-[#070D2B]">
                            {s.institution}
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        </div>
                      </dl>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </section>
  )
}
