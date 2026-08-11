import { useCaseEntrance } from '@/components/impact/useCaseEntrance'
import type { CostRow } from '@/data/impactSection'
import { formatEuro, formatPercentPlain } from '@/lib/format'
import { cn } from '@/lib/utils'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/**
 * Caso 01 — onde estão os custos.
 *
 * Duas leituras sobrepostas e não uma:
 *
 * 1. o medidor de composição no topo responde "como se reparte o total";
 * 2. o ranking abaixo responde "qual é o maior valor isolado".
 *
 * As barras do ranking são relativas ao MAIOR valor, não ao total: com quatro
 * categorias a rondar os 13–34% do total, barras proporcionais ao total
 * ficariam todas curtas e indistinguíveis. A percentagem do total continua
 * escrita ao lado, para o número não depender do comprimento da barra.
 *
 * A cor `signal` marca apenas as categorias assinaladas como sob pressão — é
 * um estado de aviso, não decoração. A etiqueta "sob pressão" acompanha a cor
 * para a distinção não depender de visão cromática.
 *
 * Animação: os segmentos e as barras entram da esquerda em cascata. A leitura
 * pretendida é de acumulação — o peso vai-se somando à medida que as
 * categorias aparecem.
 */
export function CostPressureVisual({ rows, visible }: { rows: CostRow[]; visible: boolean }) {
  const { entered, stagger } = useCaseEntrance(visible)

  const total = rows.reduce((sum, row) => sum + row.amount, 0)
  const max = Math.max(...rows.map((row) => row.amount))

  return (
    <div>
      {/* Composição do total. Segmentos na ordem das categorias. */}
      <div className="flex h-2 gap-1 overflow-hidden rounded-full" aria-hidden="true">
        {rows.map((row, index) => (
          <span
            key={row.label}
            className={cn(
              'block h-full rounded-full',
              row.pressure ? 'bg-signal/75' : 'bg-accent/70',
            )}
            style={{
              flexBasis: `${(row.amount / total) * 100}%`,
              transform: entered ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'left center',
              transition: `transform 620ms ${EASE} ${stagger(index, 80)}ms`,
            }}
          />
        ))}
      </div>

      <ul className="mt-5 space-y-3.5">
        {rows.map((row, index) => {
          const share = (row.amount / total) * 100

          return (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-[13px] text-white">{row.label}</span>
                  {row.pressure ? (
                    <span className="shrink-0 rounded-full border border-signal/[0.35] bg-signal/[0.1] px-1.5 py-px text-[9.5px] uppercase tracking-[0.1em] text-signal">
                      Sob pressão
                    </span>
                  ) : null}
                </span>
                <span className="tabular shrink-0 text-[13px] font-semibold text-white">
                  {formatEuro(row.amount)}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className={cn(
                      'block h-full rounded-full',
                      row.pressure
                        ? 'bg-gradient-to-r from-signal/45 to-signal'
                        : 'bg-gradient-to-r from-accent/50 to-glow',
                    )}
                    style={{
                      width: `${(row.amount / max) * 100}%`,
                      transform: entered ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left center',
                      transition: `transform 700ms ${EASE} ${stagger(index, 90) + 120}ms`,
                    }}
                  />
                </span>
                <span className="tabular w-[46px] shrink-0 text-right text-[11px] text-mist">
                  {formatPercentPlain(share)}
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 text-[11px] leading-relaxed text-mist/70">
        Percentagem calculada sobre o total das categorias analisadas.
      </p>
    </div>
  )
}
