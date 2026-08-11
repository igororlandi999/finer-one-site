import { useCaseEntrance } from '@/components/impact/useCaseEntrance'
import type { ClientRow } from '@/data/impactSection'
import { formatEuro } from '@/lib/format'
import { cn } from '@/lib/utils'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Acima deste número de dias o atraso é marcado como estado de aviso. */
const ATTENTION_DAYS = 30

type Props = {
  total: number
  rows: ClientRow[]
  othersLabel: string
  visible: boolean
}

/**
 * Caso 03 — concentração dos recebimentos em atraso.
 *
 * A frase "68% em três clientes" é o argumento do caso, por isso tem forma
 * visual própria: o medidor reparte o total em quatro segmentos e um colchete
 * abaixo delimita fisicamente a parcela dos três clientes. A percentagem é
 * calculada a partir dos valores, não escrita à mão — se os dados mudarem, o
 * colchete acompanha.
 *
 * As barras do ranking são relativas ao maior valor em atraso, para separar
 * visualmente os três clientes entre si.
 *
 * `signal` marca apenas os atrasos acima de 30 dias: é um estado de aviso e
 * vem sempre acompanhado do número de dias, que é a informação real.
 */
export function ClientRiskVisual({ total, rows, othersLabel, visible }: Props) {
  const { entered, stagger } = useCaseEntrance(visible)

  const topAmount = rows.reduce((sum, row) => sum + row.amount, 0)
  const topShare = (topAmount / total) * 100
  const max = Math.max(...rows.map((row) => row.amount))
  const others = Math.max(total - topAmount, 0)

  const segments = [
    ...rows.map((row, index) => ({
      key: row.label,
      amount: row.amount,
      className: ['bg-glow', 'bg-accent', 'bg-accent/55'][index] ?? 'bg-accent/55',
    })),
    { key: 'restantes', amount: others, className: 'bg-white/[0.1]' },
  ]

  return (
    <div>
      <div className="flex h-2.5 gap-1 overflow-hidden rounded-full" aria-hidden="true">
        {segments.map((segment, index) => (
          <span
            key={segment.key}
            className={cn('block h-full rounded-full', segment.className)}
            style={{
              flexBasis: `${(segment.amount / total) * 100}%`,
              transform: entered ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'left center',
              transition: `transform 620ms ${EASE} ${stagger(index, 100)}ms`,
            }}
          />
        ))}
      </div>

      {/* Colchete de concentração: delimita a parcela dos três clientes. */}
      <div className="relative mt-2 h-[9px]" aria-hidden="true">
        <span
          className="absolute left-0 top-0 flex h-[9px] items-start"
          style={{
            width: `${topShare}%`,
            opacity: entered ? 1 : 0,
            transition: `opacity 500ms ease ${stagger(4, 100)}ms`,
          }}
        >
          <span className="h-[9px] w-px bg-glow/45" />
          <span className="mt-0 h-px flex-1 bg-glow/35" />
          <span className="h-[9px] w-px bg-glow/45" />
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-[11.5px] text-glow">
          {Math.round(topShare)}% em três clientes
          <span className="tabular ml-2 text-mist">{formatEuro(topAmount)}</span>
        </p>
        <p className="text-[11.5px] text-mist/70">
          {othersLabel} <span className="tabular ml-1">{formatEuro(others)}</span>
        </p>
      </div>

      <ul className="mt-5 space-y-3.5">
        {rows.map((row, index) => {
          const attention = row.days > ATTENTION_DAYS

          return (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-[13px] text-white">{row.label}</span>
                <span className="tabular shrink-0 text-[13px] font-semibold text-white">
                  {formatEuro(row.amount)}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-accent/50 to-glow"
                    style={{
                      width: `${(row.amount / max) * 100}%`,
                      transform: entered ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left center',
                      transition: `transform 700ms ${EASE} ${stagger(index, 100) + 180}ms`,
                    }}
                  />
                </span>
                <span
                  className={cn(
                    'tabular w-[58px] shrink-0 text-right text-[11px]',
                    attention ? 'text-signal' : 'text-mist',
                  )}
                >
                  {row.days} dias
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 text-[11px] leading-relaxed text-mist/70">
        Dias contados desde a data de vencimento de cada documento.
      </p>
    </div>
  )
}
