import { AlertTriangle, ArrowRight, FileText } from 'lucide-react'
import { LogoMark } from '@/components/brand/Logo'
import { CashflowChart } from '@/components/product/CashflowChart'
import { ChatPreview } from '@/components/product/ChatPreview'
import { ForecastCard } from '@/components/product/ForecastCard'
import { InsightCard } from '@/components/product/InsightCard'
import { KpiCard } from '@/components/product/KpiCard'
import {
  demoAlerts,
  demoCashflow,
  demoChatThread,
  demoDiagnostic,
  demoDocuments,
  demoExpenses,
  demoKpis,
  demoPerformance,
  demoRelations,
  demoRevenue,
} from '@/data/demoDashboard'
import type { DashboardTabId, DemoRow } from '@/data/demoDashboard'
import { cn } from '@/lib/utils'

/**
 * Vistas demonstrativas de cada área do plano Plus.
 *
 * São MOCKS. Não há backend, router, pedidos de rede nem estado partilhado:
 * cada vista é uma composição estática alimentada por src/data/demoDashboard.
 * O objetivo é dar ao visitante uma ideia fiel do que cada área mostra, não
 * reproduzir a plataforma.
 *
 * Todas reutilizam as mesmas primitivas visuais — moldura, rótulo, valor,
 * barra de proporção — para que trocar de aba pareça a mesma aplicação e não
 * seis desenhos diferentes.
 */

const toneText = {
  good: 'text-glow',
  bad: 'text-signal',
  neutral: 'text-mist',
} as const

/** Moldura comum a todos os blocos das vistas. */
function Panel({
  title,
  aside,
  className,
  children,
}: {
  title?: string
  aside?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn('rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 sm:p-3.5', className)}
    >
      {title ? (
        <header className="mb-2.5 flex items-center justify-between gap-2">
          <h3 className="text-[13px] font-semibold text-white">{title}</h3>
          {aside ? <span className="shrink-0 text-[10px] text-mist">{aside}</span> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}

/** Valor grande com rótulo por cima — o bloco mais repetido das vistas. */
function Figure({ label, value, note, tone = 'neutral' }: DemoRow) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-mist">{label}</p>
      <p className="mt-1.5 text-[15px] font-semibold tabular leading-none text-white">{value}</p>
      {note ? <p className={cn('mt-1.5 text-[10.5px]', toneText[tone])}>{note}</p> : null}
    </div>
  )
}

/** Linha com barra de proporção. A barra é a leitura, o número é a confirmação. */
function ShareRow({ label, value, note, tone = 'neutral', share = 0 }: DemoRow) {
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[12px] text-white">{label}</span>
        <span className="shrink-0 text-[12px] font-semibold tabular text-white">{value}</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <span
          className={cn(
            'block h-full rounded-full',
            tone === 'bad' ? 'bg-signal/70' : tone === 'good' ? 'bg-glow' : 'bg-accent/70',
          )}
          style={{ width: `${share}%` }}
        />
      </div>
      {note ? <p className={cn('mt-1 text-[10.5px]', toneText[tone])}>{note}</p> : null}
    </li>
  )
}

/** Linha simples rótulo / valor / nota, sem barra. */
function PlainRow({ label, value, note, tone = 'neutral' }: DemoRow) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-2 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-[12px] text-white">{label}</p>
        {note ? <p className={cn('mt-0.5 text-[10.5px]', toneText[tone])}>{note}</p> : null}
      </div>
      <span className="shrink-0 text-[12px] font-semibold tabular text-white">{value}</span>
    </li>
  )
}

/* ---------------------------------------------------------------- */

function ResumoView() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="min-w-0 space-y-3 lg:col-span-2">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {demoKpis.map((kpi, index) => (
            <KpiCard key={kpi.id} kpi={kpi} index={index} />
          ))}
        </div>

        <Panel>
          <header className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[13px] font-semibold text-white">Evolução da tesouraria</h3>
            <div className="flex items-center gap-3 text-[10px] text-mist">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-px w-4 bg-glow" aria-hidden="true" />
                Realizado
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-px w-4 bg-[repeating-linear-gradient(to_right,#0052FF_0_4px,transparent_4px_8px)]"
                  aria-hidden="true"
                />
                Previsão
              </span>
            </div>
          </header>
          <CashflowChart data={demoCashflow} />
        </Panel>
      </div>

      <div className="grid min-w-0 gap-3 md:grid-cols-2 lg:grid-cols-1">
        <InsightCard />
        <ForecastCard />
        <div className="md:col-span-2 lg:col-span-1">
          <ChatPreview />
        </div>
      </div>
    </div>
  )
}

function DiagnosticoView() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Panel className="min-w-0" title="Estado financeiro" aside="Jul 2026">
        <div className="flex items-end gap-3">
          <p className="text-[34px] font-semibold tabular leading-none text-white">
            {demoDiagnostic.score}
            <span className="text-[15px] text-mist">/100</span>
          </p>
          <span className="mb-1 rounded-full border border-signal/[0.35] bg-signal/[0.12] px-2 py-0.5 text-[10px] font-medium text-signal">
            {demoDiagnostic.state}
          </span>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-accent to-glow"
            style={{ width: `${demoDiagnostic.score}%` }}
          />
        </div>

        <p className="mt-3 text-[11.5px] leading-relaxed text-mist">{demoDiagnostic.summary}</p>
      </Panel>

      <div className="min-w-0 space-y-3 lg:col-span-2">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {demoDiagnostic.metrics.map((metric) => (
            <Figure key={metric.label} {...metric} />
          ))}
        </div>

        <Panel title="Leitura Finer One">
          <ul className="space-y-2">
            {demoDiagnostic.readings.map((reading) => (
              <li key={reading} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-glow" aria-hidden="true" />
                <p className="text-[12px] leading-relaxed text-mist">{reading}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

function ReceitasView() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="min-w-0 space-y-3 lg:col-span-2">
        <Panel title="Evolução das receitas" aside={demoRevenue.caption}>
          <div className="flex items-baseline gap-2.5">
            <p className="text-[22px] font-semibold tabular leading-none text-white">
              {demoRevenue.total}
            </p>
            <span className="text-[12px] font-medium text-glow">{demoRevenue.delta}</span>
          </div>

          <div className="mt-3.5 flex h-20 items-end gap-1.5" aria-hidden="true">
            {demoRevenue.months.map((height, index) => (
              <span
                key={index}
                className={cn(
                  'flex-1 origin-bottom animate-grow-up rounded-sm',
                  index === demoRevenue.months.length - 1 ? 'bg-glow' : 'bg-accent/50',
                )}
                style={{ height: `${height}%`, animationDelay: `${index * 45}ms` }}
              />
            ))}
          </div>
        </Panel>

        <Panel title="Origem das receitas">
          <ul className="space-y-3">
            {demoRevenue.origin.map((row) => (
              <ShareRow key={row.label} {...row} />
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="min-w-0" title="Principais clientes">
        <ul>
          {demoRevenue.topClients.map((row) => (
            <PlainRow key={row.label} {...row} />
          ))}
        </ul>
      </Panel>
    </div>
  )
}

function DespesasView() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="min-w-0 space-y-3 lg:col-span-2">
        <Panel title="Despesas por categoria" aside={demoExpenses.caption}>
          <div className="flex items-baseline gap-2.5">
            <p className="text-[22px] font-semibold tabular leading-none text-white">
              {demoExpenses.total}
            </p>
            <span className="text-[12px] font-medium text-glow">{demoExpenses.delta}</span>
          </div>

          <ul className="mt-3.5 space-y-3">
            {demoExpenses.categories.map((row) => (
              <ShareRow key={row.label} {...row} />
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="min-w-0" title="Maiores desvios">
        <ul>
          {demoExpenses.categories
            .filter((category) => category.tone === 'bad')
            .map((row) => (
              <PlainRow key={row.label} {...row} />
            ))}
        </ul>
        <p className="mt-3 text-[11.5px] leading-relaxed text-mist">{demoExpenses.reading}</p>
      </Panel>
    </div>
  )
}

function RelacoesView() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="min-w-0 space-y-3">
        <Panel title="Concentração">
          <div className="grid grid-cols-2 gap-2.5">
            {demoRelations.concentration.map((row) => (
              <Figure key={row.label} {...row} />
            ))}
          </div>
        </Panel>

        <Panel title="Atrasos">
          <p className="text-[22px] font-semibold tabular leading-none text-signal">
            {demoRelations.overdue.value}
          </p>
          <p className="mt-1.5 text-[11px] text-mist">{demoRelations.overdue.note}</p>
        </Panel>
      </div>

      <Panel className="min-w-0 lg:col-span-2" title="Exposição por entidade">
        <ul>
          {demoRelations.ranking.map((row) => (
            <PlainRow key={row.label} {...row} />
          ))}
        </ul>
      </Panel>
    </div>
  )
}

function DocumentosView() {
  const stateTone = { good: 'text-glow', bad: 'text-signal', neutral: 'text-mist' } as const

  return (
    <Panel title="Documentos financeiros" aside="Jul 2026">
      <ul>
        {demoDocuments.map((document) => (
          <li
            key={document.name}
            className="flex items-center gap-3 border-b border-white/[0.05] py-2.5 last:border-0"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-mist">
              <FileText size={13} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] text-white">{document.name}</p>
              <p className="mt-0.5 text-[10.5px] text-mist">{document.kind}</p>
            </div>
            <span
              className={cn(
                'hidden shrink-0 text-[11px] sm:block',
                stateTone[document.tone],
              )}
            >
              {document.state}
            </span>
            <span className="w-[54px] shrink-0 text-right text-[11px] tabular text-mist">
              {document.date}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function PerformanceView() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Panel className="min-w-0 lg:col-span-2" title="Performance financeira" aside="Últimos 12 meses">
        <ul className="space-y-3.5">
          {demoPerformance.rows.map((row) => (
            <ShareRow key={row.label} {...row} />
          ))}
        </ul>
      </Panel>

      <Panel className="min-w-0" title="Margem operacional">
        <p className="text-[28px] font-semibold tabular leading-none text-white">
          {demoPerformance.margin.value}
        </p>
        <p className="mt-2 text-[11.5px] leading-relaxed text-signal">
          {demoPerformance.margin.note}
        </p>
      </Panel>
    </div>
  )
}

function AlertasView() {
  const levelClass = {
    Alta: 'border-signal/[0.35] bg-signal/[0.12] text-signal',
    Média: 'border-white/[0.14] bg-white/[0.05] text-white',
    Baixa: 'border-white/[0.1] bg-white/[0.03] text-mist',
  } as const

  return (
    <Panel title="Alertas financeiros" aside={`${demoAlerts.length} ativos`}>
      <ul className="space-y-2.5">
        {demoAlerts.map((alert) => (
          <li
            key={alert.title}
            className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-mist">
              <AlertTriangle size={12} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium leading-snug text-white">{alert.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-mist">{alert.context}</p>
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                levelClass[alert.level],
              )}
            >
              {alert.level}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function ChatView() {
  return (
    <Panel title="Chat Financeiro" aside="Baseado nos dados da empresa">
      <div className="space-y-2.5">
        {demoChatThread.messages.map((message) =>
          message.role === 'user' ? (
            <div key={message.text} className="flex justify-end">
              <p className="max-w-[80%] rounded-lg rounded-br-sm bg-accent/[0.15] px-2.5 py-1.5 text-[12px] leading-snug text-white">
                {message.text}
              </p>
            </div>
          ) : (
            <div key={message.text} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-white">
                <LogoMark className="h-2.5" />
              </span>
              <p className="text-[12px] leading-relaxed text-mist">{message.text}</p>
            </div>
          ),
        )}
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
        {demoChatThread.suggestions.map((suggestion) => (
          <span
            key={suggestion}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.02] px-2.5 py-1 text-[11px] text-mist"
          >
            {suggestion}
            <ArrowRight size={11} aria-hidden="true" />
          </span>
        ))}
      </div>
    </Panel>
  )
}

/* ---------------------------------------------------------------- */

const views: Record<DashboardTabId, () => React.ReactElement> = {
  resumo: ResumoView,
  diagnostico: DiagnosticoView,
  receitas: ReceitasView,
  despesas: DespesasView,
  relacoes: RelacoesView,
  documentos: DocumentosView,
  performance: PerformanceView,
  alertas: AlertasView,
  chat: ChatView,
}

export function DashboardView({ tab }: { tab: DashboardTabId }) {
  const View = views[tab]
  return <View />
}
