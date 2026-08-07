import { responsibilityChain } from '@/data/trustSection'
import { cn } from '@/lib/utils'

/**
 * Cadeia da informação até à decisão — o pilar da responsabilidade.
 *
 * O último elo tem peso visual diferente de propósito: é o único que não
 * pertence à plataforma. A linguagem é afirmativa, não defensiva — a
 * inteligência apoia, a decisão permanece humana.
 */
export function ResponsibilityFlow({ lit }: { lit: boolean }) {
  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
      {responsibilityChain.map((step, index) => (
        <li key={step.label} className="flex min-w-0 flex-1 items-stretch">
          <div
            className={cn(
              'min-w-0 flex-1 rounded-lg border px-3 py-2.5 transition-colors duration-500',
              step.human
                ? cn(
                    'border-accent/[0.45] bg-accent/[0.1]',
                    lit && 'border-accent/[0.7] bg-accent/[0.16]',
                  )
                : 'border-white/[0.07] bg-white/[0.02]',
            )}
          >
            <p
              className={cn(
                'text-[12px] font-medium leading-snug',
                step.human ? 'text-white' : 'text-mist',
              )}
            >
              {step.label}
            </p>
            <p className="mt-1 text-[10.5px] leading-snug text-mist/70">{step.note}</p>
          </div>

          {index < responsibilityChain.length - 1 ? (
            <span aria-hidden="true" className="hidden w-3 shrink-0 items-center sm:flex">
              <span className="block h-px w-full bg-white/[0.16]" />
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
