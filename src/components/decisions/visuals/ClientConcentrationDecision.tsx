import { DataLabel, DataValue, Panel } from '@/components/decisions/primitives'
import { concentrationBands, concentrationFigures } from '@/data/decisionsSection'
import { cn } from '@/lib/utils'

const fills = {
  primary: 'bg-gradient-to-r from-accent to-glow',
  secondary: 'bg-accent/[0.45]',
  rest: 'bg-white/[0.12]',
}

const dots = {
  primary: 'bg-glow',
  secondary: 'bg-accent/70',
  rest: 'bg-white/25',
}

/**
 * 05 — Concentração. Uma única barra de 100% dividida em três segmentos.
 *
 * Sem `signal`: concentração é uma característica do negócio, não uma
 * deterioração. O objetivo é dar a dimensão, não soar a alarme.
 */
export function ClientConcentrationDecision() {
  return (
    <div className="flex h-full flex-col gap-3">
      <Panel className="p-3 sm:p-4">
        <DataLabel>Composição da faturação analisada</DataLabel>

        <span aria-hidden="true" className="mt-3 flex h-3.5 gap-1">
          {concentrationBands.map((band, index) => (
            <span
              key={band.label}
              className={cn(
                'h-full origin-left animate-grow-right rounded-[3px]',
                fills[band.tone],
              )}
              style={{ width: `${band.share}%`, animationDelay: `${index * 130}ms` }}
            />
          ))}
        </span>

        <ul className="mt-3.5 space-y-2">
          {concentrationBands.map((band) => (
            <li key={band.label} className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className={cn('h-2 w-2 shrink-0 rounded-[2px]', dots[band.tone])}
              />
              <span className="min-w-0 flex-1 text-[11.5px] text-mist">{band.label}</span>
              <span className="shrink-0 text-[12px] font-semibold tabular text-white">
                {band.share}%
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="grid grid-cols-3 gap-2.5">
        {concentrationFigures.map((figure) => (
          <Panel key={figure.label} className="p-3 sm:p-3.5">
            <DataLabel className="min-h-[26px]">{figure.label}</DataLabel>
            <DataValue className="mt-2">{figure.value}</DataValue>
          </Panel>
        ))}
      </div>
    </div>
  )
}
