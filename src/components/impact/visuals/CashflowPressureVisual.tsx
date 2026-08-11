import { useId, useMemo } from 'react'
import { useCaseEntrance } from '@/components/impact/useCaseEntrance'
import { useElementSize } from '@/hooks/useElementSize'
import type { CashPoint } from '@/data/impactSection'
import { formatEuro } from '@/lib/format'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Cúbica com tangentes horizontais: suave e sem ultrapassar os pontos. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0].x},${points[0].y}`

  let path = `M${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1]
    const current = points[i]
    const offset = (current.x - previous.x) * 0.42
    path += ` C${previous.x + offset},${previous.y} ${current.x - offset},${current.y} ${current.x},${current.y}`
  }
  return path
}

type Props = {
  points: CashPoint[]
  threshold: number
  thresholdLabel: string
  zone: string
  visible: boolean
}

/**
 * Caso 02 — trajetória da folga de tesouraria.
 *
 * O traço é integralmente tracejado porque TODOS os pontos à frente de "Hoje"
 * são projeção. Desenhar parte da linha a cheio sugeriria histórico realizado
 * que estes dados não têm. Só o ponto "Hoje" é preenchido; os restantes são
 * ocos, que é a convenção habitual para valor estimado.
 *
 * O limiar de atenção é uma referência demonstrativa e está rotulado como
 * tal — não é um critério do produto.
 *
 * Geometria em pixéis reais (useElementSize) e não em unidades de viewBox
 * escaladas: com viewBox escalado, o texto do gráfico ficaria minúsculo em
 * telemóvel e enorme em monitor grande. O SVG é posicionado em absolute
 * dentro de um contentor com altura definida, para não participar no cálculo
 * de largura mínima da grelha.
 *
 * Animação: uma máscara varre da esquerda para a direita e revela linha,
 * área e pontos pela ordem temporal. Os rótulos aparecem por fade, à medida
 * que a varredura os alcança — texto cortado a meio pela máscara pareceria
 * defeito.
 */
export function CashflowPressureVisual({
  points,
  threshold,
  thresholdLabel,
  zone,
  visible,
}: Props) {
  const { ref, size } = useElementSize<HTMLDivElement>()
  const { entered, stagger, prefersReduced } = useCaseEntrance(visible)

  // useId devolve identificadores com ':' e há browsers que não os aceitam
  // dentro de url(#...). Removidos os dois pontos, continua único.
  const uid = useId().replace(/:/g, '')
  const clipId = `${uid}-clip`
  const areaId = `${uid}-area`

  const width = size.width
  const height = size.height
  const compact = width > 0 && width < 420

  const geometry = useMemo(() => {
    if (width <= 0 || height <= 0) return null

    const padding = { top: 30, right: 10, bottom: 28, left: 10 }
    const plotWidth = Math.max(width - padding.left - padding.right, 1)
    const plotHeight = Math.max(height - padding.top - padding.bottom, 1)

    const values = [...points.map((point) => point.amount), threshold]
    const low = Math.min(...values)
    const high = Math.max(...values)
    const span = high - low || 1
    const min = low - span * 0.3
    const max = high + span * 0.12

    const toY = (amount: number) =>
      padding.top + plotHeight * (1 - (amount - min) / (max - min))
    const toX = (index: number) => padding.left + (plotWidth * index) / (points.length - 1)

    const placed = points.map((point, index) => ({
      ...point,
      index,
      x: toX(index),
      y: toY(point.amount),
    }))

    const line = smoothPath(placed)
    const baseline = padding.top + plotHeight

    return {
      padding,
      baseline,
      placed,
      line,
      area: `${line} L${placed[placed.length - 1].x},${baseline} L${placed[0].x},${baseline} Z`,
      thresholdY: toY(threshold),
      warningX: placed.find((point) => point.warning)?.x ?? null,
    }
  }, [width, height, points, threshold])

  const firstWarning = points.findIndex((point) => point.warning)

  return (
    <div>
      <div ref={ref} className="relative h-[192px] w-full sm:h-[220px]">
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          role="img"
          aria-label={`Folga de tesouraria projetada: ${points
            .map((point) => `${point.label}, ${formatEuro(point.amount)}`)
            .join('; ')}.`}
        >
          {geometry ? (
            <>
              <defs>
                <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0052FF" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="#0052FF" stopOpacity="0" />
                </linearGradient>

                <clipPath id={clipId}>
                  <rect
                    x="0"
                    y="0"
                    width={width}
                    height={height}
                    style={{
                      transform: entered ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: '0 0',
                      transition: `transform 1100ms ${EASE}`,
                    }}
                  />
                </clipPath>
              </defs>

              {/* Zona de atenção: a partir do primeiro ponto abaixo do limiar. */}
              {geometry.warningX !== null ? (
                <rect
                  x={geometry.warningX}
                  y={geometry.padding.top - 14}
                  width={Math.max(width - geometry.warningX - geometry.padding.right, 0)}
                  height={geometry.baseline - geometry.padding.top + 14}
                  fill="#F0B429"
                  opacity="0.055"
                />
              ) : null}

              {/* Limiar de atenção — referência demonstrativa. */}
              <line
                x1={geometry.padding.left}
                y1={geometry.thresholdY}
                x2={width - geometry.padding.right}
                y2={geometry.thresholdY}
                stroke="#F0B429"
                strokeOpacity="0.45"
                strokeWidth="1"
                strokeDasharray="3 5"
              />

              <g clipPath={`url(#${clipId})`}>
                <path d={geometry.area} fill={`url(#${areaId})`} />
                <path
                  d={geometry.line}
                  fill="none"
                  stroke="#1E90FF"
                  strokeWidth="2"
                  strokeDasharray="6 5"
                  strokeLinecap="round"
                />

                {geometry.placed.map((point) => (
                  <circle
                    key={point.label}
                    cx={point.x}
                    cy={point.y}
                    r={point.index === 0 ? 5 : 4}
                    fill={point.index === 0 ? '#1E90FF' : '#050A20'}
                    stroke={point.warning ? '#F0B429' : '#1E90FF'}
                    strokeWidth="2"
                  />
                ))}
              </g>

              <text
                x={geometry.padding.left}
                y={geometry.thresholdY - 7}
                fill="#A6A6A6"
                fontSize="10"
                opacity={entered ? 0.85 : 0}
                style={{ transition: `opacity 500ms ease ${stagger(4, 160)}ms` }}
              >
                {thresholdLabel}
              </text>

              {geometry.placed.map((point) => {
                const anchor =
                  point.index === 0 ? 'start' : point.index === points.length - 1 ? 'end' : 'middle'

                return (
                  <g
                    key={point.label}
                    opacity={entered ? 1 : 0}
                    style={{ transition: `opacity 420ms ease ${stagger(point.index, 200)}ms` }}
                  >
                    <text
                      x={point.x}
                      y={point.y - 14}
                      textAnchor={anchor}
                      fill={point.warning ? '#F0B429' : '#FFFFFF'}
                      fontSize={compact ? 11 : 12.5}
                      fontWeight="600"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatEuro(point.amount)}
                    </text>
                    <text
                      x={point.x}
                      y={height - 8}
                      textAnchor={anchor}
                      fill="#A6A6A6"
                      fontSize={compact ? 10.5 : 11}
                    >
                      {point.label}
                    </text>
                  </g>
                )
              })}
            </>
          ) : null}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="inline-flex items-center gap-2 text-[11px] text-mist">
          <span aria-hidden="true" className="h-px w-5 border-t-2 border-dashed border-glow" />
          Projeção a partir de hoje
        </span>

        {firstWarning > -1 ? (
          <span
            className="inline-flex items-center gap-2 rounded-full border border-signal/[0.3] bg-signal/[0.1] px-2.5 py-1 text-[11px] text-signal"
            style={{
              opacity: entered || prefersReduced ? 1 : 0,
              transition: `opacity 420ms ease ${stagger(5, 160)}ms`,
            }}
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" />
            {zone}
          </span>
        ) : null}
      </div>
    </div>
  )
}
