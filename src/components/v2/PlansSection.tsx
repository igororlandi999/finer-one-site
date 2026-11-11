import { useRef } from 'react'
import { MotionConfig, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { MotionValue, Variants } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Secção de planos (âncora #precos), à maneira da página de preços da
 * Searchable: cartões claros lado a lado, o plano em destaque com a cor da
 * marca. PREÇOS: nenhum valor — "Preço a definir" até existirem valores
 * oficiais. Plus: conteúdo indicado pelo fundador (11/11/2026). Pro e Team:
 * em desenvolvimento, sem compra — só aviso pela lista de espera.
 */
type Plan = { id: 'plus' | 'pro' | 'team'; name: string; status: string; promise: string; desc: string; listLabel: string; items: string[]; cta: string; href: string }

const copy: Record<Lang, { eyebrow: string; title: [string, string]; sub: string; price: string; period: string; note: string; plans: Plan[] }> = {
  pt: {
    eyebrow: 'Planos',
    title: ['Escolha o plano certo ', 'para a sua empresa.'],
    sub: 'Comece pelo Plus. O Pro e o Team estão em desenvolvimento.',
    price: 'Preço a definir',
    period: '/mês',
    note: 'Os valores de cada plano serão anunciados.',
    plans: [
      {
        id: 'plus',
        name: 'Plus',
        status: 'Disponível · Finer Pioneers',
        promise: 'Perceber o que está a acontecer.',
        desc: 'Clareza financeira para acompanhar a operação e compreender melhor o desempenho da empresa.',
        listLabel: 'Inclui',
        items: ['Finer Home', 'Cashflow', 'Receitas', 'Despesas', 'Clientes e Fornecedores', 'Finer Advisor', 'Alertas'],
        cta: 'Ser Finer Pioneer',
        href: '/pioneers/',
      },
      {
        id: 'pro',
        name: 'Pro',
        status: 'Em desenvolvimento',
        promise: 'Perceber o que está a acontecer — e o que pode acontecer a seguir.',
        desc: 'Mais profundidade para empresas que querem antecipar cenários e decidir com maior contexto financeiro.',
        listLabel: 'Tudo do Plus, e ainda',
        items: ['Planeamento', 'Indicadores', 'Alertas ilimitados', 'Chat Financeiro ilimitado'],
        cta: 'Avisar-me quando chegar',
        href: '/lista-espera/',
      },
      {
        id: 'team',
        name: 'Team',
        status: 'Em desenvolvimento',
        promise: 'Comparar o desempenho da empresa com o setor.',
        desc: 'Para empresas que querem situar os seus números face ao mercado e acompanhar a evolução do valor do negócio.',
        listLabel: 'Tudo do Pro, e ainda',
        items: ['Benchmarking do setor', 'Avaliação'],
        cta: 'Avisar-me quando chegar',
        href: '/lista-espera/',
      },
    ],
  },
  en: {
    eyebrow: 'Plans',
    title: ['Choose the right plan ', 'for your company.'],
    sub: 'Start with Plus. Pro and Team are in development.',
    price: 'Price to be announced',
    period: '/mo',
    note: 'Pricing for each plan will be announced.',
    plans: [
      {
        id: 'plus',
        name: 'Plus',
        status: 'Available · Finer Pioneers',
        promise: 'Understand what’s happening.',
        desc: 'Financial clarity to track the operation and better understand company performance.',
        listLabel: 'Includes',
        items: ['Finer Home', 'Cashflow', 'Revenue', 'Expenses', 'Clients and Suppliers', 'Finer Advisor', 'Alerts'],
        cta: 'Become a Finer Pioneer',
        href: '/pioneers/',
      },
      {
        id: 'pro',
        name: 'Pro',
        status: 'In development',
        promise: 'Understand what’s happening — and what could happen next.',
        desc: 'More depth for companies that want to anticipate scenarios and decide with greater financial context.',
        listLabel: 'Everything in Plus, plus',
        items: ['Planning', 'Indicators', 'Unlimited alerts', 'Unlimited Financial Chat'],
        cta: 'Notify me when it’s ready',
        href: '/lista-espera/',
      },
      {
        id: 'team',
        name: 'Team',
        status: 'In development',
        promise: 'Compare the company’s performance with the industry.',
        desc: 'For companies that want to benchmark their numbers against the market and track the evolution of business value.',
        listLabel: 'Everything in Pro, plus',
        items: ['Industry benchmarking', 'Valuation'],
        cta: 'Notify me when it’s ready',
        href: '/lista-espera/',
      },
    ],
  },
}

/** Mesma família de cor da secção 6 (atmosfera Finer One), mais suave. */
const PLUS_BG = {
  background: [
    'radial-gradient(60% 45% at 85% 0%, rgba(141,184,246,0.75) 0%, rgba(141,184,246,0) 100%)',
    'radial-gradient(55% 40% at 0% 100%, rgba(0,82,255,0.55) 0%, rgba(0,82,255,0) 100%)',
    'radial-gradient(60% 45% at 100% 100%, rgba(10,42,134,0.6) 0%, rgba(10,42,134,0) 100%)',
    'linear-gradient(180deg, #F6F9FF 0%, #E3ECFF 45%, #B9D0FB 100%)',
  ].join(', '),
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const rise: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }

export function PlansSection() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = useReducedMotion() ?? false
  const grid = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: grid, offset: ['start end', 'end start'] })

  return (
    <MotionConfig reducedMotion="user">
      <section id="precos" aria-labelledby="precos-titulo" className="relative scroll-mt-24 bg-white text-navy">
        <div className="mx-auto max-w-content px-5 pb-14 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
          <motion.div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end lg:gap-12" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
            <div>
              <motion.p variants={rise} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">{t.eyebrow}</motion.p>
              <motion.h2 variants={rise} id="precos-titulo" className="mt-3 text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[48px] lg:text-[56px]">
                {t.title[0]}
                <span className="text-accent-deep">{t.title[1]}</span>
              </motion.h2>
            </div>
            <motion.p variants={rise} className="text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px] lg:pb-2">{t.sub}</motion.p>
          </motion.div>

          <div ref={grid} className="mt-10 grid items-stretch gap-5 lg:mt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
            {t.plans.map((p, i) => (
              <PlanCard key={p.id} p={p} i={i} t={t} progress={scrollYProgress} reduced={reduced} />
            ))}
          </div>

          <p className="mt-6 text-[13.5px] text-[#0B1030]/50">{t.note}</p>
        </div>
      </section>
    </MotionConfig>
  )
}

function PlanCard({ p, i, t, progress, reduced }: { p: Plan; i: number; t: (typeof copy)['pt']; progress: MotionValue<number>; reduced: boolean }) {
  const plus = p.id === 'plus'
  // Parallax suave: os planos em desenvolvimento "assentam" um pouco depois do Plus
  const y = useTransform(progress, [0, 0.5], reduced ? [0, 0] : [plus ? 30 : 60 + i * 20, 0])
  const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } } }
  const li: Variants = { hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } } }

  return (
    <motion.div style={{ y }} className="h-full">
    <motion.article
      className={cn(
        'relative isolate flex h-full flex-col overflow-hidden rounded-[28px] p-6 sm:p-8',
        plus ? 'shadow-[0_40px_80px_-50px_rgba(10,42,134,0.55),0_0_0_1px_rgba(10,64,200,0.18)]' : 'bg-[#F6F8FC] shadow-[0_0_0_1px_rgba(11,16,48,0.06)]',
      )}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: i * 0.12 } } }}
    >
      {plus && <span aria-hidden="true" className="absolute inset-0 -z-10" style={PLUS_BG} />}

      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-[30px] font-bold tracking-[-0.035em] text-[#070D2B] sm:text-[34px]">{p.name}</h3>
        <span className={cn('text-right text-[12px] font-semibold uppercase tracking-[0.14em]', plus ? 'text-accent-deep' : 'text-[#0B1030]/45')}>{p.status}</span>
      </div>
      <p className="mt-4 text-[17px] font-semibold leading-snug text-[#070D2B]">{p.promise}</p>
      <p className="mt-2 text-[15px] leading-[1.6] text-[#0B1030]/65">{p.desc}</p>

      <div className={cn('mt-6 border-t pt-5', plus ? 'border-[#0A40C8]/15' : 'border-[#0B1030]/10')}>
        <p className="font-display text-[26px] font-bold tracking-[-0.03em] text-[#070D2B]">
          € —<span className="ml-1.5 text-[14px] font-medium tracking-normal text-[#0B1030]/50">{t.period}</span>
        </p>
        <p className="mt-0.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0B1030]/45">{t.price}</p>
      </div>

      <p className="mt-6 text-[13px] font-semibold text-[#0B1030]/55">{p.listLabel}</p>
      <motion.ul variants={list} className="mt-2">
        {p.items.map((x) => (
          <motion.li key={x} variants={li} className={cn('flex items-baseline gap-3 border-b py-2.5 text-[15px]', plus ? 'border-[#0A40C8]/10 font-medium text-[#070D2B]' : 'border-[#0B1030]/[0.07] text-[#0B1030]/75')}>
            <span aria-hidden="true" className={cn('h-px w-3 shrink-0 translate-y-[-4px]', plus ? 'bg-accent-deep' : 'bg-[#0B1030]/30')} />
            {x}
          </motion.li>
        ))}
      </motion.ul>

      <div className="mt-auto pt-8">
        <a
          href={p.href}
          className={cn(
            'group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
            plus ? 'bg-[#070D2B] text-white hover:bg-accent-deep' : 'bg-white text-[#070D2B] ring-1 ring-[#0B1030]/12 hover:ring-[#0B1030]/30',
          )}
        >
          {p.cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
        </a>
      </div>
    </motion.article>
    </motion.div>
  )
}
