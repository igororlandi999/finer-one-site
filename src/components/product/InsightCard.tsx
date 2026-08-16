import { ArrowRight, TrendingDown } from 'lucide-react'
import { useDemoDashboardData } from '@/data/demoDashboard'

/** Alerta interpretado — o que distingue a Finer One de um dashboard de BI. */
export function InsightCard() {
  const { demoInsight } = useDemoDashboardData()

  return (
    <article className="rounded-xl border border-white/[0.07] border-l-2 border-l-signal/70 bg-white/[0.025] p-3.5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-signal/[0.12] text-signal">
          <TrendingDown size={13} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h4 className="text-[13px] font-semibold leading-snug text-white">{demoInsight.title}</h4>
          <p className="mt-1 text-[12px] leading-relaxed text-mist">{demoInsight.description}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-glow">
            {demoInsight.action}
            <ArrowRight size={12} aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  )
}
