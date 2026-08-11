import { interpretations } from '@/data/solutionSection'
import type { InterpretationTone } from '@/data/solutionSection'
import { cn } from '@/lib/utils'

/**
 * 03 — Interpretar.
 *
 * Cada linha é literalmente NÚMERO → SIGNIFICADO: o valor à esquerda, uma
 * régua a atravessar, a leitura à direita. O tom é maioritariamente neutro;
 * `signal` aparece só onde existe risco real e a previsão usa Glow Blue,
 * para o painel não se ler como um painel de alarmes.
 */
const figureTone: Record<InterpretationTone, string> = {
  neutral: 'text-white',
  forecast: 'text-glow',
  risk: 'text-signal',
}

const ruleTone: Record<InterpretationTone, string> = {
  neutral: 'bg-white/15',
  forecast: 'bg-glow/45',
  risk: 'bg-signal/45',
}

export function InterpretVisual({ active }: { active: boolean }) {
  return (
    <ul className="w-full space-y-px">
      {interpretations.map((item, index) => (
        <li
          key={item.meaning}
          className={cn(
            'flex items-center gap-3 border-b border-white/[0.06] py-3 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-4',
            active ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          )}
          style={{ transitionDelay: `${index * 110}ms` }}
        >
          <span
            className={cn(
              'w-[88px] shrink-0 text-right text-[14px] font-semibold tabular leading-none sm:w-[96px] sm:text-[16px] xl:text-[17px]',
              figureTone[item.tone],
            )}
          >
            {item.figure}
          </span>

          <span
            aria-hidden="true"
            className={cn(
              'h-px w-5 shrink-0 origin-left transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-7',
              ruleTone[item.tone],
              active ? 'scale-x-100' : 'scale-x-0',
            )}
            style={{ transitionDelay: `${140 + index * 110}ms` }}
          />

          <span className="min-w-0">
            <span className="block text-[10px] uppercase tracking-[0.16em] text-mist">
              {item.kind}
            </span>
            <span className="mt-0.5 block text-[13px] leading-snug text-white">{item.meaning}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
