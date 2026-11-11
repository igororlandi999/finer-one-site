import { useRef } from 'react'
import { MotionConfig, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { MotionValue, Variants } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

type Context = { segment: string; title: string; question: string; text: string; message: string }

/** Imagens de identidade Finer One, versões sem texto enviadas pelo fundador (1254×1254). */
const IMAGES = [
  { src: '/images/para-quem-estrada.webp', pos: '60% 82%' },
  { src: '/images/para-quem-luz.webp', pos: '90% 82%' },
  { src: '/images/para-quem-montanha.webp', pos: '75% 88%' },
]

/**
 * Perfis que estamos a testar (Market Validation) — não são segmentos
 * comercialmente validados nem testemunhos de clientes.
 */
const copy: Record<Lang, { eyebrow: string; title: [string, string, string]; sub: string; fit: string; contexts: Context[] }> = {
  pt: {
    eyebrow: 'Pensada para quem gere',
    title: ['Há decisões que ', 'não podem esperar', ' pelo fim do mês.'],
    sub: 'Quando os clientes atrasam, os custos aumentam ou o negócio cresce, a informação financeira tem de acompanhar.',
    fit: 'Para PME com clientes empresariais, valores a receber, custos recorrentes e dados financeiros dispersos.',
    contexts: [
      {
        segment: 'Distribuição e comércio B2B',
        title: 'Clientes que pagam tarde.',
        question: 'Vendo bastante. Porque é que o dinheiro demora a entrar?',
        text: 'Acompanhe os valores por receber, os prazos e os pagamentos em atraso para compreender melhor a sua tesouraria.',
        message: 'Faturar não é o mesmo que receber.',
      },
      {
        segment: 'Empresas de serviços',
        title: 'Custos que não param.',
        question: 'O negócio está a crescer. Será que consigo acompanhar os custos?',
        text: 'Compare receitas, despesas e compromissos para perceber como evolui a situação financeira da empresa.',
        message: 'Crescer exige conhecer o impacto financeiro.',
      },
      {
        segment: 'Empresas em crescimento',
        title: 'Mais vendas. Menos liquidez.',
        question: 'Estou a vender mais. Porque é que a tesouraria continua apertada?',
        text: 'Explore a diferença entre faturação, recebimentos e pagamentos para compreender possíveis pressões de caixa.',
        message: 'Crescimento e liquidez nem sempre avançam ao mesmo ritmo.',
      },
    ],
  },
  en: {
    eyebrow: 'Built for those who manage',
    title: ['Some decisions ', 'can’t wait', ' for month-end.'],
    sub: 'When customers pay late, costs rise or the business grows, financial information has to keep up.',
    fit: 'For SMEs with business customers, receivables, recurring costs and scattered financial data.',
    contexts: [
      {
        segment: 'B2B distribution and trade',
        title: 'Customers who pay late.',
        question: 'I sell a lot. Why does the money take so long to come in?',
        text: 'Follow receivables, due dates and late payments to better understand your cash.',
        message: 'Invoicing is not the same as getting paid.',
      },
      {
        segment: 'Service companies',
        title: 'Costs that keep coming.',
        question: 'The business is growing. Can I keep track of the costs?',
        text: 'Compare revenue, expenses and commitments to see how the company’s financial position evolves.',
        message: 'Growing means knowing the financial impact.',
      },
      {
        segment: 'Growing companies',
        title: 'More sales. Less cash.',
        question: 'I’m selling more. Why is cash still tight?',
        text: 'Explore the difference between invoicing, collections and payments to understand possible cash pressure.',
        message: 'Growth and liquidity don’t always move at the same pace.',
      },
    ],
  },
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }

/**
 * Secção 5 — Para quem é.
 * Três "histórias" em cartões brancos com fotografia da identidade Finer One
 * (à maneira das histórias da Lovable e da história com fotografia da
 * Searchable). Com o scroll, os cartões empilham-se: cada um fica preso e o
 * seguinte desliza por cima, enquanto o anterior recua ligeiramente.
 */
export function ForWhom() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = useReducedMotion() ?? false
  const stack = useRef<HTMLUListElement>(null)
  const { scrollYProgress } = useScroll({ target: stack, offset: ['start start', 'end end'] })
  const n = t.contexts.length

  return (
    <MotionConfig reducedMotion="user">
      <section id="para-quem" aria-labelledby="para-quem-titulo" className="relative scroll-mt-20 bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F7FC_18%,#F4F7FC_82%,#FFFFFF_100%)] text-navy">
        <div className="mx-auto max-w-content px-5 pb-10 pt-10 sm:px-6 lg:px-8 lg:pb-12 lg:pt-12">
          {/* Cabeçalho no mesmo registo das secções 3 e 4 */}
          <motion.div className="mx-auto max-w-[820px] text-center" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
            <motion.p variants={item} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">{t.eyebrow}</motion.p>
            <motion.h2 variants={item} id="para-quem-titulo" className="mt-3 text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[48px] lg:text-[56px]">
              {t.title[0]}
              <span className="text-accent-deep">{t.title[1]}</span>
              {t.title[2]}
            </motion.h2>
            <motion.p variants={item} className="mx-auto mt-4 max-w-[600px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</motion.p>
          </motion.div>

          {/* Pilha de histórias */}
          <ul ref={stack} className={cn('relative mt-8 lg:mt-10', !reduced && 'pb-[6vh] lg:pb-[10vh]')}>
            {t.contexts.map((c, i) => (
              <Story key={c.title} c={c} i={i} n={n} progress={scrollYProgress} reduced={reduced} />
            ))}
          </ul>

          <motion.p
            className="mx-auto mt-6 max-w-[620px] text-center text-[14px] leading-relaxed text-[#0B1030]/55"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {t.fit}
          </motion.p>
        </div>
      </section>
    </MotionConfig>
  )
}

function Story({ c, i, n, progress, reduced }: { c: Context; i: number; n: number; progress: MotionValue<number>; reduced: boolean }) {
  const ref = useRef<HTMLLIElement>(null)
  const last = i === n - 1
  // Quando o cartão seguinte sobe, este recua (fica um pouco mais pequeno e mais suave)
  const start = (i + 0.35) / n
  const scale = useTransform(progress, [start, 1], [1, reduced || last ? 1 : 1 - (n - 1 - i) * 0.045])
  const veil = useTransform(progress, [start + 0.12, 1], [0, reduced || last ? 0 : 0.35])
  // Fotografia: ligeiro zoom-out enquanto o cartão entra (parallax)
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start 0.2'] })
  const zoom = useTransform(enter, [0, 1], reduced ? [1, 1] : [1.06, 1])
  const img = IMAGES[i]

  return (
    <li
      ref={ref}
      className={cn('relative', !reduced && 'sticky max-lg:[@media(max-height:760px)]:static', last ? '' : reduced ? 'mb-5' : 'mb-5 lg:mb-[7vh]')}
      style={reduced ? undefined : { top: 88 + i * 22 }}
    >
      <motion.article
        style={{ scale }}
        className="relative grid origin-top overflow-hidden rounded-[32px] bg-white shadow-[0_1px_2px_rgba(11,16,48,0.04),0_0_0_1px_rgba(11,16,48,0.06),0_40px_80px_-50px_rgba(11,16,48,0.35)] lg:h-[min(430px,calc(100vh-150px))] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        {/* Texto */}
        <motion.div
          className="order-2 flex flex-col justify-center p-6 sm:p-9 lg:order-1 lg:px-12 lg:py-10"
          variants={group}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.p variants={item} className="flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[#0B1030]/50">
            <span className="font-display text-[13px] font-bold tracking-[0.1em] text-accent-deep">0{i + 1}</span>
            <span aria-hidden="true" className="h-px w-6 bg-[#0B1030]/20" />
            {c.segment}
          </motion.p>
          <motion.h3 variants={item} className="mt-4 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.035em] text-[#070D2B] sm:text-[38px] lg:text-[44px]">{c.title}</motion.h3>
          <motion.blockquote variants={item} className="mt-4 border-l-2 border-accent-deep pl-4 text-[18px] leading-[1.45] text-[#070D2B]/85 sm:text-[20px]">
            “{c.question}”
          </motion.blockquote>
          <motion.p variants={item} className="mt-5 text-[15px] leading-[1.6] text-[#0B1030]/65 lg:max-w-[460px]">{c.text}</motion.p>
          <motion.p variants={item} className="mt-3 text-[15px] font-semibold leading-snug text-accent-deep">{c.message}</motion.p>
        </motion.div>

        {/* Fotografia da identidade (limpa, sem nada por cima) */}
        <div className="relative order-1 h-[200px] overflow-hidden sm:h-[280px] lg:order-2 lg:h-auto">
          <motion.img
            src={img.src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: img.pos, scale: zoom }}
          />
        </div>

        {/* Véu: o cartão de trás fica mais suave quando o seguinte o cobre */}
        <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#F4F7FC]" style={{ opacity: veil }} />
      </motion.article>
    </li>
  )
}
