import { useSolutionSectionData } from '@/data/solutionSection'
import type { InterpretationTone, SolutionStepId } from '@/data/solutionSection'
import { cn } from '@/lib/utils'

/**
 * Microinformação abaixo da descrição de cada etapa.
 *
 * Cada etapa tem uma forma diferente — lista, sinais, fluxo — para a coluna
 * não se ler como quatro blocos iguais. Nada aqui é um card: são elementos
 * tipográficos com réguas e pontos.
 */
const dotTone: Record<InterpretationTone, string> = {
  neutral: 'bg-white/40',
  forecast: 'bg-glow',
  risk: 'bg-signal',
}

const textTone: Record<InterpretationTone, string> = {
  neutral: 'text-mist',
  forecast: 'text-white',
  risk: 'text-white',
}

/** Entrada escalonada, partilhada por todas as variantes. */
function enter(active: boolean, index: number) {
  return {
    className: cn(
      'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
      active ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
    ),
    style: { transitionDelay: `${140 + index * 90}ms` },
  }
}

export function StepSignals({ id, active }: { id: SolutionStepId; active: boolean }) {
  const { stepSignals } = useSolutionSectionData()
  const signal = stepSignals[id]

  if (signal.kind === 'tags') {
    return (
      <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
        {signal.items.map((item, index) => (
          <li
            key={item}
            className={cn('flex items-center gap-2', enter(active, index).className)}
            style={enter(active, index).style}
          >
            <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-glow/70" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-mist">{item}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (signal.kind === 'flow') {
    return (
      <div className="mt-7 flex max-w-[480px] flex-wrap items-center gap-x-3 gap-y-2">
        {signal.items.map((item, index) => (
          <div key={item} className="flex items-center gap-3">
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  'h-px w-6 origin-left bg-gradient-to-r from-white/20 to-glow/70 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  active ? 'scale-x-100' : 'scale-x-0',
                )}
                style={{ transitionDelay: `${140 + index * 160}ms` }}
              />
            )}
            <span
              className={cn('shrink-0 text-[12px] text-white', enter(active, index).className)}
              style={enter(active, index).style}
            >
              {item}
            </span>
            {index === signal.items.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  'h-1 w-1 shrink-0 rounded-full bg-glow transition-opacity duration-700',
                  active ? 'opacity-100' : 'opacity-0',
                )}
                style={{ transitionDelay: '620ms' }}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
      {signal.items.map((item, index) => (
        <li
          key={item.text}
          className={cn('flex items-center gap-2', enter(active, index).className)}
          style={enter(active, index).style}
        >
          <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', dotTone[item.tone])} />
          <span className={cn('text-[12px] tabular', textTone[item.tone])}>{item.text}</span>
        </li>
      ))}
    </ul>
  )
}
