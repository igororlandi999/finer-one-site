import { FieldLabel, Figure, Rule, Surface } from '@/components/features/primitives'
import { performanceAside, performanceMetrics, performanceSeries } from '@/data/featuresSection'
import { cn } from '@/lib/utils'

/** 01 — Performance Financeira. Métricas do período e evolução comparada. */
export function PerformanceVisual() {
  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
        {performanceMetrics.map((metric) => (
          <Surface key={metric.label} className="p-2.5">
            {/* Duas linhas permitidas, com altura reservada: "Resultado
                operacional" não cabe numa linha a 360px e não pode ser
                cortado. min-h mantém as quatro células alinhadas. */}
            <FieldLabel className="min-h-[26px] leading-[1.3]">{metric.label}</FieldLabel>
            <Figure size="sm" className="mt-1.5">
              {metric.value}
            </Figure>
            {metric.delta ? (
              <p className="mt-1 text-[10px] tabular text-glow">{metric.delta}</p>
            ) : (
              <p className="mt-1 text-[10px] text-mist">do período</p>
            )}
          </Surface>
        ))}
      </div>

      <Surface className="mt-2.5 flex min-h-0 flex-1 flex-col p-3 sm:p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-semibold text-white">Evolução financeira</p>
          <div className="flex items-center gap-3 text-[10px] text-mist">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-2 rounded-[2px] bg-glow" />
              Receitas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-2 rounded-[2px] bg-white/25" />
              Despesas
            </span>
          </div>
        </div>

        <div className="mt-4 flex min-h-[132px] flex-1 gap-2 sm:gap-4">
          {performanceSeries.map((point, index) => (
            <div key={point.month} className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-1 items-end justify-center gap-1 sm:gap-1.5">
                <span
                  className="w-2.5 origin-bottom animate-grow-up rounded-t-[2px] bg-gradient-to-t from-accent to-glow sm:w-3.5"
                  style={{ height: `${point.receitas}%`, animationDelay: `${index * 70}ms` }}
                />
                <span
                  className="w-2.5 origin-bottom animate-grow-up rounded-t-[2px] bg-white/[0.18] sm:w-3.5"
                  style={{ height: `${point.despesas}%`, animationDelay: `${70 + index * 70}ms` }}
                />
              </div>
              <Rule className="mt-2" />
              <p className="mt-1.5 text-center text-[10px] text-mist">{point.month}</p>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  )
}

/** Visual secundário: leitura da margem. */
export function PerformanceAside() {
  return (
    <>
      <FieldLabel>{performanceAside.label}</FieldLabel>
      <Figure size="lg" className="mt-1.5">
        {performanceAside.value}
      </Figure>
      <p className="mt-1 text-[11px] text-glow">{performanceAside.note}</p>

      <div className="mt-3 flex h-9 items-end gap-1">
        {performanceAside.spark.map((value, index) => (
          <span
            key={index}
            className={cn(
              'flex-1 origin-bottom animate-grow-up rounded-[2px]',
              index === performanceAside.spark.length - 1 ? 'bg-glow' : 'bg-white/[0.16]',
            )}
            style={{ height: `${value}%`, animationDelay: `${index * 60}ms` }}
          />
        ))}
      </div>
    </>
  )
}
