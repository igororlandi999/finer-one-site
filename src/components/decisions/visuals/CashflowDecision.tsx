import { DataLabel, Panel } from '@/components/decisions/primitives'
import { treasuryHorizon, treasuryNote } from '@/data/decisionsSection'
import { cn } from '@/lib/utils'

/**
 * 04 — Tesouraria. Horizonte de saldo em quatro estações sobre uma calha
 * temporal. Colunas assentes numa linha de base e não uma série contínua:
 * lê-se como uma projeção de tesouraria, não como um gráfico de cotações.
 */
export function CashflowDecision() {
  return (
    <div className="flex h-full flex-col">
      <Panel className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-baseline justify-between gap-3">
          <DataLabel>Saldo de tesouraria projetado</DataLabel>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[10.5px] text-mist">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" />
            {treasuryNote}
          </span>
        </div>

        <div className="relative mt-4 flex min-h-[142px] flex-1 gap-2 sm:gap-3">
          {/* Faixa de fundo do horizonte mais apertado. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-1/4 rounded-md bg-signal/[0.06]"
          />

          {treasuryHorizon.map((station, index) => (
            <div key={station.label} className="relative flex min-w-0 flex-1 flex-col">
              <p
                className={cn(
                  'text-center text-[11px] font-semibold tabular sm:text-[12.5px]',
                  station.tight ? 'text-signal' : 'text-white',
                )}
              >
                {station.value}
              </p>

              <div className="mt-2 flex flex-1 items-end">
                <span
                  className={cn(
                    'w-full origin-bottom animate-grow-up rounded-t-[3px]',
                    station.tight
                      ? 'bg-gradient-to-t from-signal/25 to-signal/70'
                      : 'bg-gradient-to-t from-accent/60 to-glow',
                  )}
                  style={{ height: `${station.share}%`, animationDelay: `${index * 90}ms` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Calha temporal: um único traço contínuo por baixo das estações. */}
        <span aria-hidden="true" className="mt-2.5 block h-px bg-white/[0.12]" />

        <div className="mt-2 flex gap-2 sm:gap-3">
          {treasuryHorizon.map((station) => (
            <div key={station.label} className="min-w-0 flex-1">
              <span
                aria-hidden="true"
                className={cn(
                  'mx-auto -mt-[5px] block h-1.5 w-1.5 rounded-full',
                  station.tight ? 'bg-signal' : 'bg-glow',
                )}
              />
              <p
                className={cn(
                  'mt-1.5 text-center text-[10.5px]',
                  station.tight ? 'text-signal/90' : 'text-mist',
                )}
              >
                {station.label}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
