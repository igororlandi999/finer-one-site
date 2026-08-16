import {
  ChartNoAxesColumnIncreasing,
  CircleCheck,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { HighlightedText } from '@/components/product/diagnostic/HighlightedText'
import type { PerformanceMetrics } from '@/components/product/performance/derivePerformanceMetrics'
import type { TextPart } from '@/data/demoDashboard'
import { useLanguage } from '@/i18n/LanguageContext'
import { formatEuro, formatPercent, formatPercentPlain, formatPercentagePoints } from '@/lib/format'
import { cn } from '@/lib/utils'

function buildBlocks(metrics: PerformanceMetrics, pt: boolean) {
  const { receitas, ebitda, lucroLiquido, solvabilidade, investimento } = metrics

  const conclusionParts: TextPart[] = pt
    ? [{ text: 'Melhoria na escala comercial e na eficiência operacional, reforçando resultados e solvabilidade.' }]
    : [{ text: 'Improvement in commercial scale and operating efficiency, strengthening results and solvency.' }]

  const evidenceItems: TextPart[][] = pt
    ? [
        [{ text: 'Receitas ' }, { text: formatEuro(receitas.current), highlight: true }, { text: ` (${formatPercent(receitas.deltaPct)}).` }],
        [{ text: 'EBITDA ' }, { text: formatEuro(ebitda.current), highlight: true }, { text: `, margem ${formatPercentPlain(ebitda.marginPct)}.` }],
        [{ text: 'Solvabilidade ' }, { text: formatPercentPlain(solvabilidade.current), highlight: true }, { text: ` (${formatPercentagePoints(solvabilidade.deltaPP)}).` }],
      ]
    : [
        [{ text: 'Revenue ' }, { text: formatEuro(receitas.current), highlight: true }, { text: ` (${formatPercent(receitas.deltaPct)}).` }],
        [{ text: 'EBITDA ' }, { text: formatEuro(ebitda.current), highlight: true }, { text: `, margin ${formatPercentPlain(ebitda.marginPct)}.` }],
        [{ text: 'Solvency ' }, { text: formatPercentPlain(solvabilidade.current), highlight: true }, { text: ` (${formatPercentagePoints(solvabilidade.deltaPP)}).` }],
      ]

  const causesParts: TextPart[] = pt
    ? [{ text: 'Receitas e margem bruta em alta sustentaram o EBITDA; o maior ativo reflete investimento, reforçando o capital próprio.' }]
    : [{ text: 'Higher revenue and gross margin sustained EBITDA; the larger asset base reflects investment, strengthening equity.' }]

  const impactParts: TextPart[] = pt
    ? [{ text: `Margem líquida de ${formatPercentPlain(lucroLiquido.marginPct)}, ainda abaixo da EBITDA (${formatPercentPlain(ebitda.marginPct)}) por custos não operacionais e fiscais.` }]
    : [{ text: `Net margin of ${formatPercentPlain(lucroLiquido.marginPct)}, still below EBITDA (${formatPercentPlain(ebitda.marginPct)}) due to non-operating and tax costs.` }]

  const riskParts: TextPart[] = pt
    ? [{ text: 'Investimento consumiu ' }, { text: formatEuro(Math.abs(investimento.current)), highlight: true }, { text: ` de caixa (${formatPercent(investimento.deltaPct)}), reduzindo a folga financeira.` }]
    : [{ text: 'Investing activity used ' }, { text: formatEuro(Math.abs(investimento.current)), highlight: true }, { text: ` in cash (${formatPercent(investimento.deltaPct)}), reducing the financial cushion.` }]

  const priorityParts: TextPart[] = pt
    ? [{ text: 'Controlar custos, acelerar retorno dos investimentos e manter solvabilidade acima de 50%.' }]
    : [{ text: 'Control costs, accelerate the return on investments, and keep solvency above 50%.' }]

  return { conclusionParts, evidenceItems, causesParts, impactParts, riskParts, priorityParts }
}

function AnalysisBlock({
  icon: Icon,
  tone,
  title,
  children,
}: {
  icon: LucideIcon
  tone: 'accent' | 'signal'
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-1.5">
      <span
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
          tone === 'signal' ? 'bg-signal/[0.14] text-signal' : 'bg-accent/[0.14] text-glow',
        )}
      >
        <Icon size={9.5} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-medium leading-snug text-white">{title}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  )
}

export function PerformanceAnalysis({ metrics }: { metrics: PerformanceMetrics }) {
  const { lang } = useLanguage()
  const pt = lang === 'pt'
  const { conclusionParts, evidenceItems, causesParts, impactParts, riskParts, priorityParts } = buildBlocks(metrics, pt)

  const titles = pt
    ? {
        header: 'Análise rápida da performance',
        conclusion: 'Conclusão principal',
        evidence: 'Evidência',
        causes: 'Causas',
        impact: 'Impacto na rentabilidade',
        risk: 'Ponto de atenção',
        priority: 'Prioridade',
      }
    : {
        header: 'Quick performance analysis',
        conclusion: 'Main conclusion',
        evidence: 'Evidence',
        causes: 'Causes',
        impact: 'Impact on profitability',
        risk: 'Point of attention',
        priority: 'Priority',
      }

  return (
    <section className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2 sm:p-2.5">
      <header className="mb-1.5 flex items-center gap-1.5">
        <Sparkles size={11} aria-hidden="true" className="text-glow" />
        <h3 className="text-[12px] font-semibold text-white">{titles.header}</h3>
      </header>

      <div className="grid items-start gap-x-4 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
        <AnalysisBlock icon={CircleCheck} tone="accent" title={titles.conclusion}>
          <HighlightedText parts={conclusionParts} className="text-[10px] leading-snug text-mist" />
        </AnalysisBlock>

        <AnalysisBlock icon={ChartNoAxesColumnIncreasing} tone="accent" title={titles.evidence}>
          <ul className="space-y-0.5">
            {evidenceItems.map((parts, index) => (
              <li key={index} className="flex items-start gap-1.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-glow" aria-hidden="true" />
                <HighlightedText parts={parts} className="min-w-0 text-[10px] leading-snug text-mist" />
              </li>
            ))}
          </ul>
        </AnalysisBlock>

        <AnalysisBlock icon={Search} tone="accent" title={titles.causes}>
          <HighlightedText parts={causesParts} className="text-[10px] leading-snug text-mist" />
        </AnalysisBlock>

        <AnalysisBlock icon={TrendingUp} tone="accent" title={titles.impact}>
          <HighlightedText parts={impactParts} className="text-[10px] leading-snug text-mist" />
        </AnalysisBlock>

        <AnalysisBlock icon={TriangleAlert} tone="signal" title={titles.risk}>
          <HighlightedText parts={riskParts} className="text-[10px] leading-snug text-mist" />
        </AnalysisBlock>

        <AnalysisBlock icon={Target} tone="accent" title={titles.priority}>
          <HighlightedText parts={priorityParts} className="text-[10px] leading-snug text-mist" />
        </AnalysisBlock>
      </div>
    </section>
  )
}
