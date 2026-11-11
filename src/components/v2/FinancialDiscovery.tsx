import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
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

/**
 * Nova secção 3 — Descoberta Financeira. Três momentos (Compreender, Antecipar,
 * Decidir) escolhidos pelo visitante, com evidências do cenário único
 * (storyData). Inclui a faixa compacta dos quatro temas de análise.
 * Versões anteriores: ?secao=clareza (Dos números à decisão), ?beneficios=motion.
 */
export function FinancialDiscovery() {
  const { lang } = useLanguage()
  const t = getCopy(lang)
  const [step, setStep] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

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
      <section id="problema" aria-labelledby="descoberta-titulo" className="relative scroll-mt-20 bg-[#F5F8FD] text-navy">
        {/* Destinos já usados no menu e no rodapé ("Produto" → #demo, "Os desafios" → #problema) */}
        <span id="demo" aria-hidden="true" className="pointer-events-none absolute top-0 scroll-mt-20" />
        <motion.div className="mx-auto max-w-content px-5 pb-12 pt-16 sm:px-6 lg:px-8 lg:pb-14 lg:pt-20" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {/* Cabeçalho */}
          <div className="mx-auto max-w-[820px] text-center">
            <motion.p variants={item} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent">{t.eyebrow}</motion.p>
            <motion.h2 variants={item} id="descoberta-titulo" className="mt-3 text-balance font-display text-[32px] font-bold leading-[1.06] tracking-[-0.035em] text-[#070D2B] sm:text-[44px] lg:text-[52px]">
              {t.title[0]}
              <span className="text-accent">{t.title[1]}</span>
            </motion.h2>
            <motion.p variants={item} className="mx-auto mt-4 max-w-[560px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</motion.p>
          </div>

          {/* Demonstração: navegação (35%) + análise (65%) */}
          <motion.div variants={item} className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 lg:mt-12 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] lg:gap-8">
            {/* Momentos, ligados pela linha Finer One */}
            <div className="relative lg:self-start">
              <span aria-hidden="true" className="absolute bottom-8 left-[27px] top-8 hidden w-px bg-[#0B1030]/[0.1] lg:block" />
              <motion.span
                aria-hidden="true"
                className="absolute bottom-8 left-[27px] top-8 hidden w-px origin-top bg-gradient-to-b from-accent via-glow to-accent/30 shadow-[0_0_8px_rgba(30,144,255,0.7)] lg:block"
                variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.9, ease: EASE, delay: 0.4 } } }}
              />
              <div role="tablist" aria-label={t.nav} aria-orientation="vertical" className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
                {t.steps.map((s, i) => {
                  const on = step === i
                  return (
                    <motion.button
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
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        'group relative flex flex-col items-start gap-1 rounded-xl px-3 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-4 lg:flex-row lg:items-center lg:gap-4 lg:py-4',
                        on ? '' : 'hover:bg-white/70',
                      )}
                    >
                      {on && <motion.span layoutId="desc-active" transition={{ duration: 0.3, ease: EASE }} className="absolute inset-0 rounded-xl border border-accent/25 bg-white shadow-[0_14px_34px_-24px_rgba(0,82,255,0.7)]" />}
                      <span className={cn('relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition-colors lg:h-7 lg:w-7', on ? 'bg-accent text-white shadow-[0_0_0_4px_rgba(0,82,255,0.12)]' : 'bg-white text-[#0B1030]/55 ring-1 ring-[#0B1030]/10 group-hover:text-[#0B1030]')}>
                        0{i + 1}
                      </span>
                      <span className="relative min-w-0">
                        <span className={cn('block text-[14px] font-bold transition-colors sm:text-[16px]', on ? 'text-[#070D2B]' : 'text-[#0B1030]/60 group-hover:text-[#0B1030]/85')}>{s.k}</span>
                        <span className={cn('hidden text-[13.5px] sm:block', on ? 'text-[#0B1030]/70' : 'text-[#0B1030]/45')}>{s.q}</span>
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Análise do momento selecionado */}
            <div id="desc-panel" role="tabpanel" aria-labelledby={`desc-tab-${step}`} className="relative grid min-h-[450px] overflow-hidden rounded-[20px] border border-[#0B1030]/[0.07] bg-white p-5 shadow-[0_24px_60px_-48px_rgba(11,16,48,0.5)] sm:p-7 lg:h-[440px] lg:min-h-0" data-desc-panel>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  className="col-start-1 row-start-1 flex min-w-0 flex-col"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-[20px] font-bold tracking-[-0.02em] text-[#070D2B] sm:text-[24px]">{t.steps[step].q}</p>
                    <span className="text-[12px] font-medium text-[#0B1030]/50">{t.note}</span>
                  </div>
                  {step === 0 && <Understand t={t} />}
                  {step === 1 && <Anticipate t={t} lang={lang} />}
                  {step === 2 && <Decide t={t} lang={lang} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Faixa editorial: os quatro temas de análise */}
          <motion.div variants={item} className="mt-12 lg:mt-14">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0B1030]/50">{t.pillarsLabel}</p>
            <div className="relative mx-auto mt-4 max-w-[880px]">
              <motion.span
                aria-hidden="true"
                className="absolute left-[12.5%] right-[12.5%] top-[5px] h-px origin-left bg-gradient-to-r from-accent/70 via-glow/70 to-accent/70"
                variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: EASE, delay: 0.2 } } }}
              />
              <ul className="relative grid grid-cols-2 gap-y-5 sm:grid-cols-4">
                {t.pillars.map((p, i) => (
                  <li key={p} className="flex flex-col items-center gap-2.5">
                    <span className="h-[11px] w-[11px] rounded-full border-2 border-accent bg-[#F5F8FD]" aria-hidden="true" />
                    <span className="text-[12.5px] font-bold uppercase tracking-[0.18em] text-[#070D2B]">
                      <span className="mr-1.5 text-accent">0{i + 1}</span>
                      {p}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

type Copy = ReturnType<typeof getCopy>

/* 01 · Compreender — a situação, num relance */
function Understand({ t }: { t: Copy }) {
  return (
    <div className="mt-6 flex flex-1 flex-col">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {t.understand.kpis.map(([v, l], i) => (
          <motion.div key={l} className={cn('rounded-2xl p-5', i === 0 ? 'bg-[#EEF3FF] ring-1 ring-accent/20' : 'bg-[#F5F8FD] ring-1 ring-[#0B1030]/[0.06]')} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE, delay: 0.06 * i }}>
            <p className="text-[13px] font-semibold text-[#0B1030]/65">{l}</p>
            <p className="mt-1 font-display text-[36px] font-bold leading-none tracking-[-0.03em] text-[#070D2B] tabular-nums sm:text-[44px]">{v}</p>
          </motion.div>
        ))}
      </div>
      <p className="mt-6 text-[16px] leading-[1.6] text-[#0B1030]/80">{t.understand.text}</p>
      <p className="mt-1.5 text-[13.5px] text-[#0B1030]/55">{t.understand.meta}</p>
    </div>
  )
}

/* 02 · Antecipar — da apresentação à interpretação, com evidências */
function Anticipate({ t, lang }: { t: Copy; lang: Lang }) {
  const a = t.anticipate
  return (
    <div className="mt-4 flex flex-1 flex-col">
      <p className="text-[15.5px] leading-[1.6] text-[#0B1030]/85">{a.text}</p>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="rounded-2xl bg-[#F5F8FD] p-4 ring-1 ring-[#0B1030]/[0.06]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B1030]/60">{a.byClient}</p>
          {a.rows.map((r, i) => (
            <div key={r.label} className="mt-3">
              <p className="flex items-baseline justify-between gap-3 text-[14px]">
                <span className="font-semibold text-[#070D2B]">{r.label}</span>
                <span className="font-bold tabular-nums">{eur(r.value, lang)}</span>
              </p>
              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[#0B1030]/[0.07]">
                <motion.span className={cn('block h-full origin-left rounded-full', i === 0 ? 'bg-accent' : 'bg-[#9DB7FF]')} style={{ width: `${(r.value / TOTAL_OVERDUE) * 100}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.06 }} />
              </span>
              <p className="mt-1 text-[12.5px] text-[#0B1030]/55">{r.meta}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl bg-[#EEF3FF] p-4 ring-1 ring-accent/20">
            <p className="font-display text-[30px] font-bold leading-none tracking-[-0.02em] text-accent tabular-nums">{a.share}</p>
            <p className="mt-1.5 text-[13.5px] leading-snug text-[#0B1030]/80">{a.shareText}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-[#0B1030]/[0.08]">
            <p className="text-[12.5px] text-[#0B1030]/65">{a.commitments}</p>
            <p className="mt-1 text-[20px] font-bold tabular-nums text-[#070D2B]">{eur(COMMITMENTS_TOTAL, lang)}</p>
            <p className="hidden text-[12px] text-[#0B1030]/55 sm:block">{a.commitmentsNote}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* 03 · Decidir — recomendação explicável, no estilo do Finer Advisor */
function Decide({ t, lang }: { t: Copy; lang: Lang }) {
  const d = t.decide
  return (
    <div className="mt-4 flex flex-1 flex-col">
      <div className="rounded-2xl border border-accent/30 bg-white px-5 py-4 shadow-[0_14px_36px_-26px_rgba(0,82,255,0.7)]">
        <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
          <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
          {d.badge}
        </p>
        <p className="mt-2 font-display text-[19px] font-bold leading-snug text-[#070D2B] sm:text-[21px]">{d.title}</p>
        <p className="mt-1.5 text-[14.5px] leading-[1.55] text-[#0B1030]/75">{d.text}</p>
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B1030]/60">{d.order}</p>
      <ol className="mt-2 divide-y divide-[#0B1030]/[0.07]">
        {d.list.map((r, i) => (
          <motion.li key={r.label} className="flex items-center gap-3 py-2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE, delay: 0.08 + i * 0.06 }}>
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', i === 0 ? 'bg-accent text-white' : 'bg-[#EEF3FF] text-accent')}>{r.n}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold text-[#070D2B]">{r.label}</span>
              <span className="block text-[12.5px] text-[#0B1030]/55">{r.detail}</span>
            </span>
            <span className="text-[15px] font-bold tabular-nums text-[#070D2B]">{eur(r.value, lang)}</span>
          </motion.li>
        ))}
      </ol>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
        <p className="max-w-[420px] text-[12px] leading-snug text-[#0B1030]/55">{d.source}</p>
      </div>
    </div>
  )
}
