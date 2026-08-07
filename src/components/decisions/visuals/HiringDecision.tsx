import { DataLabel, DataValue, Panel } from '@/components/decisions/primitives'
import { hiringImpact, hiringMetrics } from '@/data/decisionsSection'
import { cn } from '@/lib/utils'

/**
 * 01 — Contratar. Composição de KPIs: quatro valores conhecidos, um deles
 * marcado como a variável que a decisão introduz, e o peso desse custo
 * dentro da previsão já existente.
 */
export function HiringDecision() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5">
        {hiringMetrics.map((metric) => (
          <Panel
            key={metric.label}
            className={cn('p-3 sm:p-3.5', metric.variable && 'border-accent/[0.35] bg-accent/[0.06]')}
          >
            <DataLabel className="min-h-[26px]">{metric.label}</DataLabel>
            <DataValue className={cn('mt-2', metric.variable && 'text-glow')}>
              {metric.value}
            </DataValue>
          </Panel>
        ))}
      </div>

      <Panel className="p-3 sm:p-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <DataLabel>{hiringImpact.costLabel}</DataLabel>
          <p className="shrink-0 text-[13px] font-semibold tabular text-white">
            {hiringImpact.costValue}
          </p>
        </div>

        {/* O custo desenhado dentro da previsão que já existe, à escala. */}
        <span
          aria-hidden="true"
          className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-white/[0.07]"
        >
          <span
            className="h-full origin-left animate-grow-right rounded-l-full bg-gradient-to-r from-accent/50 to-glow/50"
            style={{ width: `${100 - hiringImpact.share}%` }}
          />
          <span
            className="h-full origin-left animate-grow-right rounded-r-full bg-signal/70"
            style={{ width: `${hiringImpact.share}%`, animationDelay: '220ms' }}
          />
        </span>

        <div className="mt-2 flex items-baseline justify-between gap-3 text-[10.5px]">
          <span className="text-mist">
            {hiringImpact.baseLabel} · {hiringImpact.baseValue}
          </span>
          <span className="shrink-0 tabular text-signal">{hiringImpact.note}</span>
        </div>
      </Panel>
    </div>
  )
}
