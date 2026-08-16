import { systemIcons } from '@/components/problem/sourceIcons'
import { useSolutionSectionData } from '@/data/solutionSection'
import type { InterpretationTone } from '@/data/solutionSection'
import { cn } from '@/lib/utils'

/**
 * 02 — Interpretamos.
 *
 * Cinco linhas de interpretação financeira: ícone, label, leitura e valor.
 * Mesma linguagem tipográfica e as mesmas réguas subtis (border-white/[0.06])
 * já usadas no painel de Antecipamos — a leitura é de lista, não de cartões
 * independentes.
 */
const iconTone: Record<InterpretationTone, string> = {
  neutral: 'border-white/[0.14] text-mist',
  forecast: 'border-accent/[0.4] text-glow',
  risk: 'border-signal/[0.4] text-signal',
}

const valueTone: Record<InterpretationTone, string> = {
  neutral: 'text-white',
  forecast: 'text-glow',
  risk: 'text-signal',
}

export function OrganizeVisual({ active }: { active: boolean }) {
  const { marginInsights } = useSolutionSectionData()

  return (
    <ul className="w-full space-y-px">
      {marginInsights.map((row, index) => {
        const Icon = systemIcons[row.icon]

        return (
          <li
            key={row.text}
            className={cn(
              'flex items-center gap-3 border-b border-white/[0.06] py-3 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] last:border-b-0',
              active ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: `${index * 110}ms` }}
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-navy',
                iconTone[row.tone],
              )}
            >
              <Icon size={18} aria-hidden="true" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase tracking-[0.16em] text-mist">
                {row.label}
              </span>
              <span className="mt-0.5 block truncate text-[13px] leading-snug text-white">
                {row.text}
              </span>
            </span>

            <span
              className={cn(
                'shrink-0 text-[13px] font-semibold tabular sm:text-[14px]',
                valueTone[row.tone],
              )}
            >
              {row.value}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
