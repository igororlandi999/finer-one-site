import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowUp, Sparkles } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { getUiData } from '@/components/v2/finer-ui/data'
import type { AdvisorAction } from '@/components/v2/finer-ui/data'
import { FINAL_BALANCE, FINANCING_MONTH, cashActivity, cashForecast, eurCents, monthCompare } from '@/components/v2/showcase/showcaseData'

const EASE = [0.22, 1, 0.36, 1] as const

type Tab = 'home' | 'cashflow' | 'advisor'
const TABS: Tab[] = ['home', 'cashflow', 'advisor']

const copy: Record<Lang, {
  eyebrow: string; title: [string, string]; sub: string; nav: string; fictitious: string
  tabs: Record<Tab, { name: string; message: string; desc: string; note?: string }>
}> = {
  pt: {
    eyebrow: 'Descubra a Finer One',
    title: ['Experimente o que faz ', 'a diferença.'],
    sub: 'Faça perguntas, explore o cashflow e simule decisões. Tudo numa experiência simples.',
    nav: 'Funcionalidades em demonstração',
    fictitious: 'Dados fictícios',
    tabs: {
      home: { name: 'Finer Home', message: 'Pergunte. A Finer responde.', desc: 'Escolha uma pergunta e veja a resposta, com os números do seu negócio.' },
      cashflow: { name: 'Cashflow', message: 'O seu dinheiro, hoje e amanhã.', desc: 'Compare meses, veja entradas e saídas por atividade e pergunte como a tesouraria pode evoluir.', note: 'A previsão faz parte do plano Pro (brevemente).' },
      advisor: { name: 'Finer Advisor', message: 'Da análise à ação.', desc: 'Escolha uma recomendação, veja o impacto e simule a decisão antes de a tomar.' },
    },
  },
  en: {
    eyebrow: 'Discover Finer One',
    title: ['Try what makes ', 'the difference.'],
    sub: 'Ask questions, explore cash flow and simulate decisions. All in one simple experience.',
    nav: 'Features in demo',
    fictitious: 'Fictitious data',
    tabs: {
      home: { name: 'Finer Home', message: 'Ask. Finer answers.', desc: 'Pick a question and see the answer, with your business numbers.' },
      cashflow: { name: 'Cash flow', message: 'Your money, today and tomorrow.', desc: 'Compare months, see cash in and out by activity and ask how cash may evolve.', note: 'Forecasting is part of the Pro plan (coming soon).' },
      advisor: { name: 'Finer Advisor', message: 'From analysis to action.', desc: 'Pick a recommendation, see its impact and simulate the decision before you make it.' },
    },
  },
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }

/**
 * Secção 5 — "Experimente o que faz a diferença." Três funcionalidades numa
 * única janela compacta, exploradas ao ritmo do visitante (sem reprodução
 * automática nem scroll-jacking). Versão anterior em ?plataforma=v1.
 */
export function PlatformShowcase() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const [tab, setTab] = useState<Tab>('home')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = (i + d + TABS.length) % TABS.length
    setTab(TABS[next])
    tabRefs.current[next]?.focus()
  }

  return (
    <MotionConfig reducedMotion="user">
      <section id="plataforma" aria-labelledby="plataforma-titulo" className="relative isolate scroll-mt-24 overflow-hidden bg-navy py-20 text-white lg:py-24">
        {/* Iluminação azul muito subtil */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_70%_55%,rgba(0,82,255,0.16),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(40%_35%_at_15%_10%,rgba(30,144,255,0.08),transparent_70%)]" />
        </div>

        <motion.div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="mx-auto max-w-[820px] text-center">
            <motion.p variants={item} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-glow">{t.eyebrow}</motion.p>
            <motion.h2 variants={item} id="plataforma-titulo" className="mt-3 text-balance font-display text-[32px] font-bold leading-[1.06] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]">
              {t.title[0]}
              <span className="text-glow">{t.title[1]}</span>
            </motion.h2>
            <motion.p variants={item} className="mx-auto mt-4 max-w-[560px] text-[16.5px] leading-[1.6] text-white/70 sm:text-[18px]">{t.sub}</motion.p>
          </div>

          {/* Três separadores com indicador azul partilhado */}
          <motion.div variants={item} className="mt-9 flex justify-center">
            <div role="tablist" aria-label={t.nav} className="grid w-full max-w-[520px] grid-cols-3 gap-1 rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10">
              {TABS.map((k, i) => {
                const active = tab === k
                return (
                  <motion.button
                    key={k}
                    ref={(el) => { tabRefs.current[i] = el }}
                    type="button"
                    role="tab"
                    id={`plat-tab-${k}`}
                    aria-selected={active}
                    aria-controls="plat-panel"
                    tabIndex={active ? 0 : -1}
                    onClick={() => setTab(k)}
                    onKeyDown={(e) => onKey(e, i)}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'relative rounded-full px-2 py-2.5 text-[13.5px] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow sm:text-[14.5px]',
                      active ? 'text-white' : 'text-white/60 hover:text-white/90',
                    )}
                  >
                    {active && <motion.span layoutId="plat-tab" transition={{ duration: 0.3, ease: EASE }} className="absolute inset-0 rounded-full bg-accent shadow-[0_6px_24px_-6px_rgba(0,82,255,0.9)]" />}
                    <span className="relative">{t.tabs[k].name}</span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Mensagem + janela de demonstração */}
          <motion.div variants={item} className="mt-10 grid grid-cols-[minmax(0,1fr)] items-center gap-8 lg:mt-12 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
            <div className="min-h-[132px] lg:min-h-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }} exit={{ opacity: 0, y: -4, transition: { duration: 0.18 } }}>
                  <p className="font-display text-[13px] font-bold tracking-[0.2em] text-glow">0{TABS.indexOf(tab) + 1}</p>
                  <p className="mt-2 font-display text-[26px] font-bold leading-[1.12] tracking-[-0.025em] sm:text-[30px]">{t.tabs[tab].message}</p>
                  <p className="mt-3 text-[15.5px] leading-[1.6] text-white/70">{t.tabs[tab].desc}</p>
                  {t.tabs[tab].note && <p className="mt-3 text-[13px] text-white/55">{t.tabs[tab].note}</p>}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative min-w-0">
              {/* Linha Finer One: detalhe luminoso no topo da janela, desenhado uma vez */}
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-10 -top-px z-10 h-px origin-left bg-gradient-to-r from-transparent via-glow to-transparent shadow-[0_0_12px_rgba(30,144,255,0.9)]"
                variants={{ hidden: { scaleX: 0, opacity: 0 }, show: { scaleX: 1, opacity: 1, transition: { duration: 0.8, ease: EASE, delay: 0.3 } } }}
              />
              <div className="overflow-hidden rounded-[18px] bg-white text-[#0B1030] shadow-[0_40px_100px_-40px_rgba(0,82,255,0.45),0_0_0_1px_rgba(255,255,255,0.08)]">
                <div className="flex items-center justify-between gap-3 border-b border-[#0B1030]/[0.08] px-4 py-3 sm:px-5">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[#070D2B]">
                      <svg viewBox="0 0 326 445" className="h-3 w-3 fill-white" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
                    </span>
                    <span className="text-[13.5px] font-bold">Finer One</span>
                    <span className="hidden truncate text-[13px] text-[#0B1030]/50 sm:inline">· {t.tabs[tab].name}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#EEF3FF] px-2.5 py-1 text-[12px] font-semibold text-accent">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                    {t.fictitious}
                  </span>
                </div>
                <div id="plat-panel" role="tabpanel" aria-labelledby={`plat-tab-${tab}`} className="relative flex flex-col bg-[#F7F9FE] lg:min-h-[600px]" data-plat-stage>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={tab}
                      className="flex min-w-0 flex-1 flex-col p-4 sm:p-6"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }}
                      exit={{ opacity: 0, y: -4, transition: { duration: 0.18 } }}
                    >
                      {tab === 'home' && <HomeDemo lang={lang} />}
                      {tab === 'cashflow' && <CashflowDemo lang={lang} />}
                      {tab === 'advisor' && <AdvisorDemo lang={lang} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

/* ---------------- Peças comuns ---------------- */

const card = 'rounded-2xl border border-[#0B1030]/[0.07] bg-white shadow-[0_10px_30px_-22px_rgba(11,16,48,0.35)]'
const label = 'text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#0B1030]/65'
const muted = 'text-[#0B1030]/65'

/** Valor em euros que transita de forma discreta quando muda (só por interação). */
function AnimatedEur({ cents, lang, className }: { cents: number; lang: Lang; className?: string }) {
  const reduced = useReducedMotion() ?? false
  const mv = useMotionValue(cents)
  const text = useTransform(mv, (v) => eurCents(v, lang))
  useEffect(() => {
    if (reduced) {
      mv.set(cents)
      return
    }
    const controls = animate(mv, cents, { duration: 0.45, ease: EASE })
    return () => controls.stop()
  }, [cents, reduced, mv])
  return <motion.span className={cn('tabular-nums', className)}>{text}</motion.span>
}

function Segmented<T extends string | number>({ items, value, onChange, id, ariaLabel }: { items: [T, ReactNode][]; value: T; onChange: (v: T) => void; id: string; ariaLabel: string }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex rounded-full border border-[#0B1030]/10 bg-white p-1">
      {items.map(([v, l]) => (
        <motion.button
          key={String(v)}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          whileTap={{ scale: 0.97 }}
          className={cn('relative rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent', value === v ? 'text-white' : 'text-[#0B1030]/75 hover:text-[#0B1030]')}
        >
          {value === v && <motion.span layoutId={id} transition={{ duration: 0.28, ease: EASE }} className="absolute inset-0 rounded-full bg-accent" />}
          <span className="relative inline-flex items-center gap-1.5">{l}</span>
        </motion.button>
      ))}
    </div>
  )
}

/** Resposta da Finer: entrada fluida, com os números em destaque. */
function Answer({ text, figures, tag }: { text: string; figures: [string, string][]; tag?: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#070D2B] text-white">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-accent">Finer One{tag && <span className="rounded bg-[#EEF3FF] px-1.5 py-0.5 text-[11px] font-semibold text-[#0B1030]/70">{tag}</span>}</p>
        <motion.p className="mt-1 text-[14.5px] leading-[1.6] text-[#0B1030]" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
          {text}
        </motion.p>
        {figures.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {figures.map(([k, v], i) => (
              <motion.span key={k} className="inline-flex items-baseline gap-2 rounded-lg border border-accent/20 bg-[#EEF3FF] px-3 py-1.5" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE, delay: 0.25 + i * 0.08 }}>
                <span className="text-[12px] text-[#0B1030]/65">{k}</span>
                <span className="text-[14px] font-bold tabular-nums">{v}</span>
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Thinking({ lang }: { lang: Lang }) {
  return (
    <div className="flex items-center gap-3" role="status">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#070D2B] text-white">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="flex gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-accent" initial={{ opacity: 0.25 }} animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 0.7, delay: i * 0.12 }} />
        ))}
      </span>
      <span className="sr-only">{lang === 'pt' ? 'A analisar…' : 'Analysing…'}</span>
    </div>
  )
}

/** Pergunta → "a analisar" (curto) → resposta. Um único temporizador, limpo ao mudar. */
function useAsk() {
  const reduced = useReducedMotion() ?? false
  const [asked, setAsked] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const ask = (i: number) => {
    window.clearTimeout(timer.current)
    setAsked(i)
    if (reduced) {
      setReady(true)
      return
    }
    setReady(false)
    timer.current = window.setTimeout(() => setReady(true), 700)
  }
  return { asked, ready, ask }
}

/* ---------------- 01 · Finer Home ---------------- */

function HomeDemo({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const e = (c: number) => eurCents(c, lang)
  const qs: { q: string; a: string; f: [string, string][] }[] = pt
    ? [
        { q: 'O que merece mais atenção este mês?', a: 'Os pagamentos a fornecedores desta semana. Vencem 2 faturas, no total de € 4.980,00, de € 21.430,00 por pagar. O saldo atual cobre-as e o mês está positivo, com um resultado de € 17.720,00.', f: [['A pagar esta semana', e(498000)], ['Saldo atual', e(FINAL_BALANCE)], ['Resultado do mês', e(1772000)]] },
        { q: 'Como está a minha empresa este mês?', a: 'Novembro está a correr bem. Entraram € 61.870,00 e saíram € 44.150,00. As entradas subiram € 4.637,20 face a outubro e as saídas desceram € 4.589,10.', f: [['Entradas', e(6187000)], ['Saídas', e(4415000)]] },
        { q: 'Quanto tenho disponível hoje?', a: 'O saldo atual é de € 48.320,15. Depois dos pagamentos desta semana, ficam cerca de € 43.340,15.', f: [['Saldo atual', e(FINAL_BALANCE)], ['Após esta semana', e(FINAL_BALANCE - 498000)]] },
      ]
    : [
        { q: 'What needs the most attention this month?', a: 'This week’s supplier payments. Two invoices are due, totalling €4,980.00, out of €21,430.00 payable. The current balance covers them and the month is positive, with a result of €17,720.00.', f: [['Due this week', e(498000)], ['Current balance', e(FINAL_BALANCE)], ['Month result', e(1772000)]] },
        { q: 'How is my company doing this month?', a: 'November is going well. €61,870.00 came in and €44,150.00 went out. Cash in rose by €4,637.20 on October and cash out fell by €4,589.10.', f: [['Cash in', e(6187000)], ['Cash out', e(4415000)]] },
        { q: 'How much do I have available today?', a: 'The current balance is €48,320.15. After this week’s payments, about €43,340.15 remains.', f: [['Current balance', e(FINAL_BALANCE)], ['After this week', e(FINAL_BALANCE - 498000)]] },
      ]
  const { asked, ready, ask } = useAsk()
  const brief: [string, number][] = [[pt ? 'Saldo atual' : 'Current balance', FINAL_BALANCE], [pt ? 'Entradas' : 'Cash in', 6187000], [pt ? 'Saídas' : 'Cash out', 4415000]]

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-[22px] font-bold tracking-[-0.02em]">Finer Home<span className="text-accent">.</span></p>
        <p className={cn('text-[12.5px]', muted)}>{pt ? 'Novembro de 2026' : 'November 2026'}</p>
      </div>

      {/* Conversa (começa com o Finer Brief, nunca vazia) */}
      <div className={cn(card, 'mt-4 min-h-[262px] flex-1 p-4 sm:p-5')} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {asked === null ? (
            <motion.div key="brief" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
              <p className={cn(label, 'inline-flex items-center gap-2')}><span className="h-px w-5 bg-accent" aria-hidden="true" />Finer Brief</p>
              <p className="mt-3 font-display text-[20px] font-bold leading-tight sm:text-[22px]">
                {pt ? 'Novembro está a correr bem.' : 'November is going well.'}
                <span className="block text-accent">{pt ? 'Há pagamentos a planear.' : 'Some payments need planning.'}</span>
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-[#0B1030]/75">{pt ? 'As entradas do mês somam € 61.870,00 e o resultado é positivo. Tem 9 faturas de fornecedores por pagar (€ 21.430,00); duas vencem esta semana.' : 'Cash in this month totals €61,870.00 and the result is positive. You have 9 supplier invoices due (€21,430.00); two are due this week.'}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#0B1030]/[0.08] pt-4">
                {brief.map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <p className={cn('text-[12px]', muted)}>{k}</p>
                    <p className="mt-0.5 text-[14px] font-bold tabular-nums sm:text-[17px]">{e(v)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key={`q-${asked}`} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
              <motion.p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[#070D2B] px-4 py-2.5 text-[14px] text-white" initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: EASE }}>
                {qs[asked].q}
              </motion.p>
              {ready ? <Answer text={qs[asked].a} figures={qs[asked].f} /> : <Thinking lang={lang} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Perguntas sugeridas + campo Ask Finer */}
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={pt ? 'Perguntas sugeridas' : 'Suggested questions'}>
        {qs.map((x, i) => (
          <motion.button
            key={x.q}
            type="button"
            aria-pressed={asked === i}
            onClick={() => ask(i)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'rounded-full border px-3.5 py-2 text-left text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              asked === i ? 'border-accent bg-accent text-white' : i === 0 && asked === null ? 'border-accent/60 bg-white text-[#0B1030] shadow-[0_0_0_4px_rgba(0,82,255,0.08)]' : 'border-[#0B1030]/15 bg-white text-[#0B1030]/85 hover:border-accent/50',
            )}
          >
            {x.q}
          </motion.button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-full border border-[#0B1030]/12 bg-white py-1.5 pl-5 pr-1.5">
        <span className={cn('min-w-0 flex-1 truncate text-[14px]', asked === null ? 'text-[#0B1030]/50' : 'text-[#0B1030]')}>{asked === null ? 'Ask Finer…' : qs[asked].q}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white" aria-hidden="true">
          <ArrowUp className="h-4 w-4" />
        </span>
      </div>
    </div>
  )
}

/* ---------------- 02 · Cashflow ---------------- */

function CashflowDemo({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const e = (c: number) => eurCents(c, lang)
  const [mode, setMode] = useState<'hist' | 'prev'>('hist')
  const [months, setMonths] = useState<3 | 6>(6)
  const { asked, ready, ask } = useAsk()
  const hist = cashActivity(months)
  const prev = cashForecast(months)
  const cmp = monthCompare()
  const f6 = cashForecast(6)
  const max = 7000000
  const bars = mode === 'hist' ? hist.list : prev.list
  const act = mode === 'hist' ? hist : prev
  const last = prev.list[prev.list.length - 1]
  const lastLabel = `${pt ? last.pt : last.en} 2027`

  const kpis: [string, number, ReactNode][] = mode === 'hist'
    ? [
        [pt ? 'Entradas · nov.' : 'Cash in · Nov', cmp.cur.inC, <span className="text-emerald-700">+{' '}{e(cmp.inDelta)} {pt ? 'vs. out.' : 'vs Oct'}</span>],
        [pt ? 'Saídas · nov.' : 'Cash out · Nov', cmp.cur.outC, <span className="text-emerald-700">{e(cmp.outDelta)} {pt ? 'vs. out.' : 'vs Oct'}</span>],
        [pt ? 'Saldo hoje' : 'Balance today', FINAL_BALANCE, <span className={muted}>{pt ? 'Início do período: ' : 'Period start: '}{e(hist.start)}</span>],
      ]
    : [
        [pt ? 'Entradas previstas / mês' : 'Expected in / month', prev.avgIn, <span className={muted}>{pt ? 'Média dos últimos 6 meses' : 'Last 6 months average'}</span>],
        [pt ? 'Saídas previstas / mês' : 'Expected out / month', prev.avgOut, <span className={muted}>{pt ? 'Média dos últimos 6 meses' : 'Last 6 months average'}</span>],
        [pt ? `Saldo previsto · ${lastLabel}` : `Expected balance · ${lastLabel}`, prev.end, <span className={muted}>{pt ? 'Hoje: ' : 'Today: '}{e(FINAL_BALANCE)}</span>],
      ]

  const analysis = pt
    ? `Pela média dos últimos 6 meses, entram ${e(f6.avgIn)} e saem ${e(f6.avgOut)} por mês, mais ${e(-FINANCING_MONTH)} de financiamento. O saldo poderá chegar a cerca de ${e(f6.end)} em maio de 2027, mas a margem é curta (${e(f6.perMonth)} por mês): um mês como agosto pode anulá-la.`
    : `On the last 6 months’ average, ${e(f6.avgIn)} comes in and ${e(f6.avgOut)} goes out each month, plus ${e(-FINANCING_MONTH)} of financing. The balance may reach about ${e(f6.end)} by May 2027, but the margin is thin (${e(f6.perMonth)} a month): a month like August could wipe it out.`

  const question = pt ? 'Como poderá evoluir a minha tesouraria nos próximos 6 meses?' : 'How could my cash evolve over the next 6 months?'

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-[22px] font-bold tracking-[-0.02em]">Cashflow<span className="text-accent">.</span></p>
        <div className="flex flex-wrap gap-2">
          <Segmented
            id="cf-mode"
            ariaLabel={pt ? 'Histórico ou previsto' : 'History or forecast'}
            value={mode}
            onChange={setMode}
            items={[['hist', pt ? 'Histórico' : 'History'], ['prev', <>{pt ? 'Previsto' : 'Forecast'}<span className={cn('rounded px-1 text-[10px] font-bold', mode === 'prev' ? 'bg-white/20 text-white' : 'bg-[#EEF3FF] text-accent')}>PRO</span></>]]}
          />
          <Segmented id="cf-months" ariaLabel={pt ? 'Horizonte' : 'Horizon'} value={months} onChange={setMonths} items={[[3, pt ? '3 meses' : '3 months'], [6, pt ? '6 meses' : '6 months']]} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {kpis.map(([k, v, note]) => (
          <div key={k} className={cn(card, 'p-4')}>
            <p className={label}>{k}</p>
            <AnimatedEur cents={v} lang={lang} className="mt-1.5 block font-display text-[20px] font-bold tracking-[-0.01em]" />
            <p className="mt-0.5 text-[12px]">{note}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Gráfico: entradas e saídas por mês (previsto mais claro e tracejado) */}
        <div className={cn(card, 'p-4')}>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="font-semibold">{mode === 'hist' ? (pt ? 'Histórico · entradas e saídas liquidadas' : 'History · settled in and out') : pt ? 'Previsto · estimativa mensal' : 'Forecast · monthly estimate'}</span>
            <span className={cn('inline-flex gap-3', muted)}>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent" />{pt ? 'Entradas' : 'In'}</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#9DB7FF]" />{pt ? 'Saídas' : 'Out'}</span>
            </span>
          </div>
          <div className="relative mt-3 h-[124px]">
            {[0, 50, 100].map((p) => <span key={p} className="absolute inset-x-0 border-t border-dashed border-[#0B1030]/[0.08]" style={{ bottom: `${p}%` }} />)}
            <div className="absolute inset-0 flex items-end justify-around gap-1">
              <AnimatePresence initial={false} mode="popLayout">
                {bars.map((m) => (
                  <motion.div key={`${mode}-${m.pt}`} layout className="flex h-full min-w-0 flex-1 items-end justify-center gap-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                    {([[m.inC, 'bg-accent'], [m.outC, 'bg-[#9DB7FF]']] as const).map(([v, c], j) => (
                      <motion.span key={j} className={cn('w-[30%] max-w-[18px] origin-bottom rounded-t-[3px]', c, mode === 'prev' && 'opacity-40 outline-dashed outline-1 outline-offset-1 outline-accent/60')} style={{ height: `${(v / max) * 100}%` }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5, ease: EASE, delay: j * 0.05 }} />
                    ))}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-1.5 flex justify-around text-[11px]">
            {bars.map((m) => <span key={m.pt} className={cn('flex-1 text-center', muted)}>{pt ? m.pt : m.en}</span>)}
          </div>
        </div>

        {/* Resumo por atividade */}
        <div className={cn(card, 'p-4 text-[13px]')}>
          <p className="text-[12px] font-semibold">{mode === 'hist' ? (pt ? `Últimos ${months} meses` : `Last ${months} months`) : pt ? `Próximos ${months} meses (estimativa)` : `Next ${months} months (estimate)`}</p>
          {([[pt ? 'Operacional' : 'Operating', act.op], [pt ? 'Investimento' : 'Investing', act.inv], [pt ? 'Financiamento' : 'Financing', act.fin]] as [string, number][]).map(([k, v]) => (
            <p key={k} className="mt-2 flex justify-between gap-3">
              <span className={muted}>{k}</span>
              <AnimatedEur cents={v} lang={lang} className={cn('font-semibold', v < 0 ? 'text-red-700' : v > 0 ? 'text-emerald-700' : '')} />
            </p>
          ))}
          <p className="mt-3 flex justify-between gap-3 rounded-lg bg-[#EEF3FF] px-3 py-2 font-bold">
            <span>{pt ? 'Cashflow líquido' : 'Net cash flow'}</span>
            <AnimatedEur cents={act.net} lang={lang} />
          </p>
        </div>
      </div>

      {/* Pergunta sugerida → análise (o elemento diferenciador) */}
      <div className="mt-3" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {asked === null ? (
            <motion.button
              key="q"
              type="button"
              onClick={() => { setMode('prev'); setMonths(6); ask(0) }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="flex w-full items-center gap-3 rounded-xl border border-accent/50 bg-white px-4 py-3 text-left text-[14px] font-medium shadow-[0_0_0_4px_rgba(0,82,255,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span className="flex-1">{question}</span>
              <ArrowUp className="h-4 w-4 shrink-0 rotate-90 text-accent" aria-hidden="true" />
            </motion.button>
          ) : (
            <motion.div key="a" className={cn(card, 'p-4')} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
              {ready ? <Answer text={analysis} figures={[]} tag={pt ? 'Previsão ilustrativa · plano Pro (brevemente)' : 'Illustrative forecast · Pro plan (coming soon)'} /> : <Thinking lang={lang} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------------- 03 · Finer Advisor ---------------- */

const toCents = (s: string) => Number(s.replace(/[^\d]/g, ''))

function AdvisorDemo({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const all = getUiData(lang).advisor
  // Sem a recomendação de cobranças: já é o tema da secção 2.
  const actions = all.actions.filter((a) => a.id === 'payables' || a.id === 'costs')
  const [id, setId] = useState(actions[0].id)
  const action = actions.find((a) => a.id === id) ?? actions[0]
  return (
    <div>
      <p className="font-display text-[22px] font-bold tracking-[-0.02em]">Finer Advisor<span className="text-accent">.</span></p>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ul className="space-y-3" aria-label={pt ? 'Recomendações' : 'Recommendations'}>
          {actions.map((a) => (
            <li key={a.id}>
              <motion.button
                type="button"
                aria-pressed={a.id === id}
                onClick={() => setId(a.id)}
                whileHover={a.id === id ? undefined : { y: -1 }}
                whileTap={{ scale: 0.99 }}
                className={cn('w-full rounded-2xl border bg-white p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent', a.id === id ? 'border-accent shadow-[0_14px_36px_-22px_rgba(0,82,255,0.8)]' : 'border-[#0B1030]/[0.08] hover:border-[#0B1030]/20')}
              >
                <p className="flex items-center gap-2">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#0B1030]/70">{a.area}</span>
                  <span className={cn('rounded px-1.5 py-0.5 text-[10.5px] font-semibold', a.level === 'high' ? 'bg-amber-50 text-amber-800' : 'bg-[#EEF3FF] text-accent')}>{a.severity}</span>
                </p>
                <p className="mt-1.5 text-[15px] font-bold leading-snug">{a.title}</p>
                <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[17px] font-bold tabular-nums">{a.value}</span>
                  <span className={cn('text-[12px]', muted)}>{a.valueNote}</span>
                </p>
              </motion.button>
            </li>
          ))}
        </ul>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={action.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
            <AdvisorDetail action={action} lang={lang} labels={all} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function AdvisorDetail({ action, lang, labels }: { action: AdvisorAction; lang: Lang; labels: ReturnType<typeof getUiData>['advisor'] }) {
  const [v, setV] = useState(action.simulator.initial)
  const results = action.simulator.results(v)
  return (
    <div className={cn(card, 'p-4 sm:p-5')}>
      <p className={label}>{labels.shows}</p>
      <ul className="mt-2 space-y-1.5 text-[13.5px] leading-snug">
        {action.shows.slice(0, 3).map((s) => (
          <li key={s} className="flex gap-2"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />{s}</li>
        ))}
      </ul>

      {/* Simulador */}
      <div className="mt-4 rounded-xl bg-[#F3F6FD] p-4">
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span><span className="font-semibold">{labels.simulator}</span> · {action.simulator.label}</span>
          <motion.span key={v} className="rounded-md bg-white px-2 py-0.5 font-bold tabular-nums text-accent" initial={{ scale: 0.92 }} animate={{ scale: 1 }} transition={{ duration: 0.15 }}>{action.simulator.format(v)}</motion.span>
        </div>
        <input
          type="range"
          min={action.simulator.min}
          max={action.simulator.max}
          step={action.simulator.step}
          value={v}
          onChange={(ev) => setV(Number(ev.target.value))}
          aria-label={action.simulator.label}
          aria-valuetext={action.simulator.format(v)}
          className="mt-3 w-full cursor-pointer accent-[#0052FF]"
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {results.map(([k, val]) => (
            <div key={k} className="rounded-lg bg-white px-3 py-2">
              <p className={cn('text-[11.5px]', muted)}>{k}</p>
              <AnimatedEur cents={toCents(val)} lang={lang} className="text-[16px] font-bold" />
            </div>
          ))}
        </div>
      </div>

      <p className={cn(label, 'mt-4')}>{labels.recs}</p>
      <ul className="mt-2 space-y-1.5 text-[13.5px] leading-snug">
        {action.recs.slice(0, 2).map(([r]) => (
          <li key={r} className="flex gap-2"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />{r}</li>
        ))}
      </ul>
    </div>
  )
}
