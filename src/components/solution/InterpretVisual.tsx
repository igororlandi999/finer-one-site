import { systemIcons } from '@/components/problem/sourceIcons'
import { useSolutionSectionData } from '@/data/solutionSection'
import { cn } from '@/lib/utils'

/**
 * 03 — Antecipamos.
 *
 * Previsão de tesouraria por horizonte: barras horizontais cujo comprimento
 * é o próprio valor, sem eixo nem grelha. O horizonte de 90 dias, o único em
 * risco, é o único que rompe a paleta azul. Fecha com uma leitura curta,
 * separada por régua subtil, no mesmo padrão do resto da secção.
 */
const AnalysisIcon = systemIcons.analysis
const WarningIcon = systemIcons.warning
const InfoIcon = systemIcons.info

export function InterpretVisual({ active }: { active: boolean }) {
  const { treasuryForecast, treasuryHorizons } = useSolutionSectionData()

  return (
    <div className="w-full">
      <div
        className={cn(
          'flex items-center gap-2.5 transition-opacity duration-500',
          active ? 'opacity-100' : 'opacity-0',
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-accent/[0.4] bg-navy">
          <AnalysisIcon size={18} aria-hidden="true" className="text-glow" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-white">
            {treasuryForecast.title}
          </span>
          <span className="block truncate text-[11px] text-mist">{treasuryForecast.subtitle}</span>
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {treasuryHorizons.map((horizon, index) => (
          <div
            key={horizon.label}
            className={cn(
              'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
              active ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: `${160 + index * 110}ms` }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[11px] text-mist">{horizon.label}</span>
              <span
                className={cn(
                  'text-[13px] font-semibold tabular',
                  horizon.highlightValue ? 'text-glow' : 'text-white',
                )}
              >
                {horizon.value}
              </span>
            </div>

            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={cn(
                  'h-full origin-left rounded-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  horizon.risk ? 'bg-signal/80' : 'bg-glow/70',
                  active ? 'scale-x-100' : 'scale-x-0',
                )}
                style={{ width: `${horizon.share}%`, transitionDelay: `${220 + index * 110}ms` }}
              />
            </div>

            {horizon.risk && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-signal/30 bg-signal/10 px-2 py-0.5 text-[10px] text-signal">
                <WarningIcon size={14} aria-hidden="true" />
                {treasuryForecast.alertLabel}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2.5 border-t border-white/[0.06] pt-4">
        <InfoIcon size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-glow" />
        <p className="text-[12px] leading-relaxed text-mist">{treasuryForecast.note}</p>
      </div>
    </div>
  )
}
