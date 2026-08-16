import type { LucideIcon } from 'lucide-react'
import { InfoTooltip } from '@/components/product/diagnostic/InfoTooltip'
import { useCountUp } from '@/hooks/useCountUp'
import { cn } from '@/lib/utils'

type Tone = 'accent' | 'signal'

const toneClass: Record<Tone, string> = {
  accent: 'bg-accent/[0.14] text-glow',
  signal: 'bg-signal/[0.14] text-signal',
}

/** Quando o valor é numérico, anima-o como os KPIs do Resumo; quando é
 *  texto (ex.: "Moderado"), mostra `value` sem animação. */
type AnimatedValue = { value: number; format: (value: number) => string; delay?: number }

export function DiagnosticMetricCard({
  icon: Icon,
  tone,
  label,
  tooltip,
  value,
  caption,
  animate,
}: {
  icon: LucideIcon
  tone: Tone
  label: string
  tooltip: string
  value: string
  caption: string
  animate?: AnimatedValue
}) {
  const animated = useCountUp(animate?.value ?? 0, 1200, animate?.delay ?? 0)
  const display = animate ? animate.format(animated) : value

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 sm:p-3">
      <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', toneClass[tone])}>
        <Icon size={13} aria-hidden="true" />
      </span>
      <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-mist">
        {label}
        <InfoTooltip text={tooltip} />
      </p>
      <p className="mt-0.5 text-[19px] font-semibold tabular leading-tight text-white sm:text-[20px]">
        {display}
      </p>
      <p className="mt-0.5 text-[10.5px] text-mist">{caption}</p>
    </div>
  )
}
