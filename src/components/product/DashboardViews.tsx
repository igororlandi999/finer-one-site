import { useState } from 'react'
import {
  ArrowRight,
  Building2,
  ChartNoAxesColumnIncreasing,
  Info,
  Shield,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { AlertFilters } from '@/components/product/alerts/AlertFilters'
import type { AlertCounts, AlertFilterId } from '@/components/product/alerts/AlertFilters'
import { FinancialAlertCard } from '@/components/product/alerts/FinancialAlertCard'
import { CashflowChart } from '@/components/product/CashflowChart'
import { ChatInput } from '@/components/product/chat/ChatInput'
import { ChatUserMessage } from '@/components/product/chat/ChatUserMessage'
import { FinerAIResponse } from '@/components/product/chat/FinerAIResponse'
import { QuickActions } from '@/components/product/chat/QuickActions'
import { SmartInsights } from '@/components/product/chat/SmartInsights'
import { SuggestedQuestions } from '@/components/product/chat/SuggestedQuestions'
import { ChatPreview } from '@/components/product/ChatPreview'
import { DiagnosticHealthCard } from '@/components/product/diagnostic/DiagnosticHealthCard'
import { DiagnosticMetricCard } from '@/components/product/diagnostic/DiagnosticMetricCard'
import { DiagnosticProblems } from '@/components/product/diagnostic/DiagnosticProblems'
import { ExecutiveSummary } from '@/components/product/diagnostic/ExecutiveSummary'
import { RecommendedAction } from '@/components/product/diagnostic/RecommendedAction'
import { ForecastCard } from '@/components/product/ForecastCard'
import { InsightCard } from '@/components/product/InsightCard'
import { KpiCard } from '@/components/product/KpiCard'
import { derivePerformanceMetrics } from '@/components/product/performance/derivePerformanceMetrics'
import { FinancialSummaryTable } from '@/components/product/performance/FinancialSummaryTable'
import { PerformanceAnalysis } from '@/components/product/performance/PerformanceAnalysis'
import { PerformanceKpiCard } from '@/components/product/performance/PerformanceKpiCard'
import { PerformanceTabs } from '@/components/product/performance/PerformanceTabs'
import type { PerformanceTabId } from '@/components/product/performance/PerformanceTabs'
import { useDemoDashboardData } from '@/data/demoDashboard'
import type { ChatSuggestionId, DashboardTabId, FinancialAlert, FinancialLineItem } from '@/data/demoDashboard'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { formatEuro, formatPercent, formatPercentPlain, formatPercentagePoints } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Vistas demonstrativas de cada área do plano Plus.
 *
 * São MOCKS. Não há backend, router, pedidos de rede nem estado partilhado:
 * cada vista é uma composição estática alimentada por src/data/demoDashboard
 * (via useDemoDashboardData, que devolve a fatia PT ou EN conforme o idioma
 * ativo). O objetivo é dar ao visitante uma ideia fiel do que cada área
 * mostra, não reproduzir a plataforma.
 *
 * Todas reutilizam as mesmas primitivas visuais — moldura, rótulo, valor,
 * barra de proporção — para que trocar de aba pareça a mesma aplicação e não
 * seis desenhos diferentes.
 */

const viewCopy = {
  pt: {
    cashflowTitle: 'Evolução da tesouraria',
    realized: 'Realizado',
    forecastLegend: 'Previsão',
    marginTooltip: 'Evolução da rentabilidade operacional no período selecionado.',
    treasuryTooltip: 'Estimativa da posição de tesouraria nos próximos 30 dias.',
    riskTooltip: 'Avaliação consolidada dos principais fatores de risco financeiro.',
    marginLabel: 'Margem operacional',
    treasuryLabel: 'Tesouraria a 30 dias',
    riskLabel: 'Nível de risco',
    /** Chave do 4º item de demoDiagnostic.metrics (ver demoDashboard.ts) — distinta do riskLabel acima, que é o rótulo deste card. */
    overallRiskMetricLabel: 'Risco global',
    riskCaption: 'sob pressão',
    forecastCaption: 'previsão',
    pnlTitle: 'P&L (Resumo)',
    pnlTooltip: 'Resumo da demonstração de resultados da empresa no período.',
    balanceTitle: 'Balanço (Resumo)',
    balanceTooltip: 'Resumo da posição patrimonial e financeira da empresa.',
    cashflowStatementTitle: 'Cashflow (Resumo)',
    cashflowStatementTooltip: 'Resumo das entradas e saídas de caixa por atividade.',
    revenueLabel: 'Receitas',
    revenueTooltip: 'Receita total faturada no período selecionado.',
    ebitdaLabel: 'EBITDA',
    ebitdaTooltip: 'Resultado antes de juros, impostos, depreciações e amortizações.',
    netProfitLabel: 'Lucro Líquido',
    netProfitTooltip: 'Resultado líquido da empresa após juros e impostos.',
    totalAssetsLabel: 'Ativo Total',
    totalAssetsTooltip: 'Total de bens e direitos da empresa registados no balanço.',
    solvencyLabel: 'Solvabilidade',
    solvencyTooltip: 'Peso do capital próprio no financiamento do ativo total.',
    marginCaption: (value: string) => `Margem: ${value}`,
    sortOptions: [
      { id: 'critical', label: 'Mais críticos' },
      { id: 'recent', label: 'Mais recentes' },
      { id: 'impact', label: 'Maior impacto' },
    ] as const,
    sortBy: 'Ordenar por',
    noAlerts: 'Nenhum alerta financeiro identificado para os filtros selecionados.',
    seeAll: (n: number) => `Ver todos os ${n} alertas`,
    alertsNote:
      'Os alertas são gerados com base na análise dos seus dados financeiros e servem como apoio à tomada de decisão.',
  },
  en: {
    cashflowTitle: 'Cash flow trend',
    realized: 'Actual',
    forecastLegend: 'Forecast',
    marginTooltip: 'Trend in operating profitability over the selected period.',
    treasuryTooltip: 'Estimated cash position over the next 30 days.',
    riskTooltip: 'Consolidated assessment of the main financial risk factors.',
    marginLabel: 'Operating margin',
    treasuryLabel: '30-day cash',
    riskLabel: 'Risk level',
    overallRiskMetricLabel: 'Overall risk',
    riskCaption: 'under pressure',
    forecastCaption: 'forecast',
    pnlTitle: 'P&L (Summary)',
    pnlTooltip: "Summary of the company's income statement for the period.",
    balanceTitle: 'Balance Sheet (Summary)',
    balanceTooltip: "Summary of the company's financial position.",
    cashflowStatementTitle: 'Cash Flow (Summary)',
    cashflowStatementTooltip: 'Summary of cash inflows and outflows by activity.',
    revenueLabel: 'Revenue',
    revenueTooltip: 'Total revenue billed in the selected period.',
    ebitdaLabel: 'EBITDA',
    ebitdaTooltip: 'Earnings before interest, taxes, depreciation and amortization.',
    netProfitLabel: 'Net Profit',
    netProfitTooltip: "Company's net result after interest and taxes.",
    totalAssetsLabel: 'Total Assets',
    totalAssetsTooltip: "Total of the company's assets recorded on the balance sheet.",
    solvencyLabel: 'Solvency',
    solvencyTooltip: "Weight of equity in financing the company's total assets.",
    marginCaption: (value: string) => `Margin: ${value}`,
    sortOptions: [
      { id: 'critical', label: 'Most critical' },
      { id: 'recent', label: 'Most recent' },
      { id: 'impact', label: 'Highest impact' },
    ] as const,
    sortBy: 'Sort by',
    noAlerts: 'No financial alerts found for the selected filters.',
    seeAll: (n: number) => `See all ${n} alerts`,
    alertsNote: "Alerts are generated based on your financial data and support decision-making.",
  },
} satisfies Record<Lang, unknown>

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

/* ---------------------------------------------------------------- */

function ResumoView() {
  const { lang } = useLanguage()
  const t = viewCopy[lang]
  const { demoKpis, demoCashflow } = useDemoDashboardData()

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
            <h3 className="text-[13px] font-semibold text-white">{t.cashflowTitle}</h3>
            <div className="flex items-center gap-3 text-[10px] text-mist">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-px w-4 bg-glow" aria-hidden="true" />
                {t.realized}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-px w-4 bg-[repeating-linear-gradient(to_right,#0052FF_0_4px,transparent_4px_8px)]"
                  aria-hidden="true"
                />
                {t.forecastLegend}
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
  const { lang } = useLanguage()
  const t = viewCopy[lang]
  const { demoKpis, demoForecast, demoDiagnostic, demoDiagnosticSummary, demoDiagnosticProblems, demoDiagnosticAction } =
    useDemoDashboardData()
  const margin = demoKpis.find((kpi) => kpi.id === 'margem')
  const riskLevel =
    demoDiagnostic.metrics.find((metric) => metric.label === t.overallRiskMetricLabel)?.value ?? demoDiagnostic.state

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <DiagnosticHealthCard score={demoDiagnostic.score} state={demoDiagnostic.state} />

        <DiagnosticMetricCard
          icon={TrendingDown}
          tone="signal"
          label={t.marginLabel}
          tooltip={t.marginTooltip}
          value={margin?.delta !== undefined ? formatPercent(margin.delta) : '—'}
          animate={margin?.delta !== undefined ? { value: margin.delta, format: formatPercent, delay: 90 } : undefined}
          caption={lang === 'pt' ? 'vs período anterior' : 'vs. prior period'}
        />

        <DiagnosticMetricCard
          icon={Wallet}
          tone="accent"
          label={t.treasuryLabel}
          tooltip={t.treasuryTooltip}
          value={formatEuro(demoForecast.value)}
          animate={{ value: demoForecast.value, format: formatEuro, delay: 180 }}
          caption={t.forecastCaption}
        />

        <DiagnosticMetricCard
          icon={Shield}
          tone="signal"
          label={t.riskLabel}
          tooltip={t.riskTooltip}
          value={riskLevel}
          caption={t.riskCaption}
        />
      </div>

      <ExecutiveSummary parts={demoDiagnosticSummary} />

      <div className="grid items-start gap-2.5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <DiagnosticProblems problems={demoDiagnosticProblems} />
        </div>
        <div className="lg:col-span-3">
          <RecommendedAction
            title={demoDiagnosticAction.title}
            description={demoDiagnosticAction.description}
            cta={demoDiagnosticAction.cta}
          />
        </div>
      </div>
    </div>
  )
}

function PerformanceView() {
  const { lang } = useLanguage()
  const t = viewCopy[lang]
  const { demoPnl, demoBalance, demoCashflowStatement } = useDemoDashboardData()
  const performanceMetrics = derivePerformanceMetrics(demoPnl, demoBalance, demoCashflowStatement)
  const { receitas, ebitda, lucroLiquido, ativoTotal, solvabilidade } = performanceMetrics
  const [activeTable, setActiveTable] = useState<PerformanceTabId>('pnl')

  const performanceTableByTab: Record<PerformanceTabId, { title: string; tooltip: string; rows: FinancialLineItem[] }> = {
    pnl: { title: t.pnlTitle, tooltip: t.pnlTooltip, rows: demoPnl },
    balance: { title: t.balanceTitle, tooltip: t.balanceTooltip, rows: demoBalance },
    cashflow: { title: t.cashflowStatementTitle, tooltip: t.cashflowStatementTooltip, rows: demoCashflowStatement },
  }
  const table = performanceTableByTab[activeTable]

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
        <PerformanceKpiCard
          icon={TrendingUp}
          label={t.revenueLabel}
          tooltip={t.revenueTooltip}
          value={receitas.current}
          format={formatEuro}
          delay={0}
          deltaLabel={formatPercent(receitas.deltaPct)}
          deltaGood={receitas.deltaPct >= 0}
        />
        <PerformanceKpiCard
          icon={ChartNoAxesColumnIncreasing}
          label={t.ebitdaLabel}
          tooltip={t.ebitdaTooltip}
          value={ebitda.current}
          format={formatEuro}
          delay={70}
          deltaLabel={formatPercent(ebitda.deltaPct)}
          deltaGood={ebitda.deltaPct >= 0}
          caption={t.marginCaption(formatPercentPlain(ebitda.marginPct))}
        />
        <PerformanceKpiCard
          icon={Wallet}
          label={t.netProfitLabel}
          tooltip={t.netProfitTooltip}
          value={lucroLiquido.current}
          format={formatEuro}
          delay={140}
          deltaLabel={formatPercent(lucroLiquido.deltaPct)}
          deltaGood={lucroLiquido.deltaPct >= 0}
          caption={t.marginCaption(formatPercentPlain(lucroLiquido.marginPct))}
        />
        <PerformanceKpiCard
          icon={Building2}
          label={t.totalAssetsLabel}
          tooltip={t.totalAssetsTooltip}
          value={ativoTotal.current}
          format={formatEuro}
          delay={210}
          deltaLabel={formatPercent(ativoTotal.deltaPct)}
          deltaGood={ativoTotal.deltaPct >= 0}
        />
        <PerformanceKpiCard
          icon={ShieldCheck}
          label={t.solvencyLabel}
          tooltip={t.solvencyTooltip}
          value={solvabilidade.current}
          format={formatPercentPlain}
          delay={280}
          deltaLabel={formatPercentagePoints(solvabilidade.deltaPP)}
          deltaGood={solvabilidade.deltaPP >= 0}
        />
      </div>

      <PerformanceTabs active={activeTable} onChange={setActiveTable} />

      <FinancialSummaryTable title={table.title} tooltip={table.tooltip} rows={table.rows} />

      <PerformanceAnalysis metrics={performanceMetrics} />
    </div>
  )
}

const severityRank: Record<FinancialAlert['severity'], number> = { critical: 0, warning: 1, info: 2 }

const ALERTS_PAGE_SIZE = 5

function AlertasView() {
  const { lang } = useLanguage()
  const t = viewCopy[lang]
  const { demoAlerts } = useDemoDashboardData()
  const [filter, setFilter] = useState<AlertFilterId>('all')
  const [sortBy, setSortBy] = useState<(typeof t.sortOptions)[number]['id']>('critical')
  const [showAll, setShowAll] = useState(false)

  const counts: AlertCounts = {
    all: demoAlerts.length,
    critical: demoAlerts.filter((alert) => alert.severity === 'critical').length,
    warning: demoAlerts.filter((alert) => alert.severity === 'warning').length,
    info: demoAlerts.filter((alert) => alert.severity === 'info').length,
  }

  const filtered = filter === 'all' ? demoAlerts : demoAlerts.filter((alert) => alert.severity === filter)

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'recent') return a.recencyRank - b.recencyRank
    if (sortBy === 'impact') return b.impactMagnitude - a.impactMagnitude
    return severityRank[a.severity] - severityRank[b.severity]
  })

  const visible = showAll ? sorted : sorted.slice(0, ALERTS_PAGE_SIZE)
  const hiddenCount = sorted.length - visible.length

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AlertFilters
          counts={counts}
          active={filter}
          onChange={(next) => {
            setFilter(next)
            setShowAll(false)
          }}
        />

        <label className="flex items-center gap-1.5 text-[10px] text-mist">
          {t.sortBy}
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as (typeof t.sortOptions)[number]['id'])}
            className="rounded-md border border-white/[0.1] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white"
          >
            {t.sortOptions.map((option) => (
              <option key={option.id} value={option.id} className="bg-navy text-white">
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length > 0 ? (
        <ul className="space-y-1.5">
          {visible.map((alert) => (
            <FinancialAlertCard key={alert.id} alert={alert} />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-center text-[11px] text-mist">
          {t.noAlerts}
        </p>
      )}

      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mx-auto flex items-center gap-1 text-[11px] font-medium text-glow"
        >
          {t.seeAll(sorted.length)}
          <ArrowRight size={11} aria-hidden="true" />
        </button>
      ) : null}

      <p className="flex items-center gap-1.5 text-[10px] text-mist">
        <Info size={11} className="shrink-0" aria-hidden="true" />
        {t.alertsNote}
      </p>
    </div>
  )
}

function ChatView() {
  const { demoChatSuggestions, demoChatAnswer } = useDemoDashboardData()
  const [selectedSuggestion, setSelectedSuggestion] = useState<ChatSuggestionId>(demoChatSuggestions[0].id)
  const [input, setInput] = useState('')

  return (
    <div className="grid gap-2.5 lg:grid-cols-[1fr_212px] lg:items-start">
      <div className="min-w-0 space-y-2.5">
        <SuggestedQuestions
          selected={selectedSuggestion}
          onSelect={(suggestion) => {
            setSelectedSuggestion(suggestion.id)
            setInput(suggestion.question)
          }}
        />

        <div className="space-y-2">
          <ChatUserMessage text={demoChatAnswer.question} time={demoChatAnswer.time} />
          <FinerAIResponse answer={demoChatAnswer} />
        </div>

        <ChatInput value={input} onChange={setInput} />
      </div>

      <div className="space-y-2.5">
        <QuickActions onSelect={setInput} />
        <SmartInsights />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */

const views: Record<DashboardTabId, () => React.ReactElement> = {
  resumo: ResumoView,
  diagnostico: DiagnosticoView,
  performance: PerformanceView,
  alertas: AlertasView,
  chat: ChatView,
}

export function DashboardView({ tab }: { tab: DashboardTabId }) {
  const View = views[tab]
  return <View />
}
