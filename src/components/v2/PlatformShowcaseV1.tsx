import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { Variants } from 'motion/react'
import { CalendarDays, FileText } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { AppShell, ViewTitle } from '@/components/v2/finer-ui/AppShell'
import type { View } from '@/components/v2/finer-ui/AppShell'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { FinerAdvisorView } from '@/components/v2/finer-ui/FinerAdvisorView'
import { CASH_MONTHS, cashPeriod, eurCents, getPartners, getShowcaseHome } from '@/components/v2/showcase/showcaseData'

const EASE = [0.22, 1, 0.36, 1] as const

type Tab = 'home' | 'cashflow' | 'clientes' | 'advisor'
const TABS: Tab[] = ['home', 'cashflow', 'clientes', 'advisor']

const copy: Record<Lang, {
  eyebrow: string; title: [string, string]; sub: string; note: string; nav: string
  tabs: Record<Tab, { name: string; title: string; desc: string }>
}> = {
  pt: {
    eyebrow: 'Explore a plataforma',
    title: ['Uma plataforma. ', 'Tudo o que importa.'],
    sub: 'Acompanhe o seu negócio, explore os números e saiba onde concentrar a atenção.',
    note: 'Demonstração com dados fictícios',
    nav: 'Áreas da plataforma',
    tabs: {
      home: { name: 'Finer Home', title: 'Comece pelo que importa.', desc: 'Consulte o Finer Brief, acompanhe os principais indicadores e faça perguntas sobre o seu negócio.' },
      cashflow: { name: 'Cashflow', title: 'Saiba como o dinheiro se movimenta.', desc: 'Acompanhe saldos, receitas e despesas e explore a evolução da tesouraria.' },
      clientes: { name: 'Clientes e Fornecedores', title: 'Tudo o que tem a receber e a pagar.', desc: 'Consulte valores e documentos associados aos seus clientes e fornecedores.' },
      advisor: { name: 'Finer Advisor', title: 'Não deixe o importante passar despercebido.', desc: 'Explore análises, alertas e recomendações para acompanhar situações que exigem atenção.' },
    },
  },
  en: {
    eyebrow: 'Explore the platform',
    title: ['One platform. ', 'Everything that matters.'],
    sub: 'Follow your business, explore the numbers and know where to focus.',
    note: 'Demo with fictitious data',
    nav: 'Platform areas',
    tabs: {
      home: { name: 'Finer Home', title: 'Start with what matters.', desc: 'Read the Finer Brief, follow the key indicators and ask questions about your business.' },
      cashflow: { name: 'Cash flow', title: 'See how money moves.', desc: 'Follow balances, cash in and cash out, and explore how your cash evolves.' },
      clientes: { name: 'Customers & Suppliers', title: 'Everything to collect and to pay.', desc: 'See amounts and documents linked to your customers and suppliers.' },
      advisor: { name: 'Finer Advisor', title: 'Don’t let what matters slip by.', desc: 'Explore analyses, alerts and recommendations for situations that need attention.' },
    },
  },
}

/* Entrada coordenada: título → subtítulo → separadores → demonstração (uma vez). */
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }

/**
 * Secção 5 — montra interativa da plataforma. Navegação só por escolha do
 * visitante (sem reprodução automática nem scroll-jacking); a seleção mantém-se
 * ao sair e voltar à secção. Reutiliza a moldura e as vistas de `finer-ui`.
 */
export function PlatformShowcaseV1() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = useReducedMotion() ?? false
  const [tab, setTab] = useState<Tab>('home')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Revelação da interface ligada ao scroll: termina quando o topo da demonstração
  // chega a ~65% da altura do ecrã (fica totalmente visível na zona de leitura).
  const frameRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ['start end', 'start 0.65'] })
  const clipPath = useTransform(scrollYProgress, [0, 1], ['inset(7% 5% 0% 5% round 20px)', 'inset(0% 0% 0% 0% round 20px)'])

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
      <section id="plataforma" aria-labelledby="plataforma-titulo" className="relative scroll-mt-24 bg-[#F8FAFF] py-16 text-navy lg:py-24">
        <motion.div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          {/* Cabeçalho */}
          <div className="mx-auto max-w-[860px] text-center">
            <motion.p variants={item} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent">{t.eyebrow}</motion.p>
            <motion.h2 variants={item} id="plataforma-titulo" className="mt-3 text-balance font-display text-[32px] font-bold leading-[1.06] tracking-[-0.035em] text-[#070D2B] sm:text-[44px] lg:text-[52px]">
              {t.title[0]}
              <span className="text-accent">{t.title[1]}</span>
            </motion.h2>
            <motion.p variants={item} className="mx-auto mt-4 max-w-[560px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</motion.p>
          </div>

          {/* Separadores com a linha Finer One */}
          <motion.div variants={item} className="relative mt-10 lg:mt-12">
            <div role="tablist" aria-label={t.nav} className="grid grid-cols-2 gap-x-2 gap-y-1 sm:flex sm:justify-center sm:gap-2">
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
                    whileHover={active ? undefined : { y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'relative rounded-lg px-3 pb-3.5 pt-2.5 text-[14.5px] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-5 sm:text-[15px]',
                      active ? 'text-[#070D2B]' : 'text-[#0B1030]/55 hover:text-[#0B1030]/85',
                    )}
                  >
                    {t.tabs[k].name}
                    {active && (
                      <motion.span
                        layoutId="plat-tab-line"
                        transition={{ duration: 0.3, ease: EASE }}
                        aria-hidden="true"
                        className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-accent shadow-[0_0_10px_rgba(0,82,255,0.55)] sm:inset-x-5"
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
            {/* Linha de base desenhada uma vez na entrada */}
            <motion.span
              aria-hidden="true"
              className="mx-auto hidden h-px max-w-[760px] origin-center bg-gradient-to-r from-transparent via-[#0B1030]/15 to-transparent sm:block"
              variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.6, ease: EASE, delay: 0.1 } } }}
            />
          </motion.div>

          {/* Descrição contextual, associada à interface */}
          <motion.div variants={item} className="mt-8 flex min-h-[84px] flex-col gap-3 sm:min-h-[60px] sm:flex-row sm:items-end sm:justify-between">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }} exit={{ opacity: 0, y: -4, transition: { duration: 0.18 } }}>
                <p className="font-display text-[22px] font-bold tracking-[-0.02em] text-[#070D2B] sm:text-[24px]">{t.tabs[tab].title}</p>
                <p className="mt-1 max-w-[620px] text-[15.5px] leading-[1.55] text-[#0B1030]/70">{t.tabs[tab].desc}</p>
              </motion.div>
            </AnimatePresence>
            <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#0B1030]/65 shadow-[0_0_0_1px_rgba(11,16,48,0.08)] sm:self-end">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              {t.note}
            </span>
          </motion.div>

          {/* Interface da plataforma (moldura estável; só o conteúdo muda) */}
          <motion.div variants={item} className="mt-5">
            <motion.div
              ref={frameRef}
              style={reduced ? undefined : { clipPath }}
              className="overflow-clip rounded-[20px] bg-white shadow-[0_40px_90px_-60px_rgba(11,16,48,0.5),0_0_0_1px_rgba(11,16,48,0.08)]"
            >
              <AppShell view={tab as View} onNavigate={(v) => TABS.includes(v as Tab) && setTab(v as Tab)} navigable={TABS as View[]} className="lg:h-[680px]">
                <div id="plat-panel" role="tabpanel" aria-labelledby={`plat-tab-${tab}`} className="relative lg:h-[680px] lg:overflow-y-auto lg:overscroll-contain">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }}
                      exit={{ opacity: 0, y: -4, transition: { duration: 0.18 } }}
                    >
                      {tab === 'home' && <FinerHomeView data={getShowcaseHome(lang)} onOpenAdvisor={() => setTab('advisor')} />}
                      {tab === 'cashflow' && <CashflowDemo lang={lang} />}
                      {tab === 'clientes' && <PartnersDemo lang={lang} />}
                      {tab === 'advisor' && <FinerAdvisorView actionIds={['payables', 'costs']} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </AppShell>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

/* ---------------- Peças comuns ---------------- */

const card = 'rounded-2xl border border-[#0B1030]/[0.07] bg-white shadow-[0_12px_40px_-24px_rgba(11,16,48,0.35)]'
const label = 'text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#0B1030]/70'
const muted = 'text-[#0B1030]/65'

/** Valor em euros que transita suavemente quando muda (só por interação). */
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

function Segmented<T extends string | number>({ items, value, onChange, id, ariaLabel }: { items: [T, string][]; value: T; onChange: (v: T) => void; id: string; ariaLabel: string }) {
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
          className={cn('relative rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent', value === v ? 'text-white' : 'text-[#0B1030]/75 hover:text-[#0B1030]')}
        >
          {value === v && <motion.span layoutId={id} transition={{ duration: 0.28, ease: EASE }} className="absolute inset-0 rounded-full bg-accent" />}
          <span className="relative">{l}</span>
        </motion.button>
      ))}
    </div>
  )
}

function PageHead({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-start @3xl:justify-between">
      <ViewTitle>{title}</ViewTitle>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  )
}

/* ---------------- Cashflow (período interativo) ---------------- */

function CashflowDemo({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const [months, setMonths] = useState<3 | 6 | 12>(6)
  const [focus, setFocus] = useState<number | null>(null)
  const p = cashPeriod(months)
  const max = 7000000 // € 70 mil
  const shown = focus === null ? p.list[p.list.length - 1] : p.list[focus] ?? p.list[p.list.length - 1]
  const first = p.list[0]
  const kpis: [string, number, string][] = [
    [pt ? 'Saldo inicial' : 'Opening balance', p.start, pt ? `Início de ${first.pt} ${CASH_MONTHS.indexOf(first) === 0 ? 2025 : 2026}` : `Start of ${first.en}`],
    [pt ? 'Entradas liquidadas' : 'Settled cash in', p.inC, pt ? `Últimos ${months} meses` : `Last ${months} months`],
    [pt ? 'Saídas liquidadas' : 'Settled cash out', p.outC, pt ? `Últimos ${months} meses` : `Last ${months} months`],
    [pt ? 'Saldo final' : 'Closing balance', p.end, pt ? 'Disponível hoje' : 'Available today'],
  ]
  return (
    <div className="px-4 pb-6 pt-5 @xl:px-8 @xl:pb-8 @xl:pt-6">
      <PageHead
        title="Cashflow"
        right={
          <>
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-[12.5px] font-medium text-[#0B1030]/75 shadow-[0_0_0_1px_rgba(11,16,48,0.08)]">{pt ? 'Histórico' : 'History'}</span>
            <Segmented
              id="cf-period"
              ariaLabel={pt ? 'Período de análise' : 'Analysis period'}
              value={months}
              onChange={(v) => { setMonths(v); setFocus(null) }}
              items={[[3, pt ? '3 meses' : '3 months'], [6, pt ? '6 meses' : '6 months'], [12, pt ? '12 meses' : '12 months']]}
            />
          </>
        }
      />
      <div className="mt-6 grid grid-cols-2 gap-3 @4xl:grid-cols-4 @4xl:gap-4">
        {kpis.map(([k, v, note]) => (
          <div key={k} className={cn(card, 'p-4 @xl:p-5')}>
            <p className={label}>{k}</p>
            <AnimatedEur cents={v} lang={lang} className="mt-2 block font-display text-[19px] font-bold tracking-[-0.01em] text-[#0B1030] @xl:text-[24px]" />
            <p className={cn('mt-1 text-[12.5px]', muted)}>{note}</p>
          </div>
        ))}
      </div>

      <div className={cn(card, 'mt-4 p-5 @xl:p-6')}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[16px] font-bold">{pt ? 'Evolução do cashflow' : 'Cash flow evolution'}</p>
          <p className={cn('text-[12.5px]', muted)}>{pt ? 'Entradas e saídas liquidadas por mês' : 'Settled cash in and out per month'}</p>
        </div>
        <div className="relative mt-5 h-[190px] @xl:h-[210px]">
          {['60', '40', '20', '0'].map((v) => (
            <div key={v} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${(Number(v) / 70) * 100}%` }}>
              <span className={cn('w-12 shrink-0 text-[11px] tabular-nums', muted)}>{v === '0' ? '€ 0' : pt ? `€ ${v} mil` : `€${v}k`}</span>
              <span className="h-px flex-1 border-t border-dashed border-[#0B1030]/[0.09]" />
            </div>
          ))}
          <div className="absolute inset-y-0 left-14 right-0 flex items-end justify-around gap-1">
            <AnimatePresence initial={false} mode="popLayout">
              {p.list.map((m, i) => {
                const on = focus === i || (focus === null && i === p.list.length - 1)
                return (
                  <motion.button
                    key={m.pt}
                    layout
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    onClick={() => setFocus(i)}
                    onMouseEnter={() => setFocus(i)}
                    onFocus={() => setFocus(i)}
                    aria-label={`${pt ? m.pt : m.en}: ${pt ? 'entradas' : 'in'} ${eurCents(m.inC, lang)}, ${pt ? 'saídas' : 'out'} ${eurCents(m.outC, lang)}`}
                    className={cn('group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent', on && 'bg-[#EEF3FF]/70')}
                  >
                    <span className="flex h-full w-full items-end justify-center gap-[3px] px-[12%] pt-2">
                      <motion.span className="w-1/2 max-w-[22px] origin-bottom rounded-t-[3px] bg-accent" style={{ height: `${(m.inC / max) * 100}%` }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5, ease: EASE }} />
                      <motion.span className="w-1/2 max-w-[22px] origin-bottom rounded-t-[3px] bg-[#9DB7FF]" style={{ height: `${(m.outC / max) * 100}%` }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5, ease: EASE, delay: 0.05 }} />
                    </span>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
        <div className="ml-14 mt-2 flex justify-around gap-1">
          {p.list.map((m, i) => (
            <span key={m.pt} className={cn('min-w-0 flex-1 text-center text-[11px]', (focus === i || (focus === null && i === p.list.length - 1)) ? 'font-semibold text-[#0B1030]' : muted)}>
              {months === 12 && i % 2 === 1 ? <span className="hidden @xl:inline">{pt ? m.pt : m.en}</span> : pt ? m.pt : m.en}
            </span>
          ))}
        </div>
        {/* Detalhe do mês em foco (passar o cursor, tocar ou navegar com o teclado) */}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-accent/15 bg-[#EEF3FF] px-4 py-3 text-[13.5px]" aria-live="polite">
          <span className="font-semibold text-[#0B1030]">{pt ? shown.pt.replace('.', '') : shown.en} {CASH_MONTHS.indexOf(shown) === 0 ? '2025' : '2026'}</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-accent" />{pt ? 'Entradas' : 'Cash in'} <AnimatedEur cents={shown.inC} lang={lang} className="font-semibold" /></span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#9DB7FF]" />{pt ? 'Saídas' : 'Cash out'} <AnimatedEur cents={shown.outC} lang={lang} className="font-semibold" /></span>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Clientes e Fornecedores ---------------- */

function PartnersDemo({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const data = getPartners(lang)
  const [side, setSide] = useState<'clientes' | 'fornecedores'>('clientes')
  const [sel, setSel] = useState(0)
  const s = data[side]
  const doc = s.docs[sel] ?? s.docs[0]
  const isC = side === 'clientes'
  const state = (d: (typeof s.docs)[number]) => (d.late ? (pt ? 'Em atraso' : 'Overdue') : pt ? 'A vencer' : 'Due')
  const days = (d: (typeof s.docs)[number]) => (d.late ? (pt ? `${d.days} dias` : `${d.days} days`) : pt ? `em ${d.days} dias` : `in ${d.days} days`)

  return (
    <div className="px-4 pb-6 pt-5 @xl:px-8 @xl:pb-8 @xl:pt-6">
      <PageHead
        title={pt ? 'Clientes e Fornecedores' : 'Customers & Suppliers'}
        right={
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0B1030]/10 bg-white px-3.5 py-2 text-[12.5px]">
            <span className={muted}>{pt ? 'Posição em:' : 'Position at:'}</span>
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> 10/11/2026
          </span>
        }
      />

      {/* Alternar entre clientes e fornecedores */}
      <div className="mt-6 flex gap-6 border-b border-[#0B1030]/[0.1]" role="radiogroup" aria-label={pt ? 'Ver clientes ou fornecedores' : 'Show customers or suppliers'}>
        {(['clientes', 'fornecedores'] as const).map((k) => (
          <motion.button
            key={k}
            type="button"
            role="radio"
            aria-checked={side === k}
            onClick={() => { setSide(k); setSel(0) }}
            whileTap={{ scale: 0.98 }}
            className={cn('relative pb-3 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent', side === k ? 'text-[#0B1030]' : 'text-[#0B1030]/55 hover:text-[#0B1030]/85')}
          >
            {k === 'clientes' ? (pt ? 'Clientes' : 'Customers') : pt ? 'Fornecedores' : 'Suppliers'}
            {side === k && <motion.span layoutId="cs-side" transition={{ duration: 0.28, ease: EASE }} className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-accent" />}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={side} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }} exit={{ opacity: 0, transition: { duration: 0.16 } }}>
          {/* Resumo por prazo */}
          <div className={cn(card, 'mt-4 p-5')}>
            <p className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[16px] font-bold">{isC ? (pt ? 'A receber' : 'To collect') : pt ? 'A pagar' : 'To pay'}</span>
              <span className="font-display text-[22px] font-bold tabular-nums">{eurCents(s.totalC, lang)}</span>
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 @3xl:grid-cols-4">
              {s.buckets.map((b, i) => {
                const red = i === 0 && b.valueC > 0
                return (
                  <div key={b.label}>
                    <p className={cn('text-[14px] font-bold tabular-nums', red && 'text-red-700')}>{eurCents(b.valueC, lang)}</p>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[#EEF3FF]">
                      <motion.span className={cn('block h-full origin-left rounded-full', red ? 'bg-red-600' : 'bg-accent/60')} style={{ width: `${(b.valueC / s.totalC) * 100}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.05 }} />
                    </span>
                    <p className={cn('mt-1.5 text-[12.5px]', red ? 'text-red-700' : muted)}>{b.label} · {b.docs} {pt ? 'docs' : 'docs'}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-4 @5xl:grid-cols-[minmax(0,1fr)_280px]">
            {/* Documentos em aberto */}
            <div className={cn(card, 'overflow-hidden')}>
              <div className="flex flex-wrap items-center gap-2 px-5 py-3.5 text-[12.5px]">
                <span className="rounded-full border border-accent/40 bg-[#EEF3FF] px-3 py-1 font-semibold">{pt ? 'Em aberto' : 'Open'} {s.open}</span>
                <span className="rounded-full border border-[#0B1030]/10 px-3 py-1">{pt ? 'Vencidos' : 'Overdue'} {s.buckets[0].docs}</span>
                <span className="rounded-full border border-[#0B1030]/10 px-3 py-1">{pt ? 'A vencer' : 'Due'} {s.open - s.buckets[0].docs}</span>
              </div>
              <ul>
                {s.docs.map((d, i) => (
                  <li key={d.doc}>
                    <button
                      type="button"
                      onClick={() => setSel(i)}
                      aria-pressed={sel === i}
                      className={cn(
                        'grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-t border-[#0B1030]/[0.06] px-5 py-3 text-left text-[13.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent @3xl:grid-cols-[minmax(0,1fr)_96px_104px_92px]',
                        sel === i ? 'bg-[#EEF3FF]' : 'hover:bg-[#F7F9FE]',
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{d.who}</span>
                        <span className={cn('block text-[12.5px]', muted)}><span className="text-accent">{d.doc}</span><span className="@3xl:hidden"> · {d.due}</span></span>
                      </span>
                      <span className={cn('hidden @3xl:block', muted)}>{d.due}</span>
                      <span className="text-right font-semibold tabular-nums @3xl:order-none">{eurCents(d.valueC, lang)}</span>
                      <span className="col-span-2 mt-1 @3xl:col-span-1 @3xl:mt-0 @3xl:text-right">
                        <span className={cn('inline-flex items-center gap-1 rounded px-2 py-0.5 text-[12px] font-medium', d.late ? 'bg-red-50 text-red-700' : 'bg-[#EEF3FF] text-accent')}>
                          <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
                          {state(d)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className={cn('border-t border-[#0B1030]/[0.06] px-5 py-3 text-[12.5px]', muted)}>
                {pt ? `A mostrar ${s.docs.length} de ${s.open} documentos em aberto` : `Showing ${s.docs.length} of ${s.open} open documents`}
              </p>
            </div>

            {/* Detalhe do documento selecionado */}
            <div className={cn(card, 'p-5')} aria-live="polite">
              <p className="text-[16px] font-bold">{pt ? 'Documento' : 'Document'}</p>
              <div className={cn('mt-3 flex flex-col items-center rounded-xl border border-dashed border-[#0B1030]/15 bg-[#F7F9FE] p-4 text-center text-[12px]', muted)}>
                <FileText className="h-5 w-5" aria-hidden="true" />
                <span className="mt-1.5">{pt ? 'Pré-visualização do documento' : 'Document preview'}</span>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.dl key={doc.doc} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }} className="mt-3">
                  {([
                    [isC ? (pt ? 'Cliente' : 'Customer') : pt ? 'Fornecedor' : 'Supplier', doc.who],
                    [pt ? 'N.º documento' : 'Document no.', doc.doc],
                    [pt ? 'Vencimento' : 'Due date', doc.due],
                    [pt ? 'Valor' : 'Amount', eurCents(doc.valueC, lang)],
                    [pt ? 'Estado' : 'Status', state(doc)],
                    [doc.late ? (pt ? 'Dias em atraso' : 'Days overdue') : pt ? 'Vence' : 'Due', days(doc)],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k} className="mt-2 flex justify-between gap-3 text-[13px]">
                      <dt className={muted}>{k}</dt>
                      <dd className={cn('text-right font-medium', doc.late && (k.startsWith('Estado') || k.startsWith('Status') || k.startsWith('Dias') || k.startsWith('Days')) && 'text-red-700')}>{v}</dd>
                    </div>
                  ))}
                </motion.dl>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

