import { useCountUp } from '@/hooks/useCountUp'
import { formatEuro } from '@/lib/format'
import { demoForecast } from '@/data/demoDashboard'

export function ForecastCard() {
  const animated = useCountUp(demoForecast.value, 1300, 500)

  return (
    <article className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mist">
          {demoForecast.label}
        </p>
        <span className="rounded-full border border-accent/[0.35] bg-accent/[0.12] px-2 py-0.5 text-[10px] font-medium text-glow">
          Previsão
        </span>
      </div>
      <p className="mt-2 text-xl font-semibold tabular leading-none text-white">
        {formatEuro(Math.round(animated))}
      </p>
      <p className="mt-1.5 text-[11px] text-mist">{demoForecast.caption}</p>
    </article>
  )
}
