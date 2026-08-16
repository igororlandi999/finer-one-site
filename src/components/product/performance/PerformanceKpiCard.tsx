import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { InfoTooltip } from '@/components/product/diagnostic/InfoTooltip'
import { useCountUp } from '@/hooks/useCountUp'
import { cn } from '@/lib/utils'

export function PerformanceKpiCard({
  icon: Icon,
  label,
  tooltip,
  value,
  format,
  delay = 0,
  deltaLabel,
  deltaGood,
  caption,
}: {
  icon: LucideIcon
  label: string
  tooltip: string
  value: number
  format: (value: number) => string
  delay?: number
  deltaLabel: string
  deltaGood: boolean
  caption?: string
}) {
  const animated = useCountUp(value, 1200, delay)
  const DeltaIcon = deltaGood ? ArrowUpRight : ArrowDownRight

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-1.5 sm:p-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/[0.14] text-glow">
        <Icon size={11} aria-hidden="true" />
      </span>
      <p className="mt-1 inline-flex items-center gap-1 text-[9px] font-medium uppercase tracking-wider text-mist">
        {label}
        <InfoTooltip text={tooltip} />
      </p>
      <p className="mt-0.5 text-[16px] font-semibold tabular leading-tight text-white sm:text-[17px]">
        {format(animated)}
      </p>
      <p className="mt-0.5 inline-flex flex-wrap items-center gap-1 text-[9.5px] tabular">
        <span
          className={cn('inline-flex items-center gap-0.5 font-medium', deltaGood ? 'text-glow' : 'text-signal')}
        >
          <DeltaIcon size={9} aria-hidden="true" />
          {deltaLabel}
        </span>
        {caption ? <span className="text-mist">· {caption}</span> : null}
      </p>
    </div>
  )
}
