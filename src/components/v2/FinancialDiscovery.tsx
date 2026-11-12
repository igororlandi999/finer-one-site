import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { MotionConfig, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'motion/react'
import type { Variants } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import {
  AVG_DAYS_LATE, CLIENT_NAMES, COMMITMENTS_TOTAL, INVOICES, MAIN_CLIENT_SHARE, MAIN_CLIENT_TOTAL,
  OTHERS_TOTAL, OVERDUE_COUNT, TOTAL_OVERDUE, eur, pct,
} from '@/components/v2/story/storyData'

const EASE = [0.22, 1, 0.36, 1] as const

/* Factos derivados do cenário único (storyData) — nada é calculado fora dele. */
const mainInv = INVOICES.filter((i) => i.client === 'A')
const otherInv = INVOICES.filter((i) => i.client !== 'A')
const range = (xs: typeof INVOICES) => [Math.min(...xs.map((i) => i.daysLate)), Math.max(...xs.map((i) => i.daysLate))] as const
const OLDEST = Math.max(...INVOICES.map((i) => i.daysLate))

function getCopy(lang: Lang) {
  const pt = lang === 'pt'
  const [mMin, mMax] = range(mainInv)
  const [oMin, oMax] = range(otherInv)
  return {
    eyebrow: pt ? 'Mais do que um dashboard' : 'More than a dashboard',
    title: pt ? ['O saldo não conta ', 'a história toda.'] : ['The balance doesn’t tell ', 'the whole story.'],
    sub: pt ? 'Veja como uma análise transforma informação financeira numa prioridade concreta.' : 'See how an analysis turns financial information into a concrete priority.',
    nav: pt ? 'Momentos da análise' : 'Analysis steps',
    note: pt ? 'Exemplo com dados fictícios' : 'Example with fictitious data',
    noteShort: pt ? 'Dados fictícios' : 'Fictitious data',
    steps: pt
      ? [
          { k: 'Compreender', q: 'O que está a acontecer?' },
          { k: 'Antecipar', q: 'O que merece atenção?' },
          { k: 'Decidir', q: 'Qual é o próximo passo?' },
        ]
      : [
          { k: 'Understand', q: 'What is happening?' },
          { k: 'Anticipate', q: 'What deserves attention?' },
          { k: 'Decide', q: 'What is the next step?' },
        ],
    understand: {
      kpis: pt
        ? [[eur(TOTAL_OVERDUE, lang), 'Faturas por receber'], [String(OVERDUE_COUNT), 'Faturas em atraso']]
        : [[eur(TOTAL_OVERDUE, lang), 'Invoices receivable'], [String(OVERDUE_COUNT), 'Overdue invoices']],
      text: pt ? 'Existem recebimentos em aberto que merecem acompanhamento.' : 'There are open receivables that deserve follow-up.',
      meta: pt ? `Atraso médio de ${AVG_DAYS_LATE} dias · a mais antiga com ${OLDEST} dias` : `Average delay of ${AVG_DAYS_LATE} days · oldest at ${OLDEST} days`,
    },
    anticipate: {
      text: pt
        ? 'As faturas em atraso podem pressionar a tesouraria, sobretudo quando os recebimentos não coincidem com os compromissos de pagamento.'
        : 'Overdue invoices can put pressure on cash, especially when collections do not line up with payment commitments.',
      byClient: pt ? 'Valor em atraso por cliente' : 'Overdue amount by customer',
      rows: [
        { label: CLIENT_NAMES[lang].A, value: MAIN_CLIENT_TOTAL, meta: pt ? `${mainInv.length} faturas · ${mMin}–${mMax} dias` : `${mainInv.length} invoices · ${mMin}–${mMax} days` },
        { label: pt ? `Outros ${otherInv.length} clientes` : `Other ${otherInv.length} customers`, value: OTHERS_TOTAL, meta: pt ? `${otherInv.length} faturas · ${oMin}–${oMax} dias` : `${otherInv.length} invoices · ${oMin}–${oMax} days` },
      ],
      share: pct(MAIN_CLIENT_SHARE, lang),
      shareText: pt ? `do valor em atraso depende de um único cliente.` : `of the overdue amount depends on a single customer.`,
      commitments: pt ? 'Compromissos de pagamento nos próximos 15 dias' : 'Payment commitments in the next 15 days',
      commitmentsNote: pt ? 'Salários, fornecedores e impostos.' : 'Salaries, suppliers and taxes.',
    },
    decide: {
      badge: pt ? 'Recomendação Finer One' : 'Finer One recommendation',
      title: pt ? 'Comece por acompanhar as cobranças de maior impacto.' : 'Start by following up the highest-impact collections.',
      text: pt ? 'Consulte os clientes envolvidos, os montantes e os prazos para definir prioridades de acompanhamento.' : 'Check the customers involved, the amounts and the due dates to set follow-up priorities.',
      order: pt ? 'Ordem sugerida' : 'Suggested order',
      list: [
        { n: 1, label: CLIENT_NAMES[lang].A, detail: pt ? `${mainInv.length} faturas · até ${mMax} dias de atraso` : `${mainInv.length} invoices · up to ${mMax} days late`, value: MAIN_CLIENT_TOTAL },
        { n: 2, label: pt ? `Outros ${otherInv.length} clientes` : `Other ${otherInv.length} customers`, detail: pt ? `${otherInv.length} faturas · até ${oMax} dias de atraso` : `${otherInv.length} invoices · up to ${oMax} days late`, value: OTHERS_TOTAL },
      ],
      source: pt
        ? 'Baseada nos dados demonstrativos desta análise. Apoia a decisão; não a toma por si nem garante resultados.'
        : 'Recommendation based on the demo data in this analysis. It supports the decision; it does not make it for you or guarantee results.',
    },
    pillars: pt ? ['Recebimentos', 'Tesouraria', 'Custos', 'Prioridades'] : ['Receivables', 'Cash', 'Costs', 'Priorities'],
    pillarsLabel: pt ? 'A Finer One analisa' : 'Finer One analyses',
  }
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }

/** Número grande que sobe de dentro de uma máscara quando entra no ecrã (uma vez). */
function MaskNumber({ children, className }: { children: ReactNode; className?: string }) {
  // O gatilho fica no contentor visível (a parte interior começa fora da máscara).
  return (
    <motion.span className="block overflow-hidden pb-[0.08em]" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
      <motion.span
        className={cn('block', className)}
        variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.75, ease: EASE } } }}
      >
        {children}
      </motion.span>
    </motion.span>
  )
}

/**
 * Linha de luz Finer One guiada pelo scroll: desce pela secção e liga os três
 * capítulos. Desenhada em coordenadas reais (sem distorção), acende cada ponto
 * quando o leitor lá chega. Não esconde conteúdo nem controla a página.
 */
function useLightPath(wrap: RefObject<HTMLDivElement | null>, dots: RefObject<(HTMLSpanElement | null)[]>) {
  const [geo, setGeo] = useState<{ w: number; h: number; d: string; marks: { x: number; y: number; at: number }[] }>({ w: 0, h: 0, d: '', marks: [] })
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const measure = () => {
      const box = el.getBoundingClientRect()
      const pts = (dots.current ?? []).filter(Boolean).map((d) => {
        const r = (d as HTMLSpanElement).getBoundingClientRect()
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top }
      })
      if (!pts.length) return
      const start = { x: pts[0].x, y: 0 }
      const all = [start, ...pts, { x: pts[pts.length - 1].x, y: box.height }]
      let d = `M ${all[0].x} ${all[0].y}`
      for (let i = 1; i < all.length; i++) {
        const a = all[i - 1]
        const b = all[i]
        const my = (a.y + b.y) / 2
        d += ` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`
      }
      setGeo({ w: box.width, h: box.height, d, marks: pts.map((p) => ({ ...p, at: p.y / box.height })) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [wrap, dots])
  return geo
}

/**
 * Nova secção 3 — Descoberta Financeira, em formato editorial (cartaz), sobre
 * branco com a atmosfera azul da marca. Três capítulos (Compreender, Antecipar,
 * Decidir) sempre visíveis, com números grandes e uma linha de luz que os liga
 * à medida que se faz scroll. Sem interface da plataforma (não repetir a secção 2).
 * Versões anteriores: ?secao=clareza (Dos números à decisão), ?beneficios=motion.
 */
export function FinancialDiscovery() {
  const { lang } = useLanguage()
  const t = getCopy(lang)
  const reduced = useReducedMotion() ?? false
  const wrap = useRef<HTMLDivElement>(null)
  const dots = useRef<(HTMLSpanElement | null)[]>([])
  const geo = useLightPath(wrap, dots)
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start 0.75', 'end 0.55'] })
  const draw = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })
  const [reached, setReached] = useState(reduced ? 3 : 0)
  useMotionValueEvent(draw, 'change', (v) => {
    if (reduced) return
    const n = geo.marks.filter((m) => v >= m.at - 0.02).length
    setReached((r) => (r === n ? r : n))
  })

  const [mMin, mMax] = range(mainInv)
  const chapters = [
    {
      key: t.steps[0].k,
      q: t.steps[0].q,
      big: eur(TOTAL_OVERDUE, lang),
      bigClass: 'text-[#070D2B]',
      caption: lang === 'pt' ? `por receber · ${OVERDUE_COUNT} faturas em atraso` : `receivable · ${OVERDUE_COUNT} overdue invoices`,
      text: t.understand.text,
      meta: t.understand.meta,
    },
    {
      key: t.steps[1].k,
      q: t.steps[1].q,
      big: t.anticipate.share,
      bigClass: 'text-accent-deep',
      caption: t.anticipate.shareText,
      text: t.anticipate.text,
      meta: lang === 'pt'
        ? `${CLIENT_NAMES[lang].A}: ${eur(MAIN_CLIENT_TOTAL, lang)} em ${mainInv.length} faturas (${mMin}–${mMax} dias) · compromissos a 15 dias: ${eur(COMMITMENTS_TOTAL, lang)}`
        : `${CLIENT_NAMES[lang].A}: ${eur(MAIN_CLIENT_TOTAL, lang)} in ${mainInv.length} invoices (${mMin}–${mMax} days) · 15-day commitments: ${eur(COMMITMENTS_TOTAL, lang)}`,
    },
    {
      key: t.steps[2].k,
      q: t.steps[2].q,
      big: lang === 'pt' ? `Comece pelo ${CLIENT_NAMES[lang].A}.` : `Start with ${CLIENT_NAMES[lang].A}.`,
      bigClass: 'text-[#070D2B]',
      caption: lang === 'pt' ? `${eur(MAIN_CLIENT_TOTAL, lang)} · ${mainInv.length} faturas · até ${mMax} dias de atraso` : `${eur(MAIN_CLIENT_TOTAL, lang)} · ${mainInv.length} invoices · up to ${mMax} days late`,
      text: `${t.decide.title} ${t.decide.text}`,
      meta: t.decide.source,
    },
  ]

  return (
    <MotionConfig reducedMotion="user">
      <section id="problema" aria-labelledby="descoberta-titulo" className="relative isolate scroll-mt-20 overflow-hidden bg-white text-navy">
        {/* Destinos já usados no menu e no rodapé ("Produto" → #demo, "Os desafios" → #problema) */}
        <span id="demo" aria-hidden="true" className="pointer-events-none absolute top-0 scroll-mt-20" />
        {/* Fundo branco puro (como Ramp e Searchable); a atmosfera vive só no bloco do céu. Transição suave para a secção 4. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
        </div>

        <motion.div className="mx-auto max-w-content px-5 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-10" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          {/* Cabeçalho */}
          <div className="mx-auto max-w-[820px] text-center">
            <motion.p variants={item} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">{t.eyebrow}</motion.p>
            <motion.h2 variants={item} id="descoberta-titulo" className="mt-3 text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[48px] lg:text-[60px]">
              {t.title[0]}
              <span className="text-accent-deep">{t.title[1]}</span>
            </motion.h2>
            <motion.p variants={item} className="mx-auto mt-5 max-w-[560px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</motion.p>
          </div>

          {/* Três capítulos ligados pela linha de luz */}
          <div ref={wrap} className="relative mx-auto mt-10 max-w-[1080px] lg:mt-12">
            {geo.d && (
              <svg aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
                <path d={geo.d} fill="none" stroke="rgba(11,16,48,0.08)" strokeWidth="1.5" />
                <motion.path d={geo.d} fill="none" stroke="rgba(30,144,255,0.22)" strokeWidth="9" strokeLinecap="round" style={{ pathLength: reduced ? 1 : draw }} />
                <motion.path
                  d={geo.d}
                  fill="none"
                  stroke="#0052FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ pathLength: reduced ? 1 : draw }}
                />
              </svg>
            )}

            <ol className="relative">
              {chapters.map((c, i) => {
                const lit = reached > i
                const right = i % 2 === 1
                const tile = i === 1 // ponto alto da análise: bloco na cor da marca
                return (
                  <li key={c.key} className={cn('relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-4 sm:gap-x-6 lg:grid-cols-2 lg:gap-x-16', i > 0 && 'mt-10 sm:mt-14 lg:-mt-32')}>
                    {/* Ponto da linha */}
                    <span
                      ref={(el) => { dots.current[i] = el }}
                      aria-hidden="true"
                      className={cn(
                        'relative z-10 mt-3 h-3.5 w-3.5 justify-self-center rounded-full border-2 transition-all duration-500 lg:absolute lg:left-1/2 lg:top-3 lg:mt-0 lg:-translate-x-1/2',
                        lit ? 'border-accent bg-white shadow-[0_0_0_6px_rgba(0,82,255,0.12),0_0_18px_rgba(30,144,255,0.9)]' : 'border-[#0B1030]/20 bg-white',
                      )}
                    />
                    <motion.div
                      className={cn('relative min-w-0 lg:col-span-1', right ? 'lg:col-start-2 lg:pl-4' : 'lg:col-start-1 lg:pr-4 lg:text-right', tile && 'isolate overflow-hidden rounded-[28px] bg-[#0A2878] p-6 text-white shadow-[0_40px_80px_-40px_rgba(10,40,120,0.9)] sm:p-8 lg:ml-4 lg:pl-8')}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      {tile && (
                        <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                          {/* Céu Finer (o mesmo da plataforma), mais escuro e "fim de tarde" */}
                          <img src="/images/finer-sky.webp" alt="" decoding="async" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
                          <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,64,200,0.35)_0%,rgba(10,52,170,0.78)_42%,rgba(10,40,120,0.96)_100%)]" />
                        </span>
                      )}
                      <p className={cn('relative flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em]', right ? '' : 'lg:justify-end', tile ? 'text-white/85' : lit ? 'text-accent-deep' : 'text-[#0B1030]/45')}>
                        <span className="font-display text-[13px] font-bold tracking-[0.1em]">0{i + 1}</span>
                        <span aria-hidden="true" className={cn('h-px w-6 transition-colors duration-500', tile ? 'bg-white/70' : lit ? 'bg-accent' : 'bg-[#0B1030]/20')} />
                        {c.key}
                      </p>
                      <h3 className={cn('relative mt-2 text-[17px] font-semibold sm:text-[19px]', tile ? 'text-white/85' : 'text-[#0B1030]/70')}>{c.q}</h3>
                      <MaskNumber className={cn('mt-3 font-display font-bold leading-none tracking-[-0.045em] tabular-nums', i === 2 ? 'text-[36px] sm:text-[52px] lg:text-[58px]' : i === 0 ? 'whitespace-nowrap text-[42px] sm:text-[64px] lg:text-[70px]' : 'text-[56px] sm:text-[84px] lg:text-[96px]', tile ? 'text-white' : c.bigClass, 'leading-[0.98]')}>
                        {c.big}
                      </MaskNumber>
                      <p className={cn('relative mt-2 text-[15px] font-semibold sm:text-[16px]', tile ? 'text-white/80' : 'text-[#0B1030]/60')}>{c.caption}</p>
                      <p className={cn('relative mt-3 max-w-[460px] text-[16px] leading-[1.6] sm:text-[17px]', right ? '' : 'lg:ml-auto', tile ? 'text-white/95' : 'text-[#0B1030]/80')}>{c.text}</p>
                      <p className={cn('relative mt-2 max-w-[460px] text-[13px] leading-snug', right ? '' : 'lg:ml-auto', tile ? 'text-white/75' : 'text-[#0B1030]/50')}>{c.meta}</p>
                    </motion.div>
                  </li>
                )
              })}
            </ol>
          </div>

        </motion.div>
      </section>
    </MotionConfig>
  )
}
