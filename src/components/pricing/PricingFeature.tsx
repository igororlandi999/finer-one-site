import { Check, Minus } from 'lucide-react'
import type { FeatureValue } from '@/data/pricing'
import { cn } from '@/lib/utils'

/**
 * Célula de comparação. O estado nunca depende só da cor: incluído tem
 * ícone de visto, não incluído tem traço, e os níveis diferentes aparecem
 * escritos por extenso.
 */
export function FeatureValueCell({ value, emphasis }: { value: FeatureValue; emphasis?: boolean }) {
  if (typeof value === 'string') {
    return (
      <span className={cn('text-[12px]', emphasis ? 'text-white' : 'text-mist')}>{value}</span>
    )
  }

  if (value) {
    return (
      <>
        <Check
          size={14}
          aria-hidden="true"
          className={cn('mx-auto', emphasis ? 'text-glow' : 'text-white/70')}
        />
        <span className="sr-only">Incluído</span>
      </>
    )
  }

  return (
    <>
      <Minus size={14} aria-hidden="true" className="mx-auto text-white/20" />
      <span className="sr-only">Não incluído</span>
    </>
  )
}

/** Item da lista de capacidades dentro de um card. */
export function PlanFeature({ label, emphasis }: { label: string; emphasis?: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check
        size={13}
        aria-hidden="true"
        className={cn('mt-[3px] shrink-0', emphasis ? 'text-glow' : 'text-white/50')}
      />
      <span className="text-[13.5px] leading-snug text-mist">{label}</span>
    </li>
  )
}
