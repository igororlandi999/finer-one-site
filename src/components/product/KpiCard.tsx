import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'
import { formatEuro, formatPercent, formatPercentPlain } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Kpi } from '@/data/demoDashboard'

export function KpiCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const animated = useCountUp(kpi.value, 1200, 220 + index * 90)
  const value =
    kpi.unit === 'eur' ? formatEuro(Math.round(animated)) : formatPercentPlain(animated)

  const DeltaIcon = kpi.delta !== undefined && kpi.delta >= 0 ? ArrowUpRight : ArrowDownRight

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 sm:p-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-mist">{kpi.label}</p>

      {/*
        lg:text-base — entre 1024 e 1279px o dashboard mostra a barra lateral
        e passa a três colunas, deixando ~87px por card de KPI. A 18px o valor
        precisava de 95px e transbordava a moldura. Só nessa faixa.
      */}
      <p className="mt-1.5 text-[17px] font-semibold tabular leading-tight text-white sm:text-lg lg:text-base xl:text-lg">
        {value}
      </p>

      {kpi.delta !== undefined ? (
        <p
          className={cn(
            'mt-1 inline-flex items-center gap-1 text-[11px] font-medium tabular',
            kpi.tone === 'bad' ? 'text-signal' : 'text-glow',
          )}
        >
          <DeltaIcon size={12} aria-hidden="true" />
          {formatPercent(kpi.delta)}
        </p>
      ) : kpi.caption ? (
        <p className="mt-1 text-[11px] text-mist">{kpi.caption}</p>
      ) : null}
    </div>
  )
}
