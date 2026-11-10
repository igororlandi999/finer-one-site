import { MotionConfig, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'

const copy: Record<Lang, { eyebrow: string; title: [string, string]; items: { n: string; name: string; text: string }[] }> = {
  pt: {
    eyebrow: 'O impacto no seu negócio',
    title: ['O que muda na ', 'sua gestão?'],
    items: [
      { n: '01', name: 'Recebimentos', text: 'Saiba quem lhe deve e quanto está por receber.' },
      { n: '02', name: 'Tesouraria', text: 'Acompanhe a liquidez e os próximos compromissos.' },
      { n: '03', name: 'Custos', text: 'Identifique despesas e desvios que merecem atenção.' },
      { n: '04', name: 'Prioridades', text: 'Perceba onde agir primeiro e porquê.' },
    ],
  },
  en: {
    eyebrow: 'The impact on your business',
    title: ['What changes in ', 'how you manage?'],
    items: [
      { n: '01', name: 'Receivables', text: 'Know who owes you and how much is outstanding.' },
      { n: '02', name: 'Cash', text: 'Track liquidity and upcoming commitments.' },
      { n: '03', name: 'Costs', text: 'Spot expenses and deviations that deserve attention.' },
      { n: '04', name: 'Priorities', text: 'Understand where to act first, and why.' },
    ],
  },
}

const EASE = [0.22, 1, 0.36, 1] as const

/** Versão anterior dos fundos em ?fundo=antigo. */
const OLD_BG = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('fundo') === 'antigo'

// Sequência: eyebrow → título → quatro benefícios (stagger 80 ms) → linha.
const head: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE, delay: d } }),
}
const list: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.22, staggerChildren: 0.08 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

/**
 * Secção 3 — benefícios numa faixa editorial (Motion).
 * Entrada única com whileInView; benefícios em stagger; linha Finer One
 * desenhada por cima da faixa (scaleX, 800 ms) que acende os pontos 01–04;
 * hover subtil sem cursor de clique (os benefícios não são links).
 * Versões anteriores: ?beneficios=faixa (sem Motion), =cartoes, =antigo.
 */
export function BenefitsMotion() {
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <MotionConfig reducedMotion="user">
      <section id="beneficios" aria-labelledby="beneficios-titulo" className={OLD_BG ? 'relative scroll-mt-24 py-10 text-navy lg:py-12' : 'relative scroll-mt-24 bg-[#F8FAFF] py-10 text-navy lg:py-12'}>
        {/* Separação editorial delicada da secção anterior */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-[30%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,82,255,0.25),transparent)]" />

        <motion.div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
          <motion.p variants={head} custom={0} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent">
            {t.eyebrow}
          </motion.p>
          <motion.h2 variants={head} custom={0.06} id="beneficios-titulo" className="mt-3 font-display text-[32px] font-bold leading-[1.05] tracking-[-0.035em] text-[#070D2B] sm:text-[42px] lg:text-[48px]">
            {t.title[0]}
            <span className="text-accent">{t.title[1]}</span>
          </motion.h2>

          <div className="relative mt-7 lg:mt-8">
            {/* Linha Finer One: desenhada uma vez sobre a faixa, depois estática */}
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[#0B1030]/[0.1]">
              <motion.span
                className="absolute inset-0 origin-left bg-gradient-to-r from-accent via-glow to-accent shadow-[0_0_8px_rgba(30,144,255,0.7)]"
                variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: EASE, delay: 0.55 } } }}
              />
            </div>

            <motion.ol variants={list} className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-2 lg:grid-cols-4">
              {t.items.map((it, i) => (
                <motion.li
                  key={it.n}
                  variants={item}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className={[
                    'group relative py-5 sm:pr-6 lg:px-6 lg:pb-1 lg:pt-6',
                    i > 0 ? 'border-t border-[#0B1030]/[0.08] sm:border-t-0' : '',
                    i % 2 === 1 ? 'sm:border-l sm:border-[#0B1030]/[0.08] sm:pl-6' : '',
                    i > 1 ? 'sm:border-t sm:border-[#0B1030]/[0.08] lg:border-t-0' : '',
                    i > 0 ? 'lg:border-l lg:border-[#0B1030]/[0.08]' : 'lg:pl-0',
                  ].join(' ')}
                >
                  {/* Ponto que acende quando a linha passa (desktop) */}
                  <motion.span
                    aria-hidden="true"
                    className={`absolute -top-[5px] hidden h-[9px] w-[9px] rounded-full border-2 lg:block ${i === 0 ? 'left-0' : '-left-[5px]'}`}
                    variants={{
                      hidden: { borderColor: 'rgba(11,16,48,0.2)', backgroundColor: '#FFFFFF', boxShadow: '0 0 0 0 rgba(0,82,255,0)' },
                      show: {
                        borderColor: '#0052FF',
                        backgroundColor: '#0052FF',
                        boxShadow: '0 0 0 4px rgba(0,82,255,0.12), 0 0 10px rgba(30,144,255,0.7)',
                        transition: { duration: 0.3, delay: 0.55 + (0.8 * i) / 3 },
                      },
                    }}
                  />
                  {/* Hover: o segmento superior do benefício ganha destaque azul */}
                  <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100 lg:left-6 lg:right-6" />
                  <p className="font-display text-[14px] font-bold tabular-nums tracking-[0.1em] text-accent">{it.n}</p>
                  <h3 className="mt-2 font-display text-[21px] font-bold tracking-[-0.02em] text-[#0B1030]/90 transition-colors duration-300 group-hover:text-[#070D2B] lg:text-[22px]">{it.name}</h3>
                  <p className="mt-1.5 max-w-[270px] text-[16px] leading-[1.55] text-[#0B1030]/70 transition-colors duration-300 group-hover:text-[#0B1030]/85">{it.text}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}
