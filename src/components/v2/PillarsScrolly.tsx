import type { ReactNode } from 'react'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, ChevronRight } from 'lucide-react'
import { useActiveStep } from '@/hooks/useActiveStep'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

type Step = { n: string; title: string; lead: string; body: string; points: string[] }

const copy: Record<Lang, { kicker: string; title: [string, string]; example: string; steps: Step[] }> = {
  pt: {
    kicker: 'Da informação à ação',
    title: ['Compreender. Antecipar. ', 'Decidir.'],
    example: 'Exemplo · dados demonstrativos',
    steps: [
      {
        n: '01',
        title: 'Compreender',
        lead: 'Toda a informação financeira, num só lugar.',
        body: 'Contas bancárias, faturas, cashflow, receitas, despesas, clientes e fornecedores reunidos e organizados numa leitura clara.',
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
    example: 'Example · demo data',
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

/**
 * Scrollytelling dos três pilares.
 *
 * Desktop (lg+): coluna de texto com uma etapa por ecrã e painel sticky à
 * direita que troca de cena; um rail luminoso vertical acompanha o progresso.
 * Telemóvel: cada etapa mostra a sua própria cena logo abaixo do texto.
 */
export function PillarsScrolly() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const { register, active } = useActiveStep(t.steps.length)
  const railRef = useScrollProgress<HTMLDivElement>({ mode: 'through' })

  return (
    <section id="como-funciona" aria-labelledby="pilares-titulo" className="relative scroll-mt-24 bg-navy-deep py-24 lg:py-32">
      <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-glow">{t.kicker}</p>
          <h2 id="pilares-titulo" className="mt-4 text-balance font-display text-[30px] font-bold leading-[1.1] tracking-[-0.025em] text-white sm:text-[44px]">
            {t.title[0]}
            <span className="text-accent">{t.title[1]}</span>
          </h2>
        </div>

        <div ref={railRef} className="relative mt-14 lg:mt-20 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* Rail luminoso (desktop) */}
          <div aria-hidden="true" className="absolute bottom-0 left-0 top-0 hidden w-px bg-white/[0.08] lg:block">
            <div
              className="absolute left-0 top-0 w-px origin-top bg-gradient-to-b from-accent via-glow to-[#9FD3FF] shadow-[0_0_14px_2px_rgba(30,144,255,0.7)]"
              style={{ height: '100%', transform: 'scaleY(var(--p, 0))' }}
            />
          </div>

          <ol className="lg:pl-10">
            {t.steps.map((step, index) => (
              <li
                key={step.n}
                ref={register(index)}
                data-step={index}
                className="flex flex-col justify-center py-10 lg:min-h-[78vh] lg:py-0"
              >
                <div className={cn('transition-opacity duration-500', active === index ? 'lg:opacity-100' : 'lg:opacity-35')}>
                  <span className="font-display text-[13px] font-semibold tracking-[0.2em] text-glow">{step.n}</span>
                  <h3 className="mt-3 font-display text-[28px] font-bold tracking-[-0.02em] text-white sm:text-[34px]">{step.title}</h3>
                  <p className="mt-3 text-[17px] font-medium text-white/90">{step.lead}</p>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/60">{step.body}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {step.points.map((point) => (
                      <li key={point} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[12px] text-white/70">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cena inline em telemóvel */}
                <div className="mt-8 lg:hidden">
                  <SceneFrame example={t.example}>
                    <Scene index={index} lang={lang} />
                  </SceneFrame>
                </div>
              </li>
            ))}
          </ol>

          {/* Painel sticky (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-[calc(50vh-230px)]">
              <SceneFrame example={t.example}>
                <div className="relative h-[400px]">
                  {t.steps.map((step, index) => (
                    <div
                      key={step.n}
                      aria-hidden={active !== index}
                      className={cn(
                        'absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                        active === index ? 'translate-y-0 opacity-100' : index < active ? '-translate-y-6 opacity-0' : 'translate-y-6 opacity-0',
                      )}
                    >
                      {active === index && <Scene index={index} lang={lang} />}
                    </div>
                  ))}
                </div>
              </SceneFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SceneFrame({ children, example }: { children: ReactNode; example: string }) {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute inset-x-0 -inset-y-6 rounded-[36px] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(0,82,255,0.22),transparent_70%)] blur-2xl" />
      <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.14] to-white/[0.03] p-px shadow-frame">
        <div className="rounded-[15px] bg-navy p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
            </div>
            <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/50">{example}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

function Scene({ index, lang }: { index: number; lang: Lang }) {
  if (index === 0) return <UnderstandScene lang={lang} />
  if (index === 1) return <AnticipateScene lang={lang} />
  return <DecideScene lang={lang} />
}

/* ---------- 01 Compreender: indicadores principais ---------- */

function UnderstandScene({ lang }: { lang: Lang }) {
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
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/50">{pt ? 'Indicadores principais' : 'Key indicators'}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className="fo-rise rounded-xl border border-white/[0.07] bg-white/[0.03] p-4" style={{ animationDelay: `${i * 90}ms` }}>
            <p className="text-[11px] text-white/50">{kpi.label}</p>
            <p className="tabular mt-1.5 text-[19px] font-bold text-white sm:text-[22px]">{kpi.value}</p>
            <p className={cn('mt-1 inline-flex items-center gap-1 text-[11px] font-medium', kpi.up ? 'text-glow' : 'text-white/55')}>
              {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {kpi.delta} <span className="text-white/35">{pt ? 'vs. mês anterior' : 'vs. last month'}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-white/40">{pt ? 'Fontes ligadas' : 'Connected sources'}</span>
        {sources.map((s, i) => (
          <span key={s} className="fo-rise inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] text-white/80" style={{ animationDelay: `${400 + i * 80}ms` }}>
            <span className="h-1.5 w-1.5 rounded-full bg-glow" />
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- 02 Antecipar: previsão de tesouraria + alerta ---------- */

function AnticipateScene({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const real = 'M0 120 C 40 112, 70 96, 110 100 S 180 70, 220 78 S 280 60, 320 64'
  const forecast = 'M320 64 C 360 70, 390 110, 430 132 S 500 150, 540 118 S 590 84, 620 80'

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/50">{pt ? 'Previsão de tesouraria' : 'Cash forecast'}</p>
        <div className="flex gap-3 text-[10px] text-white/50">
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3 bg-glow" />{pt ? 'Realizado' : 'Actual'}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3 border-t border-dashed border-white/60" />{pt ? 'Previsão' : 'Forecast'}</span>
        </div>
      </div>

      <svg viewBox="0 0 620 180" className="mt-4 h-[170px] w-full" aria-hidden="true">
        <defs>
          <linearGradient id="fo-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1E90FF" stopOpacity="0.28" />
            <stop offset="1" stopColor="#1E90FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="0" x2="620" y1={y} y2={y} stroke="white" strokeOpacity="0.06" />
        ))}
        {/* limiar mínimo de caixa */}
        <line x1="0" x2="620" y1="126" y2="126" stroke="#F0B429" strokeOpacity="0.45" strokeDasharray="3 5" />
        <path d={`${real} L320 180 L0 180 Z`} fill="url(#fo-area)" className="fo-rise" />
        <path d={real} stroke="#1E90FF" strokeWidth="2.5" fill="none" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'fo-draw 1.2s ease-out forwards' }} />
        <path d={forecast} stroke="white" strokeOpacity="0.7" strokeWidth="2" fill="none" strokeDasharray="5 6" style={{ animation: 'fo-type 1.2s 0.9s ease-out both' }} />
        <circle cx="430" cy="132" r="5" fill="#F0B429" className="fo-rise" style={{ animationDelay: '1.6s' }} />
        <circle cx="430" cy="132" r="12" fill="#F0B429" fillOpacity="0.18" className="fo-rise" style={{ animationDelay: '1.6s' }} />
      </svg>

      <div className="fo-rise mt-4 flex items-start gap-3 rounded-xl border border-signal/25 bg-signal/[0.07] p-4" style={{ animationDelay: '1.8s' }}>
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden="true" />
        <div>
          <p className="text-[13px] font-semibold text-white">{pt ? 'A tesouraria pode ficar abaixo do mínimo em 6 semanas' : 'Cash may fall below the minimum in 6 weeks'}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/60">
            {pt ? 'Há 7 faturas em atraso e as saídas previstas superam as entradas confirmadas.' : 'There are 7 overdue invoices and planned outflows exceed confirmed inflows.'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ---------- 03 Decidir: plano de ação ---------- */

function DecideScene({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const actions = [
    { tag: pt ? 'Crítico' : 'Critical', title: pt ? 'Cobrar as faturas em atraso' : 'Collect overdue invoices', value: '€ 18.640', strong: true },
    { tag: pt ? 'Alto' : 'High', title: pt ? 'Renegociar prazo com fornecedor principal' : 'Renegotiate terms with main supplier', value: '€ 6.200', strong: false },
    { tag: pt ? 'Médio' : 'Medium', title: pt ? 'Rever subscrições e custos recorrentes' : 'Review subscriptions and recurring costs', value: '€ 1.150', strong: false },
  ]

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/50">{pt ? 'Plano de ação' : 'Action plan'}</p>
        <p className="text-[11px] text-white/40">{pt ? 'Ordenado por impacto' : 'Ranked by impact'}</p>
      </div>
      <ul className="mt-4 space-y-2.5">
        {actions.map((a, i) => (
          <li
            key={a.title}
            className={cn(
              'fo-rise flex items-center gap-3 rounded-xl border p-3.5',
              a.strong ? 'border-accent/50 bg-accent/[0.12] shadow-[0_0_30px_-10px_rgba(0,82,255,0.9)]' : 'border-white/[0.07] bg-white/[0.03]',
            )}
            style={{ animationDelay: `${i * 160}ms` }}
          >
            <span className="w-5 text-center font-display text-[13px] font-bold text-white/40">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <span className={cn('text-[10px] font-semibold uppercase tracking-wider', a.strong ? 'text-glow' : 'text-white/45')}>{a.tag}</span>
              <p className="truncate text-[13px] font-semibold text-white">{a.title}</p>
            </div>
            <div className="text-right">
              <p className="tabular text-[13px] font-bold text-white">{a.value}</p>
              <p className="text-[10px] text-white/40">{pt ? 'impacto estimado' : 'estimated impact'}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30" aria-hidden="true" />
          </li>
        ))}
      </ul>
      <div className="fo-rise mt-4 flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4" style={{ animationDelay: '600ms' }}>
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-glow" aria-hidden="true" />
        <p className="text-[12.5px] leading-relaxed text-white/70">
          <span className="font-semibold text-white">{pt ? 'Recomendação Finer One: ' : 'Finer One recommendation: '}</span>
          {pt
            ? 'contacte primeiro os 3 clientes com maior valor em atraso — representam 72% do total por receber.'
            : 'contact the 3 customers with the largest overdue amounts first — they account for 72% of receivables.'}
        </p>
      </div>
    </div>
  )
}
