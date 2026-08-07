import { DataLabel, Panel } from '@/components/decisions/primitives'
import { marginFactors, marginSeries } from '@/data/decisionsSection'
import { cn } from '@/lib/utils'

/** Centros das quatro colunas, em percentagem da largura do traçado. */
const X = marginSeries.map((_, index) => 12.5 + index * 25)

/**
 * 03 — Margem. Trajetória descendente com os fatores por baixo.
 *
 * O traçado é um SVG esticado por cima das colunas com
 * preserveAspectRatio="none": os pontos são posicionados em percentagem, o
 * que dispensa qualquer medição em JavaScript. `non-scaling-stroke` impede
 * que a distorção do viewBox engorde a linha.
 */
export function MarginDecision() {
  const points = marginSeries.map((point, index) => `${X[index]},${100 - point.share}`).join(' ')

  return (
    <div className="flex h-full flex-col gap-3">
      <Panel className="p-3 sm:p-4">
        <div className="flex items-baseline justify-between gap-3">
          <DataLabel>Margem operacional</DataLabel>
          <span className="shrink-0 text-[10.5px] tabular text-mist">Jan — Jul</span>
        </div>

        <div className="mt-3">
          <div className="flex">
            {marginSeries.map((point, index) => (
              <p
                key={point.month}
                className={cn(
                  'flex-1 text-center text-[12.5px] font-semibold tabular sm:text-[13.5px]',
                  index === marginSeries.length - 1 ? 'text-signal' : 'text-white',
                )}
              >
                {point.value}
              </p>
            ))}
          </div>

          <div className="relative mt-2.5 h-[92px] sm:h-[104px]">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              <polyline
                points={points}
                fill="none"
                stroke="url(#margem-traco)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                strokeDasharray="640"
                className="animate-draw-screen"
              />
              <defs>
                <linearGradient id="margem-traco" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1E90FF" />
                  <stop offset="100%" stopColor="#F0B429" />
                </linearGradient>
              </defs>
            </svg>

            {marginSeries.map((point, index) => {
              const last = index === marginSeries.length - 1

              return (
                <span
                  key={point.month}
                  aria-hidden="true"
                  className={cn(
                    'absolute h-2 w-2 -translate-x-1/2 translate-y-1/2 animate-fade-in rounded-full ring-4',
                    last ? 'bg-signal ring-signal/[0.14]' : 'bg-glow ring-glow/[0.12]',
                  )}
                  style={{
                    left: `${X[index]}%`,
                    bottom: `${point.share}%`,
                    animationDelay: `${300 + index * 110}ms`,
                  }}
                />
              )
            })}
          </div>

          <span aria-hidden="true" className="mt-2 block h-px bg-white/[0.07]" />

          <div className="mt-2 flex">
            {marginSeries.map((point) => (
              <p key={point.month} className="flex-1 text-center text-[10.5px] text-mist">
                {point.month}
              </p>
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="p-3 sm:p-4">
        <DataLabel>Fatores no período</DataLabel>

        <ul className="mt-3 space-y-2.5">
          {marginFactors.map((factor, index) => (
            <li key={factor.label} className="flex items-center gap-3">
              <span className="w-[112px] shrink-0 text-[11.5px] text-mist sm:w-[128px]">
                {factor.label}
              </span>
              <span
                aria-hidden="true"
                className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.07]"
              >
                <span
                  className={cn(
                    'block h-full origin-left animate-grow-right rounded-full',
                    factor.adverse ? 'bg-signal/70' : 'bg-white/[0.22]',
                  )}
                  style={{ width: `${factor.share}%`, animationDelay: `${index * 110}ms` }}
                />
              </span>
              <span
                className={cn(
                  'w-[42px] shrink-0 text-right text-[12px] font-semibold tabular',
                  factor.adverse ? 'text-signal' : 'text-mist',
                )}
              >
                {factor.value}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
