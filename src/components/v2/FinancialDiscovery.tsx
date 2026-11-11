import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { AnimatePresence, MotionConfig, motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { Variants } from 'motion/react'
import { Lightbulb } from 'lucide-react'
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

/*
 * Montanha oficial (public/images/mountain-line.jpg, 1122×940): a linha azul
 * tem três pontos e o cume. Os três pontos são os três momentos da análise.
 * Coordenadas medidas na imagem original; o palco mantém a proporção da imagem,
 * por isso os marcadores ficam sempre em cima dos pontos.
 */
const IMG_W = 1122
// Imagem original: 1122×940 px.
/** Altura visível no palco: corta a floresta, mantendo toda a linha (y 27–578). */
const VIEW_H = 640
const POINTS = [
  { x: 438, y: 447 },
  { x: 604, y: 335 },
  { x: 767, y: 196 },
]
const LINE = 'M268 578 C340 520 392 478 438 447 S560 362 604 335 S720 232 767 196 S905 120 951 27'
// Fração do comprimento da linha até cada ponto (o cume fica em 1).
const REACH = [0.3, 0.52, 0.75]

/**
 * Nova secção 3 — Descoberta Financeira, "a subida até à decisão". Três momentos
 * (Compreender, Antecipar, Decidir) ligados aos três pontos da linha de luz da
 * montanha; a análise aparece num painel no estilo do Finer Advisor, com o céu
 * da plataforma no topo. Escolha sempre do visitante (sem avanço automático).
 * Versões anteriores: ?secao=clareza (Dos números à decisão), ?beneficios=motion.
 */
export function FinancialDiscovery() {
  const { lang } = useLanguage()
  const t = getCopy(lang)
  const reduced = useReducedMotion() ?? false
  const [step, setStep] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const stageRef = useRef<HTMLDivElement>(null)
  const seen = useInView(stageRef, { once: true, amount: 0.35 })
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'end start'] })
  const drift = useTransform(scrollYProgress, [0, 1], ['-2.5%', '2.5%'])

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = ['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : ['ArrowUp', 'ArrowLeft'].includes(e.key) ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = (i + d + 3) % 3
    setStep(next)
    refs.current[next]?.focus()
  }

  return (
    <MotionConfig reducedMotion="user">
      <section id="problema" aria-labelledby="descoberta-titulo" className="relative isolate scroll-mt-20 overflow-hidden bg-navy text-white">
        {/* Destinos já usados no menu e no rodapé ("Produto" → #demo, "Os desafios" → #problema) */}
        <span id="demo" aria-hidden="true" className="pointer-events-none absolute top-0 scroll-mt-20" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_75%_35%,rgba(0,82,255,0.18),transparent_70%)]" />

        <motion.div className="mx-auto max-w-content px-5 pb-14 pt-16 sm:px-6 lg:px-8 lg:pb-16 lg:pt-20" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          {/* Cabeçalho */}
          <div className="mx-auto max-w-[820px] text-center">
            <motion.p variants={item} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-glow">{t.eyebrow}</motion.p>
            <motion.h2 variants={item} id="descoberta-titulo" className="mt-3 text-balance font-display text-[32px] font-bold leading-[1.06] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]">
              {t.title[0]}
              <span className="text-glow">{t.title[1]}</span>
            </motion.h2>
            <motion.p variants={item} className="mx-auto mt-4 max-w-[560px] text-[16.5px] leading-[1.6] text-white/70 sm:text-[18px]">{t.sub}</motion.p>
          </div>

          <motion.div variants={item} className="mt-10 grid grid-cols-[minmax(0,1fr)] items-center gap-8 lg:mt-14 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)] lg:gap-12">
            {/* Momentos editoriais */}
            <div role="tablist" aria-label={t.nav} aria-orientation="vertical" className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-1">
              {t.steps.map((s, i) => {
                const on = step === i
                return (
                  <button
                    key={s.k}
                    ref={(el) => { refs.current[i] = el }}
                    type="button"
                    role="tab"
                    id={`desc-tab-${i}`}
                    aria-selected={on}
                    aria-controls="desc-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => setStep(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    className="group relative flex flex-col items-start gap-1 rounded-xl py-3 pl-4 pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow lg:flex-row lg:items-baseline lg:gap-5 lg:py-5 lg:pl-6"
                  >
                    <span aria-hidden="true" className="absolute bottom-3 left-0 top-3 w-px bg-white/10" />
                    {on && <motion.span layoutId="desc-luz" transition={{ duration: 0.3, ease: EASE }} aria-hidden="true" className="absolute bottom-3 left-0 top-3 w-[2px] rounded-full bg-glow shadow-[0_0_12px_rgba(30,144,255,0.95)]" />}
                    <span className={cn('font-display text-[26px] font-bold leading-none tabular-nums tracking-[-0.03em] transition-colors duration-300 lg:text-[44px]', on ? 'text-glow' : 'text-white/25 group-hover:text-white/45')}>0{i + 1}</span>
                    <span className="min-w-0">
                      <span className={cn('block font-display text-[15px] font-bold transition-colors duration-300 sm:text-[19px] lg:text-[21px]', on ? 'text-white' : 'text-white/55 group-hover:text-white/80')}>{s.k}</span>
                      <span className={cn('mt-0.5 hidden text-[14px] transition-colors duration-300 sm:block', on ? 'text-white/70' : 'text-white/35 group-hover:text-white/55')}>{s.q}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Palco: montanha + painel Finer Advisor */}
            <div className="min-w-0">
              <div ref={stageRef} className="relative overflow-hidden rounded-[28px] shadow-[0_50px_100px_-50px_rgba(0,82,255,0.55)] ring-1 ring-white/10" style={{ aspectRatio: `${IMG_W} / ${VIEW_H}` }}>
                <motion.div className="absolute inset-0" style={reduced ? undefined : { y: drift, scale: 1.06 }}>
                  <img src="/images/mountain-line.jpg" alt="" aria-hidden="true" decoding="async" loading="lazy" className="absolute inset-0 h-full w-full select-none object-cover object-top" draggable={false} />
                  {/* Linha de luz: desenha-se uma vez à entrada e acompanha o momento ativo */}
                  <svg aria-hidden="true" viewBox={`0 0 ${IMG_W} ${VIEW_H}`} preserveAspectRatio="xMidYMin slice" className="absolute inset-0 h-full w-full">
                    <motion.path
                      d={LINE}
                      fill="none"
                      stroke="#7FC4FF"
                      strokeWidth="5"
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(30,144,255,0.95)) drop-shadow(0 0 18px rgba(0,82,255,0.7))' }}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: seen || reduced ? REACH[step] : 0 }}
                      transition={{ duration: seen ? 0.7 : 0, ease: EASE }}
                    />
                  </svg>
                  {/* Marcadores nos três pontos da linha */}
                  {POINTS.map((p, i) => {
                    const on = step === i
                    return (
                      <button
                        key={i}
                        type="button"
                        tabIndex={-1}
                        aria-hidden="true"
                        onClick={() => setStep(i)}
                        className="group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                        style={{ left: `${(p.x / IMG_W) * 100}%`, top: `${(p.y / VIEW_H) * 100}%` }}
                      >
                        <span className={cn('rounded-full transition-all duration-300', on ? 'h-4 w-4 bg-white shadow-[0_0_0_6px_rgba(30,144,255,0.35),0_0_24px_rgba(30,144,255,1)]' : 'h-3 w-3 bg-white/80 shadow-[0_0_12px_rgba(30,144,255,0.8)] group-hover:h-3.5 group-hover:w-3.5')} />
                        {on && (
                          <motion.span key={`l-${i}`} className="absolute left-9 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-[#070D2B]/70 px-3 py-1 text-[12px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm sm:block" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, ease: EASE, delay: 0.25 }}>
                            0{i + 1} · {t.steps[i].k}
                          </motion.span>
                        )}
                      </button>
                    )
                  })}
                </motion.div>
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#070D2B] to-transparent" />
              </div>

              {/* Painel no estilo do Finer Advisor, com o céu da plataforma no topo */}
              <div id="desc-panel" role="tabpanel" aria-labelledby={`desc-tab-${step}`} className="relative z-10 mx-3 -mt-16 overflow-hidden rounded-[20px] bg-white text-[#070D2B] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] -mt-8 sm:mx-6 sm:-mt-12 lg:ml-6 lg:mr-auto lg:-mt-14 lg:w-[82%]" data-desc-panel>
                <div className="relative h-14 overflow-hidden">
                  <img src="/images/finer-sky.webp" alt="" aria-hidden="true" decoding="async" className="absolute inset-0 h-full w-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/70" />
                  <div className="relative flex h-full items-end justify-between gap-3 px-5 pb-2">
                    <p className="whitespace-nowrap font-display text-[19px] font-bold tracking-[-0.02em]">Finer Advisor<span className="text-accent">.</span></p>
                    <span className="mb-1 whitespace-nowrap rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-[#0B1030]/60"><span className="sm:hidden">{t.noteShort}</span><span className="hidden sm:inline">{t.note}</span></span>
                  </div>
                </div>
                <div className="grid min-h-[340px] px-5 pb-5 pt-4 sm:min-h-[326px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={step}
                      className="col-start-1 row-start-1 min-w-0"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } }}
                      exit={{ opacity: 0, y: -5, transition: { duration: 0.16 } }}
                    >
                      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent">0{step + 1} · {t.steps[step].q}</p>
                      {step === 0 && <Understand t={t} />}
                      {step === 1 && <Anticipate t={t} lang={lang} />}
                      {step === 2 && <Decide t={t} lang={lang} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Os quatro temas, numa linha editorial sobre o navy */}
          <motion.div variants={item} className="mx-auto mt-12 max-w-[900px] border-t border-white/10 pt-6 lg:mt-14">
            <p className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] font-semibold uppercase tracking-[0.2em] text-white/45">
              <span className="text-white/30">{t.pillarsLabel}</span>
              {t.pillars.map((p, i) => (
                <span key={p} className="inline-flex items-center gap-2 text-white/80">
                  <span className="text-glow">0{i + 1}</span>
                  {p}
                </span>
              ))}
            </p>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

type Copy = ReturnType<typeof getCopy>

/* 01 · Compreender — a situação, num relance */
function Understand({ t }: { t: Copy }) {
  const [value, label] = t.understand.kpis[0]
  return (
    <div className="mt-3">
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-[42px] font-bold leading-none tracking-[-0.04em] tabular-nums sm:text-[52px]">{value}</span>
        <span className="text-[14px] font-semibold text-[#0B1030]/60">{label.toLowerCase()} · <span className="text-accent">{t.understand.kpis[1][0]} {t.understand.kpis[1][1].toLowerCase()}</span></span>
      </p>
      <p className="mt-3 text-[16px] leading-[1.55] text-[#0B1030]/80">{t.understand.text}</p>
      <p className="mt-1 text-[13.5px] text-[#0B1030]/55">{t.understand.meta}</p>
    </div>
  )
}

/* 02 · Antecipar — da apresentação à interpretação, com evidências */
function Anticipate({ t, lang }: { t: Copy; lang: Lang }) {
  const a = t.anticipate
  const main = a.rows[0]
  const other = a.rows[1]
  return (
    <div className="mt-3">
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-[42px] font-bold leading-none tracking-[-0.04em] text-accent tabular-nums sm:text-[52px]">{a.share}</span>
        <span className="text-[14px] font-semibold text-[#0B1030]/65">{a.shareText}</span>
      </p>
      {/* Uma só barra: o peso do Cliente A face aos outros */}
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-[#0B1030]/[0.08]">
        <motion.span className="h-full origin-left rounded-full bg-accent" style={{ width: `${(main.value / TOTAL_OVERDUE) * 100}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }} />
      </div>
      <p className="mt-2 flex flex-wrap justify-between gap-x-4 text-[13px] text-[#0B1030]/65">
        <span><strong className="text-[#070D2B]">{main.label}</strong> {eur(main.value, lang)} · {main.meta}</span>
        <span>{other.label} {eur(other.value, lang)}</span>
      </p>
      <p className="mt-3 text-[14.5px] leading-[1.55] text-[#0B1030]/80">{a.text}</p>
      <p className="mt-2 text-[13.5px] text-[#0B1030]/60">{a.commitments}: <strong className="tabular-nums text-[#070D2B]">{eur(COMMITMENTS_TOTAL, lang)}</strong></p>
    </div>
  )
}

/* 03 · Decidir — recomendação explicável, no estilo do Finer Advisor */
function Decide({ t, lang }: { t: Copy; lang: Lang }) {
  const d = t.decide
  return (
    <div className="mt-3">
      <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0B1030]/55">
        <Lightbulb className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        {d.badge}
      </p>
      <p className="mt-1.5 font-display text-[20px] font-bold leading-snug tracking-[-0.015em] sm:text-[22px]">{d.title}</p>
      <p className="mt-1 text-[14px] leading-[1.5] text-[#0B1030]/70">{d.text}</p>
      <ol className="mt-2 divide-y divide-[#0B1030]/[0.07]">
        {d.list.map((r, i) => (
          <li key={r.label} className="flex items-center gap-3 py-1.5">
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', i === 0 ? 'bg-accent text-white' : 'bg-[#EEF3FF] text-accent')}>{r.n}</span>
            <span className="min-w-0 flex-1">
              <span className="text-[14.5px] font-semibold">{r.label}</span>
              <span className="ml-2 text-[12.5px] text-[#0B1030]/55">{r.detail}</span>
            </span>
            <span className="text-[15px] font-bold tabular-nums">{eur(r.value, lang)}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-[12px] leading-snug text-[#0B1030]/50">{d.source}</p>
    </div>
  )
}
