import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MotionConfig, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import type { MotionValue, Variants } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

/** Duas linhas ilustrativas por situação (sem valores): a de referência e a que a Finer One ajuda a ver. */
/** aY/bY: onde cada linha termina; aLabel/bLabel: [texto, y do texto]; gap: [texto, x, y]. */
type Chart = { a: string; b: string; fill?: string; aY: number; bY: number; aLabel: [string, number]; bLabel: [string, number]; gap?: [string, number, number] }
type Context = { segment: string; title: string; question: string; text: string; message: string; chart: Chart }

const charts: Chart[] = [
  // 01 — Faturado sobe, recebido fica para trás: a distância é o que está por receber
  {
    a: 'M24 176 C 130 150, 236 96, 376 44',
    b: 'M24 184 C 150 176, 250 150, 376 118',
    fill: 'M24 176 C 130 150, 236 96, 376 44 L376 118 C 250 150, 150 176, 24 184 Z',
    aY: 44, bY: 118, aLabel: ['', 44], bLabel: ['', 118], gap: ['', 340, 91],
  },
  // 02 — Receitas sobem devagar, custos sobem mais depressa: a margem encolhe
  {
    a: 'M24 118 C 140 104, 256 82, 376 64',
    b: 'M24 190 C 150 176, 260 118, 376 76',
    fill: 'M24 118 C 140 104, 256 82, 376 64 L376 76 C 260 118, 150 176, 24 190 Z',
    aY: 64, bY: 76, aLabel: ['', 58], bLabel: ['', 86], gap: ['', 288, 96],
  },
  // 03 — Vendas sobem, tesouraria desce: as duas cruzam-se
  {
    a: 'M24 172 C 140 146, 256 86, 376 40',
    b: 'M24 104 C 140 112, 256 146, 376 176',
    aY: 40, bY: 176, aLabel: ['', 40], bLabel: ['', 176],
  },
]

/**
 * Perfis que estamos a testar (Market Validation) — não são segmentos
 * comercialmente validados, por isso a página não os apresenta como tal.
 * Os gráficos são ilustrativos: não têm valores nem escalas.
 */
const copy: Record<Lang, { eyebrow: string; title: [string, string]; sub: string; fit: string; note: string; lines: [string, string, string?][]; contexts: Omit<Context, 'chart'>[] }> = {
  pt: {
    eyebrow: 'Pensada para quem gere',
    title: ['Há decisões que não podem esperar', 'pelo fim do mês.'],
    sub: 'Quando os clientes atrasam, os custos aumentam ou o negócio cresce, a informação financeira tem de acompanhar.',
    fit: 'Para PME com clientes empresariais, valores a receber, custos recorrentes e dados financeiros dispersos.',
    note: 'Ilustrativo · sem valores reais',
    lines: [['Faturado', 'Recebido', 'Por receber'], ['Receitas', 'Custos', 'Margem'], ['Vendas', 'Tesouraria']],
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
    title: ['Some decisions can’t wait', 'for month-end.'],
    sub: 'When customers pay late, costs rise or the business grows, financial information has to keep up.',
    fit: 'For SMEs with business customers, receivables, recurring costs and scattered financial data.',
    note: 'Illustrative · no real figures',
    lines: [['Invoiced', 'Collected', 'Receivable'], ['Revenue', 'Costs', 'Margin'], ['Sales', 'Cash']],
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
const rise: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }

/** Desktop largo e com movimento: a secção fica fixa e as situações passam com o scroll. */
function usePinned() {
  const reduced = useReducedMotion() ?? false
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (min-height: 600px)')
    const on = () => setWide(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide && !reduced
}

/**
 * Secção 5 — Para quem é. Três situações reconhecíveis contadas como
 * "histórias" (à maneira da Lovable): a pergunta do empresário em destaque,
 * com uma linha de cor, e ao lado duas linhas de luz que mostram a tensão
 * (faturado vs recebido, receitas vs custos, vendas vs tesouraria).
 * No desktop a secção fica fixa e as histórias deslizam com o scroll.
 */
export function ForWhom() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const pinned = usePinned()
  const items: Context[] = t.contexts.map((c, i) => ({ ...c, chart: withLabels(charts[i], t.lines[i]) }))

  return (
    <MotionConfig reducedMotion="user">
      <section id="para-quem" aria-labelledby="para-quem-titulo" className="relative isolate scroll-mt-20 overflow-clip bg-navy text-white">
        {/* Luz da marca, muito ténue, no topo */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(45%_60%_at_20%_0%,rgba(0,82,255,0.2),transparent_70%)]" />
        {pinned ? <Pinned t={t} items={items} /> : <Stacked t={t} items={items} />}
      </section>
    </MotionConfig>
  )
}

function withLabels(c: Chart, l: [string, string, string?]): Chart {
  return { ...c, aLabel: [l[0], c.aLabel[1]], bLabel: [l[1], c.bLabel[1]], gap: c.gap && l[2] ? [l[2], c.gap[1], c.gap[2]] : undefined }
}

type T = (typeof copy)['pt']

function Header({ t, compact }: { t: T; compact?: boolean }) {
  return (
    <motion.div variants={group} className={cn('grid gap-6', compact ? 'lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end lg:gap-10 xl:grid-cols-[minmax(0,1fr)_380px]' : '')}>
      <div>
        <motion.p variants={rise} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-glow">{t.eyebrow}</motion.p>
        {/* Título em dois tons, à maneira da Ramp */}
        <motion.h2 variants={rise} id="para-quem-titulo" className={cn('mt-3 text-balance font-display font-bold tracking-[-0.04em]', compact ? 'whitespace-nowrap text-[40px] leading-[1.04] xl:text-[44px] [@media(max-height:780px)]:text-[36px]' : 'text-[34px] sm:text-[48px] leading-[1.03]')}>
          <span className="block">{t.title[0]}</span>
          <span className="block text-white/40">{t.title[1]}</span>
        </motion.h2>
      </div>
      <motion.div variants={rise}>
        <p className={cn('text-[16px] leading-[1.6] text-white/70 sm:text-[17px]', compact && '[@media(max-height:780px)]:text-[15px]')}>{t.sub}</p>
        <p className={cn('mt-3 text-[13.5px] leading-relaxed text-white/45', compact && '[@media(max-height:780px)]:hidden')}>{t.fit}</p>
      </motion.div>
    </motion.div>
  )
}

/* ---------------- Desktop: secção fixa, histórias deslizam com o scroll ---------------- */

function Pinned({ t, items }: { t: T; items: Context[] }) {
  const outer = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const [geo, setGeo] = useState({ card: 900, gap: 24, vw: 1200 })
  const [active, setActive] = useState(0)

  // Largura de cada história: ~74% da largura útil, para a seguinte espreitar à direita
  useLayoutEffect(() => {
    const el = viewport.current
    if (!el) return
    const ro = new ResizeObserver(() => setGeo({ card: Math.round(el.clientWidth * 0.74), gap: 24, vw: el.clientWidth }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] })
  // 0 → 2: posição contínua entre as três histórias (pequena pausa no início e no fim)
  const pos = useTransform(scrollYProgress, [0.1, 0.9], [0, items.length - 1], { clamp: true })
  const smooth = useSpring(pos, { stiffness: 140, damping: 30, mass: 0.6 })
  const travel = items.length * geo.card + (items.length - 1) * geo.gap - geo.vw
  const x = useTransform(smooth, (p) => -(p / (items.length - 1)) * travel)
  const fill = useTransform(smooth, (p) => p / (items.length - 1))
  useMotionValueEvent(pos, 'change', (p) => setActive(Math.round(p)))

  const go = (i: number) => {
    const el = outer.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const span = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + span * (0.1 + (0.8 * i) / (items.length - 1)), behavior: 'smooth' })
  }

  return (
    <div ref={outer} className="relative h-[290vh]">
      <div className="sticky top-16 flex h-[calc(100vh-64px)] flex-col overflow-hidden">
        <motion.div className="mx-auto flex h-full w-full max-w-content flex-col px-8 pb-6 pt-8 xl:pb-8 xl:pt-12 [@media(max-height:780px)]:pt-6 [@media(max-height:780px)]:pb-5" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
          <Header t={t} compact />

          {/* Faixa das histórias */}
          <motion.div variants={rise} ref={viewport} className="relative mt-7 min-h-0 flex-1 xl:mt-9 [@media(max-height:780px)]:mt-5">
            <motion.ul className="flex h-full" style={{ x, gap: geo.gap }}>
              {items.map((c, i) => (
                <li key={c.title} className="h-full shrink-0" style={{ width: geo.card }}>
                  <StoryCard c={c} i={i} on={i === active} note={t.note} focus={smooth} />
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Progresso: linha de luz que enche com o scroll; cada situação é clicável */}
          <motion.div variants={rise} className="mt-6 grid grid-cols-3 gap-6 [@media(max-height:780px)]:mt-4">
            <div className="relative col-span-3 h-px bg-white/10">
              <motion.span aria-hidden="true" className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-accent to-glow shadow-[0_0_10px_rgba(30,144,255,0.9)]" style={{ scaleX: fill }} />
            </div>
            {items.map((c, i) => (
              <button
                key={c.segment}
                type="button"
                onClick={() => go(i)}
                aria-current={i === active ? 'step' : undefined}
                className={cn('-mt-3 flex items-center gap-3 text-left text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300', i === active ? 'text-white' : 'text-white/40 hover:text-white/70', i === 1 && 'justify-center', i === 2 && 'justify-end')}
              >
                <span className={cn('font-display text-[13px] tracking-[0.1em]', i === active ? 'text-glow' : '')}>0{i + 1}</span>
                {c.segment}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

/* ---------------- Mobile, tablet e movimento reduzido: histórias empilhadas ---------------- */

function Stacked({ t, items }: { t: T; items: Context[] }) {
  return (
    <div className="mx-auto max-w-content px-5 py-16 sm:px-6 sm:py-20">
      <motion.div variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
        <Header t={t} />
      </motion.div>
      <ul className="mt-10 space-y-5">
        {items.map((c, i) => (
          <motion.li key={c.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.6, ease: EASE }}>
            <InView>{(on) => <StoryCard c={c} i={i} on={on} note={t.note} />}</InView>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

function InView({ children }: { children: (on: boolean) => React.ReactNode }) {
  const [on, setOn] = useState(false)
  return (
    <motion.div onViewportEnter={() => setOn(true)} viewport={{ once: true, amount: 0.45 }}>
      {children(on)}
    </motion.div>
  )
}

/* ---------------- História ---------------- */

function StoryCard({ c, i, on, note, focus }: { c: Context; i: number; on: boolean; note: string; focus?: MotionValue<number> }) {
  // Com o scroll, as histórias fora de foco ficam mais discretas
  const fallback = useSpring(0)
  const opacity = useTransform(focus ?? fallback, (p) => (focus ? 1 - Math.min(1, Math.abs(p - i)) * 0.55 : 1))
  return (
    <motion.article
      style={{ opacity }}
      className="relative isolate grid h-full overflow-hidden rounded-[32px] bg-[linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] ring-1 ring-white/10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
    >
      {/* Luz da marca no canto, como nos cartões da secção 4 */}
      <span aria-hidden="true" className={cn('pointer-events-none absolute -z-10 h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(0,82,255,0.38),rgba(30,144,255,0.14)_50%,transparent)] transition-opacity duration-700', i % 2 ? '-left-40 -top-48' : '-right-32 -top-48', on ? 'opacity-100' : 'opacity-40')} />

      {/* Lado da pergunta */}
      <div className="flex min-h-0 flex-col justify-between gap-5 p-6 sm:p-8 xl:p-10 lg:[@media(max-height:780px)]:p-6">
        <div>
          <p className="flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-white/50">
            <span className="font-display text-[13px] font-bold tracking-[0.1em] text-glow">0{i + 1}</span>
            {c.segment}
          </p>
          {/* A pergunta, com a linha de cor à esquerda (à maneira da Lovable) */}
          <blockquote className="relative mt-5 pl-5 xl:mt-7 lg:[@media(max-height:780px)]:mt-4">
            <motion.span
              aria-hidden="true"
              className="absolute bottom-1 left-0 top-1 w-[3px] origin-top rounded-full bg-gradient-to-b from-glow via-accent to-[#8DB8F6] shadow-[0_0_12px_rgba(30,144,255,0.7)]"
              initial={false}
              animate={{ scaleY: on ? 1 : 0.15, opacity: on ? 1 : 0.4 }}
              transition={{ duration: 0.8, ease: EASE }}
            />
            <p className="text-balance font-display text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] sm:text-[26px] xl:text-[30px] lg:[@media(max-height:780px)]:text-[23px]">“{c.question}”</p>
          </blockquote>
        </div>
        <div>
          <p className={cn('max-w-[460px] text-[15px] leading-[1.6] text-white/60', 'lg:[@media(max-height:780px)]:text-[14px] lg:[@media(max-height:780px)]:leading-[1.5]')}>{c.text}</p>
          <p className="mt-3 flex items-center gap-3 text-[14px] font-semibold text-[#8FC3FF]">
            <span aria-hidden="true" className="h-px w-6 bg-glow shadow-[0_0_8px_rgba(30,144,255,0.9)]" />
            {c.message}
          </p>
        </div>
      </div>

      {/* Lado das linhas */}
      <div className="relative flex min-h-[240px] flex-col border-t border-white/[0.08] p-6 sm:p-8 lg:min-h-0 lg:border-l lg:border-t-0 xl:p-10 lg:[@media(max-height:780px)]:p-6">
        <h3 className="font-display text-[20px] font-bold tracking-[-0.02em] xl:text-[22px]">{c.title}</h3>
        <Lines chart={c.chart} on={on} />
        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/30">{note}</p>
      </div>
    </motion.article>
  )
}

/** Duas linhas de luz que se desenham quando a história fica em foco. Sem eixos, sem números. */
function Lines({ chart, on }: { chart: Chart; on: boolean }) {
  const draw = (delay: number) => ({ initial: false as const, animate: { pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }, transition: { pathLength: { duration: 1.4, ease: EASE, delay: on ? delay : 0 }, opacity: { duration: 0.3, delay: on ? delay : 0 } } })
  const label = (delay: number) => ({ initial: false as const, animate: { opacity: on ? 1 : 0, x: on ? 0 : -6 }, transition: { duration: 0.5, ease: EASE, delay: on ? delay : 0 } })
  return (
    <div className="relative mt-3 flex min-h-0 flex-1 items-center">
      <svg viewBox="0 0 470 220" className="h-full max-h-[300px] w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${chart.aLabel[0]} · ${chart.bLabel[0]}`}>
        <defs>
          <linearGradient id={`fw-fill-${chart.aLabel[0]}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#1E90FF" stopOpacity="0" />
            <stop offset="1" stopColor="#1E90FF" stopOpacity="0.28" />
          </linearGradient>
        </defs>
        {[50, 110, 170].map((y) => (
          <line key={y} x1="24" x2="376" y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 6" />
        ))}
        {chart.fill && (
          <motion.path d={chart.fill} fill={`url(#fw-fill-${chart.aLabel[0]})`} initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.9, delay: on ? 1.1 : 0 }} />
        )}
        {/* Linha de referência (branca) */}
        <motion.path d={chart.a} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" {...draw(0.1)} />
        {/* Linha que a Finer One ajuda a ver (luz azul) */}
        <motion.path d={chart.b} fill="none" stroke="rgba(30,144,255,0.28)" strokeWidth="9" strokeLinecap="round" {...draw(0.35)} />
        <motion.path d={chart.b} fill="none" stroke="#1E90FF" strokeWidth="2.5" strokeLinecap="round" {...draw(0.35)} />
        <motion.circle cx="376" cy={chart.aY} r="4" fill="#fff" {...label(1.3)} />
        <motion.circle cx="376" cy={chart.bY} r="4.5" fill="#1E90FF" style={{ filter: 'drop-shadow(0 0 6px rgba(30,144,255,0.9))' }} {...label(1.5)} />
        <motion.text x="388" y={chart.aLabel[1] + 4} fill="rgba(255,255,255,0.8)" fontSize="15" fontWeight="600" {...label(1.4)}>{chart.aLabel[0]}</motion.text>
        <motion.text x="388" y={chart.bLabel[1] + 4} fill="#8FC3FF" fontSize="15" fontWeight="600" {...label(1.6)}>{chart.bLabel[0]}</motion.text>
        {chart.gap && (
          <motion.text x={chart.gap[1]} y={chart.gap[2] + 4} fill="rgba(255,255,255,0.6)" fontSize="11.5" fontWeight="700" letterSpacing="1.6" textAnchor="middle" {...label(1.9)}>{chart.gap[0].toUpperCase()}</motion.text>
        )}
      </svg>
    </div>
  )
}
