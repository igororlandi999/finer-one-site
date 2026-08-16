import { BentoCard } from '@/components/problem/BentoCard'
import { useProblemSectionData } from '@/data/problemSection'
import { useInView } from '@/hooks/useInView'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const copy = {
  pt: {
    title: 'Descobrir tarde custa dinheiro',
    description: 'Problemas de margem, tesouraria e cobranças começam antes de se tornarem urgentes.',
    marginLabel: 'Margem operacional',
    problemStarts: 'problema começa',
    discovered: 'descoberto aqui',
  },
  en: {
    title: 'Finding out late costs money',
    description: 'Margin, cash and collections problems start before they become urgent.',
    marginLabel: 'Operating margin',
    problemStarts: 'problem begins',
    discovered: 'discovered here',
  },
}

// Geometria em percentagem: o SVG escala com o card sem distorcer o traço
// (vector-effect="non-scaling-stroke") e as etiquetas ficam em HTML, sempre
// com o tamanho de letra correto em qualquer largura.
function columnXFor(count: number) {
  return (index: number) => ((index + 0.5) / count) * 100
}

const toPath = (segment: { x: number; y: number }[]) =>
  segment.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ')

export function LateDecisionCard({ className }: { className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.35 })
  const { lang } = useLanguage()
  const t = copy[lang]
  const { marginTimeline, discoveryIndex, problemStartIndex } = useProblemSectionData()

  const columnX = columnXFor(marginTimeline.length)
  const values = marginTimeline.map((point) => point.value)
  const top = Math.max(...values) + 1
  const bottom = Math.min(...values) - 2
  const columnY = (value: number) => ((top - value) / (top - bottom)) * 100

  const points = marginTimeline.map((point, index) => ({ x: columnX(index), y: columnY(point.value) }))

  // Dois segmentos sem sobreposição: saudável até ao início do problema, em risco a partir daí.
  const healthyPath = toPath(points.slice(0, problemStartIndex + 1))
  const riskPath = toPath(points.slice(problemStartIndex))

  return (
    <BentoCard className={className} delay={40} repeat title={t.title} description={t.description}>
      <div ref={ref}>
        <p className="text-[10px] font-medium uppercase tracking-wider text-glow">{t.marginLabel}</p>

        {/* Meses e valores */}
        <div className="mt-2.5 grid grid-cols-4">
          {marginTimeline.map((point, index) => (
            <div key={point.month} className="text-center">
              <p className="text-[10px] text-mist">{point.month}</p>
              <p
                className={cn(
                  'text-[15px] font-semibold tabular leading-tight',
                  index === discoveryIndex ? 'text-signal' : 'text-white',
                )}
              >
                {point.label}
              </p>
            </div>
          ))}
        </div>

        {/* Curva */}
        <div className="relative mt-3 h-[128px]">
          {/* Janela entre o início do problema e a sua descoberta */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 bg-gradient-to-r from-signal/[0.02] to-signal/[0.09]"
            style={{
              left: `${columnX(problemStartIndex)}%`,
              width: `${columnX(discoveryIndex) - columnX(problemStartIndex)}%`,
              maskImage: 'linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)',
            }}
          />

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <path
              d={healthyPath}
              fill="none"
              stroke="#1E90FF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray={640}
              className={inView ? 'animate-draw-screen' : undefined}
              style={inView ? undefined : { strokeDashoffset: 640 }}
            />
            <path
              d={riskPath}
              fill="none"
              stroke="#F0B429"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray={640}
              className={inView ? 'animate-draw-screen [animation-delay:380ms]' : undefined}
              style={inView ? undefined : { strokeDashoffset: 640 }}
            />
            <line
              x1={columnX(discoveryIndex)}
              x2={columnX(discoveryIndex)}
              y1={0}
              y2={100}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={1}
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Marca do início do problema */}
          <span
            aria-hidden="true"
            className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-signal bg-navy"
            style={{
              left: `${columnX(problemStartIndex)}%`,
              top: `${columnY(marginTimeline[problemStartIndex].value)}%`,
            }}
          />
        </div>

        {/* Legendas do momento */}
        <div className="relative mt-2 h-4">
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap text-[10px] text-glow"
            style={{ left: `${columnX(problemStartIndex)}%` }}
          >
            {t.problemStarts}
          </span>
          <span className="absolute right-0 whitespace-nowrap text-[10px] text-mist">{t.discovered}</span>
        </div>
      </div>
    </BentoCard>
  )
}
