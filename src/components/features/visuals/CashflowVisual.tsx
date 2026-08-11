import { FieldLabel, Figure, Rule, Surface } from '@/components/features/primitives'
import { cashflowAside, cashflowColumns, cashflowMetrics } from '@/data/featuresSection'
import { cn } from '@/lib/utils'

/**
 * 02 — Planeamento & Cashflow. Colunas de saldo por mês: realizado a cheio,
 * previsão a tracejado. Deliberadamente colunas e não uma linha, para não
 * repetir o gráfico da Hero nem sugerir um gráfico de bolsa.
 */
export function CashflowVisual() {
  return (
    <div className="flex h-full flex-col">
      {/* Três colunas a 360px deixavam ~70px úteis por célula e obrigavam a
          cortar "Previsão 30 dias". Em telemóvel o saldo atual ocupa a
          largura toda e as duas previsões ficam lado a lado; a partir de sm
          volta a ser a fila de três. */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
        {cashflowMetrics.map((metric, index) => (
          <Surface
            key={metric.label}
            className={cn('p-2.5', index === 0 && 'col-span-2 sm:col-span-1')}
          >
            <FieldLabel
              className={cn('min-h-[26px] leading-[1.3]', index === 0 && 'max-sm:min-h-0')}
            >
              {metric.label}
            </FieldLabel>
            <Figure size="sm" className={cn('mt-1.5', index > 0 && 'text-glow')}>
              {metric.value}
            </Figure>
          </Surface>
        ))}
      </div>

      <Surface className="relative mt-2.5 flex min-h-0 flex-1 flex-col p-3 sm:p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-semibold text-white">Evolução da tesouraria</p>
          <div className="flex items-center gap-3 text-[10px] text-mist">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-2 rounded-[2px] bg-glow" />
              Realizado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-[2px] border border-dashed border-glow/70"
              />
              Previsão
            </span>
          </div>
        </div>

        <div className="relative mt-4 flex min-h-[132px] flex-1 gap-1.5 sm:gap-2.5">
          {/* Limite de segurança */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-[38%] border-t border-dashed border-white/[0.14]"
          />

          {cashflowColumns.map((column, index) => (
            <div key={column.month} className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-1 items-end">
                <span
                  className={cn(
                    'w-full origin-bottom animate-grow-up rounded-t-[3px]',
                    column.forecast
                      ? 'border border-dashed border-glow/60 bg-glow/[0.08]'
                      : 'bg-gradient-to-t from-accent/70 to-glow',
                  )}
                  style={{ height: `${column.height}%`, animationDelay: `${index * 60}ms` }}
                />
              </div>
              <Rule className="mt-2" />
              <p
                className={cn(
                  'mt-1.5 text-center text-[10px]',
                  column.forecast ? 'text-mist/60' : 'text-mist',
                )}
              >
                {column.month}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-2 text-[10px] text-mist/70">{cashflowAside.floor}</p>
      </Surface>
    </div>
  )
}

/** Visual secundário: folga estimada do cenário base. */
export function CashflowAside() {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>{cashflowAside.label}</FieldLabel>
        <span className="rounded-full border border-accent/[0.35] px-2 py-0.5 text-[10px] leading-none text-glow">
          Previsão
        </span>
      </div>
      <Figure size="lg" className="mt-1.5">
        {cashflowAside.value}
      </Figure>
      <p className="mt-1 text-[11px] text-mist">{cashflowAside.note}</p>

      <div className="mt-3">
        <span aria-hidden="true" className="block h-1.5 rounded-full bg-white/[0.08]">
          <span className="block h-full w-[62%] origin-left animate-grow-right rounded-full bg-gradient-to-r from-accent to-glow" />
        </span>
        <p className="mt-2 text-[10px] text-mist/70">62% acima do limite de segurança</p>
      </div>
    </>
  )
}
