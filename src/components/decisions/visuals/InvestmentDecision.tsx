import { DataLabel, DataValue, Meter, Panel } from '@/components/decisions/primitives'
import {
  investmentFigures,
  investmentLeverage,
  investmentScenarios,
} from '@/data/decisionsSection'
import { cn } from '@/lib/utils'

/**
 * 02 — Investir. Composição de cenário: a mesma posição de liquidez antes e
 * depois da decisão, à mesma escala, para a diferença ser lida de relance.
 */
export function InvestmentDecision() {
  return (
    <div className="flex h-full flex-col gap-3">
      <Panel className="p-3 sm:p-4">
        <ul className="space-y-3.5">
          {investmentScenarios.map((scenario, index) => (
            <li key={scenario.label}>
              <div className="flex items-baseline justify-between gap-3">
                <DataLabel>{scenario.label}</DataLabel>
                <p
                  className={cn(
                    'shrink-0 font-semibold tabular text-[15px] sm:text-[16px]',
                    scenario.highlight ? 'text-glow' : 'text-white',
                  )}
                >
                  {scenario.value}
                </p>
              </div>
              <Meter
                share={scenario.share}
                tone={scenario.highlight ? 'glow' : 'muted'}
                className="mt-2"
                delay={index * 140}
              />
            </li>
          ))}
        </ul>
      </Panel>

      <div className="grid grid-cols-2 gap-2.5">
        {investmentFigures.map((figure) => (
          <Panel key={figure.label} className="p-3 sm:p-3.5">
            <DataLabel className="min-h-[26px]">{figure.label}</DataLabel>
            <DataValue size="sm" className="mt-2">
              {figure.value}
            </DataValue>
          </Panel>
        ))}
      </div>

      <Panel className="p-3 sm:p-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <DataLabel>{investmentLeverage.label}</DataLabel>
          <p className="shrink-0 text-[13px] font-semibold tabular text-white">
            {investmentLeverage.value}
          </p>
        </div>
        <Meter share={investmentLeverage.share} tone="accent" className="mt-2" delay={280} />
      </Panel>
    </div>
  )
}
