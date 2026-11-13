import { useState } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, ChevronRight } from 'lucide-react'
import { Rise } from '@/components/v2/Rise'
import { useInView } from '@/hooks/useInView'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

type Step = { n: string; title: string; lead: string; body: string; points: string[] }

const copy: Record<Lang, { kicker: string; title: [string, string]; example: string; steps: Step[] }> = {
  pt: {
    kicker: 'Da informação à ação',
    title: ['Compreender. Antecipar. ', 'Decidir.'],
    example: 'Dados fictícios',
    steps: [
      {
        n: '01',
        title: 'Compreender',
        lead: 'Toda a informação financeira, num só lugar.',
        body: 'Contas bancárias, faturas, cashflow, receitas, despesas, clientes e fornecedores reunidos numa leitura clara.',
        points: ['Saldos e movimentos', 'Faturas e documentos', 'Clientes e fornecedores'],
      },
      {
        n: '02',
        title: 'Antecipar',
        lead: 'Veja o que vem aí antes de se tornar urgente.',
        body: 'Alertas sobre faturas em atraso e desvios, análise de tendências e simulação de cenários futuros.',
        points: ['Alertas inteligentes', 'Tendências', 'Cenários futuros'],
      },
      {
        n: '03',
        title: 'Decidir',
        lead: 'Saiba onde agir primeiro.',
        body: 'Recomendações práticas e planos de ação passo a passo, ordenados por prioridade e impacto.',
        points: ['Planos de ação', 'Recomendações práticas', 'Acompanhamento'],
      },
    ],
  },
  en: {
    kicker: 'From information to action',
    title: ['Understand. Anticipate. ', 'Decide.'],
    example: 'Fictitious data',
    steps: [
      {
        n: '01',
        title: 'Understand',
        lead: 'All your financial information in one place.',
        body: 'Bank accounts, invoices, cash flow, revenue, expenses, customers and suppliers brought together into one clear view.',
        points: ['Balances and transactions', 'Invoices and documents', 'Customers and suppliers'],
      },
      {
        n: '02',
        title: 'Anticipate',
        lead: 'See what is coming before it becomes urgent.',
        body: 'Alerts on overdue invoices and deviations, trend analysis and simulation of future scenarios.',
        points: ['Smart alerts', 'Trends', 'Future scenarios'],
      },
      {
        n: '03',
        title: 'Decide',
        lead: 'Know where to act first.',
        body: 'Practical recommendations and step-by-step action plans, ranked by priority and impact.',
        points: ['Action plans', 'Practical recommendations', 'Follow-up'],
      },
    ],
  },
}

/** Ecrãs de scroll dedicados a cada etapa no desktop. */
const SCREENS_PER_STEP = 0.85

/**
 * Scrollytelling dos três pilares.
 *
 * Desktop (lg+): uma pista alta com um palco sticky de altura total. O
 * progresso da pista (0–1) escolhe a etapa ativa e enche o indicador de
 * progresso. Texto e cena trocam em sequência — o anterior sai primeiro
 * (imediato), o seguinte entra com atraso — por isso nunca se sobrepõem.
 * Tudo depende só da posição, logo é idêntico a subir e a descer.
 *
 * Telemóvel: etapas empilhadas; cada cena anima ao entrar no ecrã e reinicia
 * ao sair, também nos dois sentidos.
 */
export function PillarsScrolly() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const count = t.steps.length
  const [active, setActive] = useState(0)

  const trackRef = useScrollProgress<HTMLDivElement>({
    mode: 'through',
    reducedValue: null,
    onProgress: (p) => {
      const next = Math.min(count - 1, Math.floor(p * count * 0.999))
      setActive((current) => (current === next ? current : next))
    },
  })

  return (
    <section id="como-funciona" aria-labelledby="pilares-titulo" className="relative scroll-mt-24 bg-navy pt-20 lg:pt-0">
      <div className="mx-auto max-w-content px-5 sm:px-6 lg:hidden">
        <div className="max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-glow">{t.kicker}</p>
          <h2 id="pilares-titulo" className="mt-4 text-balance font-display text-[30px] font-bold leading-[1.1] tracking-[-0.025em] text-white sm:text-[44px]">
            {t.title[0]}
            <span className="text-glow">{t.title[1]}</span>
          </h2>
        </div>
      </div>

      {/* ---------- Desktop: pista + palco sticky ---------- */}
      <div ref={trackRef} className="relative hidden lg:block" style={{ height: `${100 + count * SCREENS_PER_STEP * 100}vh` }}>
        <div className="sticky top-0 flex h-screen items-center">
          <div className="mx-auto grid w-full max-w-content grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center gap-16 px-8 pt-14">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-glow">{t.kicker}</p>
              <p aria-hidden="true" className="mt-3 font-display text-[34px] font-bold leading-[1.1] tracking-[-0.025em] text-white">
                {t.title[0]}
                <span className="text-glow">{t.title[1]}</span>
              </p>
              {/* Indicador de progresso: três segmentos que enchem com o scroll */}
              <ol className="mb-9 mt-9 grid grid-cols-3 gap-3" aria-label={t.kicker}>
                {t.steps.map((step, i) => (
                  <li key={step.n} aria-current={active === i ? 'step' : undefined}>
                    <span className="block h-[2px] overflow-hidden rounded-full bg-white/[0.12]">
                      <span
                        className="block h-full origin-left bg-gradient-to-r from-accent to-glow shadow-[0_0_10px_rgba(30,144,255,0.9)]"
                        style={{ transform: `scaleX(clamp(0, calc(var(--p, 0) * ${count} - ${i}), 1))` }}
                      />
                    </span>
                    <span className={cn('mt-3 block whitespace-nowrap text-[13px] font-semibold transition-colors duration-500', active === i ? 'text-white' : 'text-white/60')}>
                      <span className="mr-1.5 text-glow">{step.n}</span>
                      {step.title}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="relative min-h-[280px]">
                {t.steps.map((step, i) => (
                  <Rise key={step.n} show={active === i} delay={260} y={16} className="absolute inset-x-0 top-0">
                    <div aria-hidden={active !== i}>
                      <StepText step={step} />
                    </div>
                  </Rise>
                ))}
              </div>
            </div>

            <SceneFrame example={t.example}>
              <div className="relative h-[420px]">
                {t.steps.map((step, i) => (
                  <Rise key={step.n} show={active === i} delay={240} y={20} className="absolute inset-0">
                    <div aria-hidden={active !== i} className="h-full">
                      <Scene index={i} lang={lang} active={active === i} />
                    </div>
                  </Rise>
                ))}
              </div>
            </SceneFrame>
          </div>
        </div>
      </div>

      {/* ---------- Telemóvel / tablet: etapas empilhadas ---------- */}
      <ol className="mx-auto max-w-content px-5 pb-20 pt-6 sm:px-6 lg:hidden">
        {t.steps.map((step, i) => (
          <MobileStep key={step.n} step={step} index={i} lang={lang} example={t.example} />
        ))}
      </ol>
    </section>
  )
}

function StepText({ step }: { step: Step }) {
  return (
    <div>
      <span className="font-display text-[13px] font-semibold tracking-[0.2em] text-glow">{step.n}</span>
      <h3 className="mt-3 font-display text-[30px] font-bold tracking-[-0.02em] text-white sm:text-[38px]">{step.title}</h3>
      <p className="mt-3 text-[18px] font-medium text-white">{step.lead}</p>
      <p className="mt-3 max-w-md text-[15.5px] leading-relaxed text-white/75">{step.body}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {step.points.map((point) => (
          <li key={point} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[12.5px] text-white/85">
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}

function MobileStep({ step, index, lang, example }: { step: Step; index: number; lang: Lang; example: string }) {
  const { ref, inView } = useInView<HTMLLIElement>({ once: false, threshold: 0.25, rootMargin: '0px' })

  return (
    <li ref={ref} className="border-t border-white/10 py-12 first:border-t-0 first:pt-6">
      <StepText step={step} />
      <div className="mt-8">
        <SceneFrame example={example}>
          <Scene index={index} lang={lang} active={inView} />
        </SceneFrame>
      </div>
    </li>
  )
}

function SceneFrame({ children, example }: { children: ReactNode; example: string }) {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute inset-x-0 -inset-y-6 rounded-[36px] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(0,82,255,0.22),transparent_70%)] blur-2xl" />
      <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.16] to-white/[0.04] p-px shadow-frame">
        <div className="rounded-[15px] bg-navy-deep p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
            </div>
            <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-white/70">{example}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

function Scene({ index, lang, active }: { index: number; lang: Lang; active: boolean }) {
  if (index === 0) return <UnderstandScene lang={lang} active={active} />
  if (index === 1) return <AnticipateScene lang={lang} active={active} />
  return <DecideScene lang={lang} active={active} />
}

const label = 'text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70'

/* ---------- 01 Compreender ---------- */

function UnderstandScene({ lang, active }: { lang: Lang; active: boolean }) {
  const pt = lang === 'pt'
  const kpis = [
    { label: pt ? 'Saldo atual' : 'Current balance', value: '€ 48.320', delta: '+4,2%', up: true },
    { label: pt ? 'Entradas de caixa' : 'Cash in', value: '€ 61.870', delta: '+8,1%', up: true },
    { label: pt ? 'Saídas de caixa' : 'Cash out', value: '€ 44.150', delta: '+11,6%', up: false },
    { label: pt ? 'Resultado do período' : 'Period result', value: '€ 17.720', delta: '-2,3%', up: false },
  ]
  const sources = pt ? ['Banco', 'Faturas', 'Clientes', 'Fornecedores'] : ['Bank', 'Invoices', 'Customers', 'Suppliers']

  return (
    <div>
      <p className={label}>{pt ? 'Indicadores principais' : 'Key indicators'}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {kpis.map((kpi, i) => (
          <Rise key={kpi.label} show={active} delay={300 + i * 90}>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[12px] text-white/70">{kpi.label}</p>
              <p className="tabular mt-1.5 text-[19px] font-bold text-white sm:text-[22px]">{kpi.value}</p>
              <p className={cn('mt-1 inline-flex flex-wrap items-center gap-1 text-[11.5px] font-semibold', kpi.up ? 'text-[#5AB4FF]' : 'text-white/75')}>
                {kpi.up ? <ArrowUpRight className="h-3 w-3" aria-hidden="true" /> : <ArrowDownRight className="h-3 w-3" aria-hidden="true" />}
                {kpi.delta} <span className="font-normal text-white/60">{pt ? 'vs. mês anterior' : 'vs. last month'}</span>
              </p>
            </div>
          </Rise>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-white/65">{pt ? 'Fontes ligadas' : 'Connected sources'}</span>
        {sources.map((s, i) => (
          <Rise key={s} show={active} delay={700 + i * 80} y={6}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-2.5 py-1 text-[12px] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-glow" aria-hidden="true" />
              {s}
            </span>
          </Rise>
        ))}
      </div>
    </div>
  )
}

/* ---------- 02 Antecipar ---------- */

function AnticipateScene({ lang, active }: { lang: Lang; active: boolean }) {
  const pt = lang === 'pt'
  const real = 'M0 120 C 40 112, 70 96, 110 100 S 180 70, 220 78 S 280 60, 320 64'
  const forecast = 'M320 64 C 360 70, 390 110, 430 132 S 500 150, 540 118 S 590 84, 620 80'
  const draw = (delay: number) => ({
    strokeDasharray: 1,
    strokeDashoffset: active ? 0 : 1,
    transition: `stroke-dashoffset 1.1s cubic-bezier(0.65,0,0.35,1) ${active ? delay : 0}ms`,
  })

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className={label}>{pt ? 'Previsão de tesouraria' : 'Cash forecast'}</p>
        <div className="flex gap-3 text-[11px] text-white/70">
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3 bg-glow" aria-hidden="true" />{pt ? 'Realizado' : 'Actual'}</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 border-t border-dashed border-white/80" aria-hidden="true" />{pt ? 'Previsão' : 'Forecast'}</span>
        </div>
      </div>

      <svg viewBox="0 0 620 180" className="mt-4 h-[170px] w-full" aria-hidden="true">
        <defs>
          <linearGradient id="fo-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1E90FF" stopOpacity="0.3" />
            <stop offset="1" stopColor="#1E90FF" stopOpacity="0" />
          </linearGradient>
          <mask id="fo-forecast-mask">
            <path d={forecast} pathLength={1} stroke="white" strokeWidth="6" fill="none" style={draw(900)} />
          </mask>
        </defs>
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="0" x2="620" y1={y} y2={y} stroke="white" strokeOpacity="0.08" />
        ))}
        <line x1="0" x2="620" y1="126" y2="126" stroke="#F0B429" strokeOpacity="0.7" strokeDasharray="3 5" />
        <text x="4" y="144" textAnchor="start" fill="#F0B429" fillOpacity="0.9" fontSize="11">{pt ? 'mínimo de caixa' : 'cash minimum'}</text>
        <path d={`${real} L320 180 L0 180 Z`} fill="url(#fo-area)" style={{ opacity: active ? 1 : 0, transition: `opacity .8s ${active ? 500 : 0}ms` }} />
        <path d={real} pathLength={1} stroke="#1E90FF" strokeWidth="2.5" fill="none" style={draw(250)} />
        <path d={forecast} stroke="white" strokeOpacity="0.85" strokeWidth="2" fill="none" strokeDasharray="5 6" mask="url(#fo-forecast-mask)" />
        <g style={{ opacity: active ? 1 : 0, transition: `opacity .5s ${active ? 1700 : 0}ms` }}>
          <circle cx="430" cy="132" r="12" fill="#F0B429" fillOpacity="0.2" />
          <circle cx="430" cy="132" r="5" fill="#F0B429" />
        </g>
      </svg>

      <Rise show={active} delay={1850}>
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-signal/35 bg-signal/[0.08] p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden="true" />
          <div>
            <p className="text-[13.5px] font-semibold text-white">{pt ? 'A tesouraria pode ficar abaixo do mínimo em 6 semanas' : 'Cash may fall below the minimum in 6 weeks'}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-white/75">
              {pt ? 'Há 7 faturas em atraso e as saídas previstas superam as entradas confirmadas.' : 'There are 7 overdue invoices and planned outflows exceed confirmed inflows.'}
            </p>
          </div>
        </div>
      </Rise>
    </div>
  )
}

/* ---------- 03 Decidir ---------- */

function DecideScene({ lang, active }: { lang: Lang; active: boolean }) {
  const pt = lang === 'pt'
  const actions = [
    { tag: pt ? 'Crítico' : 'Critical', title: pt ? 'Cobrar as faturas em atraso' : 'Collect overdue invoices', value: '€ 18.640', strong: true },
    { tag: pt ? 'Alto' : 'High', title: pt ? 'Renegociar prazo com fornecedor principal' : 'Renegotiate terms with main supplier', value: '€ 6.200', strong: false },
    { tag: pt ? 'Médio' : 'Medium', title: pt ? 'Rever subscrições e custos recorrentes' : 'Review subscriptions and recurring costs', value: '€ 1.150', strong: false },
  ]

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className={label}>{pt ? 'Plano de ação' : 'Action plan'}</p>
        <p className="text-[12px] text-white/65">{pt ? 'Ordenado por impacto' : 'Ranked by impact'}</p>
      </div>
      <ul className="mt-4 space-y-2.5">
        {actions.map((a, i) => (
          <li key={a.title}>
            <Rise show={active} delay={300 + i * 170}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3.5',
                  a.strong ? 'border-accent/60 bg-accent/[0.16] shadow-[0_0_30px_-10px_rgba(0,82,255,0.9)]' : 'border-white/10 bg-white/[0.04]',
                )}
              >
                <span className="w-5 text-center font-display text-[13px] font-bold text-white/60">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <span className={cn('text-[10.5px] font-bold uppercase tracking-wider', a.strong ? 'text-[#7CC4FF]' : 'text-white/70')}>{a.tag}</span>
                  <p className="truncate text-[13.5px] font-semibold text-white">{a.title}</p>
                </div>
                <div className="text-right">
                  <p className="tabular text-[13.5px] font-bold text-white">{a.value}</p>
                  <p className="text-[10.5px] text-white/65">{pt ? 'impacto estimado' : 'estimated impact'}</p>
                </div>
                <ChevronRight className="hidden h-4 w-4 text-white/50 sm:block" aria-hidden="true" />
              </div>
            </Rise>
          </li>
        ))}
      </ul>
      <Rise show={active} delay={900}>
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-glow" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-white/80">
            <span className="font-semibold text-white">{pt ? 'Recomendação Finer One: ' : 'Finer One recommendation: '}</span>
            {pt
              ? 'contacte primeiro os 3 clientes com maior valor em atraso — representam 72% do total por receber.'
              : 'contact the 3 customers with the largest overdue amounts first — they account for 72% of receivables.'}
          </p>
        </div>
      </Rise>
    </div>
  )
}
