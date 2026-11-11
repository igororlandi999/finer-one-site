import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import type { MotionValue, Variants } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Secção de planos (âncora #precos), à maneira da página de preços da
 * Searchable: cartões claros lado a lado, o plano em destaque com a cor da
 * marca. PREÇOS (indicação do fundador, 12/11/2026): Plus mensal 67,90 €/mês,
 * Plus anual 57,90 €/mês. Pro e Team: conteúdo e valores ainda por definir —
 * sem lista de funcionalidades, só aviso pela lista de espera.
 */
type Plan = { id: 'plus' | 'pro' | 'team'; name: string; status: string; promise: string; desc: string; listLabel: string; items: string[]; cta: string; href: string }

type Billing = { monthly: string; annual: string; save: string; priceM: string; priceA: string; per: string; noteM: string; noteA: string; tbd: string }

const copy: Record<Lang, { eyebrow: string; title: [string, string]; sub: string; price: string; period: string; note: string; billing: Billing; plans: Plan[] }> = {
  pt: {
    eyebrow: 'Planos',
    title: ['Escolha o plano certo ', 'para a sua empresa.'],
    sub: 'Comece pelo Plus. O Pro e o Team estão em desenvolvimento.',
    price: 'A anunciar',
    period: '/mês',
    note: 'Os valores do Pro e do Team serão anunciados.',
    billing: { monthly: 'Mensal', annual: 'Anual', save: '−10 €/mês', priceM: '67,90 €', priceA: '57,90 €', per: '/mês', noteM: 'Plano mensal · IVA incluído', noteA: 'Por mês, no plano anual · IVA incluído', tbd: 'As funcionalidades deste plano serão anunciadas.' },
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
        listLabel: '',
        items: [],
        cta: 'Avisar-me quando chegar',
        href: '/lista-espera/',
      },
      {
        id: 'team',
        name: 'Team',
        status: 'Em desenvolvimento',
        promise: 'Comparar o desempenho da empresa com o setor.',
        desc: 'Para empresas que querem situar os seus números face ao mercado e acompanhar a evolução do valor do negócio.',
        listLabel: '',
        items: [],
        cta: 'Avisar-me quando chegar',
        href: '/lista-espera/',
      },
    ],
  },
  en: {
    eyebrow: 'Plans',
    title: ['Choose the right plan ', 'for your company.'],
    sub: 'Start with Plus. Pro and Team are in development.',
    price: 'To be announced',
    period: '/mo',
    note: 'Pricing for Pro and Team will be announced.',
    billing: { monthly: 'Monthly', annual: 'Annual', save: '−€10/mo', priceM: '€67.90', priceA: '€57.90', per: '/mo', noteM: 'Monthly plan · VAT included', noteA: 'Per month, on the annual plan · VAT included', tbd: 'The features of this plan will be announced.' },
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
        listLabel: '',
        items: [],
        cta: 'Notify me when it’s ready',
        href: '/lista-espera/',
      },
      {
        id: 'team',
        name: 'Team',
        status: 'In development',
        promise: 'Compare the company’s performance with the industry.',
        desc: 'For companies that want to benchmark their numbers against the market and track the evolution of business value.',
        listLabel: '',
        items: [],
        cta: 'Notify me when it’s ready',
        href: '/lista-espera/',
      },
    ],
  },
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const rise: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }

/**
 * Estilo Ramp (escolha do fundador): título grande ao centro em dois tons,
 * etiqueta por cima de cada cartão, o plano em destaque com contorno na cor
 * da marca. Cartões brancos, texto calmo, sem ícones.
 */
export function PlansSection() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reducedPref = useReducedMotion() ?? false
  const wide = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  const reduced = reducedPref || !wide
  const grid = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: grid, offset: ['start 0.72', 'start 0.18'] })
  const deal = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.6 })
  // Distância entre colunas (largura do cartão + espaço), medida no ecrã
  const [step, setStep] = useState(400)
  useLayoutEffect(() => {
    const el = grid.current
    if (!el) return
    const ro = new ResizeObserver(() => setStep((el.clientWidth - 40) / 3 + 20))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <section id="precos" aria-labelledby="precos-titulo" className="relative scroll-mt-24 bg-white text-navy">
        <div className="mx-auto max-w-content px-5 pb-14 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
          <motion.div className="mx-auto max-w-[860px] text-center" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
            <h2 id="precos-titulo" className="font-display text-[36px] font-bold leading-[1.02] tracking-[-0.04em] sm:text-[54px] lg:text-[68px]">
              <span className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block text-[#070D2B]" variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.9, ease: EASE } } }}>{t.title[0].trim()}</motion.span>
              </span>
              <span className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block text-accent-deep" variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.9, ease: EASE, delay: 0.08 } } }}>{t.title[1]}</motion.span>
              </span>
            </h2>
            <motion.p variants={rise} className="mx-auto mt-5 max-w-[560px] text-[16.5px] leading-[1.6] text-[#0B1030]/65 sm:text-[18px]">{t.sub}</motion.p>
          </motion.div>

          <div ref={grid} className="relative mt-14 grid items-stretch gap-x-5 gap-y-12 lg:mt-16 lg:grid-cols-3">
            {t.plans.map((p, i) => (
              <PlanCard key={p.id} p={p} i={i} t={t} deal={deal} step={step} reduced={reduced} />
            ))}
          </div>

          <p className="mt-8 text-center text-[13.5px] text-[#0B1030]/50">{t.note}</p>
        </div>
      </section>
    </MotionConfig>
  )
}

const TAB: Record<Plan['id'], string> = {
  plus: 'bg-accent text-white',
  pro: 'bg-[#EEF1F6] text-[#070D2B]/75 transition-colors duration-300 group-hover/card:bg-[#070D2B] group-hover/card:text-white',
  team: 'bg-[#070D2B] text-white',
}

function PlanCard({ p, i, t, deal, step, reduced }: { p: Plan; i: number; t: (typeof copy)['pt']; deal: MotionValue<number>; step: number; reduced: boolean }) {
  const plus = p.id === 'plus'
  // Baralho: o Plus começa ao centro, à frente; o Pro e o Team por trás, ligeiramente rodados.
  const from = i === 0 ? step : i === 2 ? -step : 0
  const x = useTransform(deal, [0, 1], reduced ? [0, 0] : [from, 0])
  const rotate = useTransform(deal, [0, 1], reduced ? [0, 0] : [i === 0 ? 0 : i === 1 ? 4 : -4, 0])
  const scale = useTransform(deal, [0, 1], reduced ? [1, 1] : [i === 0 ? 1 : 0.94, 1])
  const y = useTransform(deal, [0, 1], reduced ? [0, 0] : [i === 0 ? 0 : 14, 0])
  const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.4 } } }
  const li: Variants = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }

  return (
    <motion.div style={{ x, y, rotate, scale, zIndex: 30 - i * 10 }} className="relative h-full">
      {plus && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-12 -bottom-24 top-1/4 -z-10 hidden bg-[radial-gradient(50%_42%_at_50%_62%,rgba(0,82,255,0.32),rgba(30,144,255,0.14)_55%,rgba(141,184,246,0)_100%)] lg:block"
        />
      )}
      <motion.article
        whileHover={{ y: -6, transition: { duration: 0.3, ease: EASE } }}
        className={cn(
          'group/card relative flex h-full flex-col rounded-[20px] bg-white px-6 pb-7 pt-10 sm:px-8',
          plus ? 'shadow-[0_30px_70px_-45px_rgba(0,82,255,0.55)]' : '',
        )}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: i * 0.12 } } }}
      >
        {/* Contorno: azul elétrico no Plus (desenha-se ao entrar), fino nos outros */}
        <span aria-hidden="true" className={cn('pointer-events-none absolute inset-0 rounded-[20px]', plus ? 'ring-0' : 'ring-1 ring-inset ring-[#0B1030]/12 transition-[box-shadow] duration-300 group-hover/card:ring-[#0B1030]/30')} />
        {plus && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[20px] ring-2 ring-inset ring-accent"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6, delay: 0.3 + i * 0.12 } } }}
          />
        )}

        {/* Etiqueta por cima do cartão, à maneira da Ramp */}
        <span className="absolute inset-x-0 top-0 flex -translate-y-1/2 justify-center">
          <motion.span
            className={cn('whitespace-nowrap rounded-[8px] px-4 py-1.5 text-[13px] font-semibold', TAB[p.id])}
            variants={{ hidden: { opacity: 0, y: -6 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay: 0.2 + i * 0.12 } } }}
          >
            {p.status}
          </motion.span>
        </span>

        <h3 className="font-display text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#070D2B] sm:text-[34px]">{p.name}</h3>
        {plus ? <PlusPrice b={t.billing} /> : <p className="font-display text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#0B1030]/35 sm:text-[34px]">{t.price}</p>}

        <p className="mt-7 text-[17px] leading-snug text-[#070D2B]">{p.promise}</p>
        <p className="mt-2 text-[14.5px] leading-[1.6] text-[#0B1030]/60">{p.desc}</p>

        <a
          href={p.href}
          className={cn(
            'group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-[10px] px-6 py-3.5 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
            plus ? 'bg-[#070D2B] text-white hover:bg-accent-deep' : 'bg-[#F3F5F9] text-[#070D2B] hover:bg-[#E9EDF4]',
          )}
        >
          {p.cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
        </a>

        <div className="mt-7 border-t border-[#0B1030]/10 pt-6">
          {p.items.length > 0 ? (
            <>
              <p className="text-[15px] font-semibold text-[#070D2B]">{p.listLabel}</p>
              <motion.ul variants={list} className="mt-3 space-y-3">
                {p.items.map((x) => (
                  <motion.li key={x} variants={li} className="text-[15px] text-[#0B1030]/75">{x}</motion.li>
                ))}
              </motion.ul>
            </>
          ) : (
            <p className="text-[14.5px] leading-[1.6] text-[#0B1030]/50">{t.billing.tbd}</p>
          )}
        </div>
      </motion.article>
    </motion.div>
  )
}

/** Plus: escolha entre mensal e anual; o preço muda com uma transição suave. */
function PlusPrice({ b }: { b: Billing }) {
  const [annual, setAnnual] = useState(false)
  const opts: [boolean, string][] = [[false, b.monthly], [true, b.annual]]
  return (
    <div className="mt-2">
      <div className="inline-flex rounded-[10px] bg-[#F1F4F9] p-1" role="group" aria-label={b.monthly + ' / ' + b.annual}>
        {opts.map(([val, label]) => {
          const on = annual === val
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => setAnnual(val)}
              className={cn('relative flex items-center gap-2 rounded-[8px] px-3.5 py-1.5 text-[13.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent', on ? 'text-[#070D2B]' : 'text-[#0B1030]/55 hover:text-[#070D2B]')}
            >
              {on && <motion.span layoutId="plus-billing" className="absolute inset-0 rounded-[8px] bg-white shadow-[0_1px_3px_rgba(11,16,48,0.12)]" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="relative">{label}</span>
              {val && <span className="relative rounded-[6px] bg-accent/10 px-1.5 py-0.5 text-[11.5px] font-bold text-accent-deep">{b.save}</span>}
            </button>
          )
        })}
      </div>
      <div className="relative mt-3 h-[44px] overflow-hidden sm:h-[48px]" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={annual ? 'a' : 'm'}
            className="absolute inset-x-0 top-0 font-display text-[36px] font-bold leading-none tracking-[-0.04em] text-[#070D2B] tabular-nums sm:text-[40px]"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {annual ? b.priceA : b.priceM}
            <span className="ml-1.5 text-[17px] font-semibold tracking-normal text-[#0B1030]/45">{b.per}</span>
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="text-[12.5px] text-[#0B1030]/50">{annual ? b.noteA : b.noteM}</p>
    </div>
  )
}
