import { useMemo, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useElementSize } from '@/hooks/useElementSize'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import { formatEuro, formatEuroShort } from '@/lib/format'
import type { CashflowPoint } from '@/data/demoDashboard'
import { cn } from '@/lib/utils'

const copy = {
  pt: {
    ariaLabel: 'Evolução da tesouraria: dez meses realizados e três meses de previsão. Valores demonstrativos.',
    forecastSuffix: ' · Previsão',
  },
  en: {
    ariaLabel: 'Cash flow trend: ten months actual and three months forecast. Demonstration values.',
    forecastSuffix: ' · Forecast',
  },
}

type Props = {
  data: CashflowPoint[]
  className?: string
}

type Scale = {
  min: number
  max: number
  step: number
  ticks: number[]
}

/** Domínio com valores redondos, para o eixo ter etiquetas legíveis. */
function niceScale(values: number[]): Scale {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const rough = (max - min) / 3
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? magnitude * 10

  const domainMin = Math.floor(min / step) * step
  const domainMax = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let value = domainMin; value <= domainMax + 1; value += step) ticks.push(value)

  return { min: domainMin, max: domainMax, step, ticks }
}

/** Cúbica com tangentes horizontais: suave, sem overshoot acima dos pontos. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0].x},${points[0].y}`

  let path = `M${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1]
    const current = points[i]
    const controlOffset = (current.x - previous.x) * 0.42
    path += ` C${previous.x + controlOffset},${previous.y} ${current.x - controlOffset},${current.y} ${current.x},${current.y}`
  }
  return path
}

export function CashflowChart({ data, className }: Props) {
  const { ref, size } = useElementSize<HTMLDivElement>()
  const prefersReduced = usePrefersReducedMotion()
  const { lang } = useLanguage()
  const t = copy[lang]
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const compact = size.width > 0 && size.width < 440
  const height = compact ? 176 : 208
  const padding = useMemo(
    () => ({ top: 14, right: 10, bottom: 22, left: compact ? 10 : 62 }),
    [compact],
  )

  const geometry = useMemo(() => {
    const width = size.width
    if (width <= 0) return null

    const scale = niceScale(data.map((point) => point.value))
    const plotWidth = Math.max(width - padding.left - padding.right, 1)
    const plotHeight = Math.max(height - padding.top - padding.bottom, 1)

    const x = (index: number) => padding.left + (plotWidth * index) / (data.length - 1)
    const y = (value: number) =>
      padding.top + plotHeight * (1 - (value - scale.min) / (scale.max - scale.min))

    const points = data.map((point, index) => ({ ...point, index, x: x(index), y: y(point.value) }))
    const lastActualIndex = points.reduce(
      (last, point) => (point.forecast ? last : point.index),
      0,
    )

    const actual = points.slice(0, lastActualIndex + 1)
    const forecast = points.slice(lastActualIndex)
    const baseline = padding.top + plotHeight

    return {
      scale,
      points,
      lastActualIndex,
      baseline,
      plotWidth,
      actualPath: smoothPath(actual),
      forecastPath: smoothPath(forecast),
      areaPath: `${smoothPath(actual)} L${actual[actual.length - 1].x},${baseline} L${actual[0].x},${baseline} Z`,
      tickY: (value: number) => y(value),
    }
  }, [data, height, padding, size.width])

  const activePoint = geometry && activeIndex !== null ? geometry.points[activeIndex] : null

  const handlePointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!geometry) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const relativeX = event.clientX - bounds.left
    const ratio = (relativeX - padding.left) / geometry.plotWidth
    const index = Math.round(ratio * (data.length - 1))
    setActiveIndex(Math.min(Math.max(index, 0), data.length - 1))
  }

  return (
    /*
     * O SVG é desenhado em pixéis reais mas fica FORA DO FLUXO (absolute).
     *
     * Em fluxo normal, um SVG com atributo width fixo passa a ser a
     * min-content width do contentor. Num item de grelha ou flex, cujo
     * min-width é auto, a coluna deixa de conseguir encolher abaixo desse
     * valor: ao reduzir a janela, o contentor mantém a largura antiga, o
     * ResizeObserver nunca volta a disparar e o gráfico fica preso na
     * medida anterior, a transbordar do card. Fora do fluxo, o SVG não
     * contribui para a largura mínima e a medição converge sempre.
     */
    <div ref={ref} className={cn('relative w-full', className)} style={{ height }}>
      {size.width > 0 && geometry ? (
        <>
          <svg
            width={size.width}
            height={height}
            role="img"
            aria-label={t.ariaLabel}
            className="absolute inset-0 block touch-none"
            onPointerMove={handlePointer}
            onPointerDown={handlePointer}
            onPointerLeave={() => setActiveIndex(null)}
          >
            <defs>
              <linearGradient id="cashflow-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E90FF" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#1E90FF" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Linhas de referência */}
            {geometry.scale.ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={padding.left}
                  x2={size.width - padding.right}
                  y1={geometry.tickY(tick)}
                  y2={geometry.tickY(tick)}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1}
                />
                {!compact ? (
                  <text
                    x={padding.left - 12}
                    y={geometry.tickY(tick) + 3.5}
                    textAnchor="end"
                    className="fill-mist/70 text-[10px] tabular"
                  >
                    {formatEuroShort(tick)}
                  </text>
                ) : null}
              </g>
            ))}

            {/* Área do realizado */}
            <path d={geometry.areaPath} fill="url(#cashflow-area)" className="animate-fade-in" />

            {/* Fronteira entre realizado e previsão */}
            <line
              x1={geometry.points[geometry.lastActualIndex].x}
              x2={geometry.points[geometry.lastActualIndex].x}
              y1={padding.top - 6}
              y2={geometry.baseline}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={1}
              strokeDasharray="3 4"
            />

            {/* Realizado */}
            <path
              d={geometry.actualPath}
              fill="none"
              stroke="#1E90FF"
              strokeWidth={2}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={prefersReduced ? undefined : 1}
              className={prefersReduced ? undefined : 'animate-draw'}
            />

            {/* Previsão */}
            <path
              d={geometry.forecastPath}
              fill="none"
              stroke="#0052FF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="5 5"
              className="animate-fade-in [animation-delay:900ms]"
            />

            {/* Último valor realizado, sempre visível */}
            <circle
              cx={geometry.points[geometry.lastActualIndex].x}
              cy={geometry.points[geometry.lastActualIndex].y}
              r={3.5}
              fill="#070D2B"
              stroke="#1E90FF"
              strokeWidth={2}
            />

            {/* Estado ativo */}
            {activePoint ? (
              <g>
                <line
                  x1={activePoint.x}
                  x2={activePoint.x}
                  y1={padding.top - 6}
                  y2={geometry.baseline}
                  stroke="rgba(30,144,255,0.45)"
                  strokeWidth={1}
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r={5}
                  fill="#070D2B"
                  stroke={activePoint.forecast ? '#0052FF' : '#1E90FF'}
                  strokeWidth={2}
                />
              </g>
            ) : null}

            {/* Eixo de meses */}
            {geometry.points.map((point, index) => {
              const showLabel = compact ? index % 3 === 0 : index % 2 === 0
              if (!showLabel) return null
              return (
                <text
                  key={`${point.label}-${point.index}`}
                  x={point.x}
                  y={height - 6}
                  textAnchor="middle"
                  className={cn(
                    'text-[10px]',
                    point.forecast ? 'fill-mist/[0.45]' : 'fill-mist/70',
                  )}
                >
                  {point.short}
                </text>
              )
            })}
          </svg>

          {activePoint ? (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-navy-deep/95 px-3 py-2 shadow-xl backdrop-blur-sm"
              style={{
                left: Math.min(Math.max(activePoint.x, 62), size.width - 62),
                top: Math.max(activePoint.y - 12, 6),
              }}
            >
              <p className="text-[10px] uppercase tracking-wider text-mist">
                {activePoint.label}
                {activePoint.forecast ? t.forecastSuffix : ''}
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular text-white">
                {formatEuro(activePoint.value)}
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
