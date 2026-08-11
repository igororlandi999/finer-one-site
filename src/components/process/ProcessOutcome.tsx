import { processCopy, processSteps } from '@/data/processSection'
import { cn } from '@/lib/utils'

/**
 * Fim da cascata.
 *
 * Não é uma caixa isolada: é o último nó da mesma calha. Recebe a indentação
 * do degrau seguinte ao da etapa 05 e o mesmo disco das etapas, agora
 * preenchido — a linha entra aqui e para. O que muda é o peso tipográfico,
 * que sobe, porque isto é a conclusão e não mais um passo.
 */
export function ProcessOutcome({
  reached,
  nodeRef,
}: {
  reached: boolean
  nodeRef: (element: HTMLLIElement | null) => void
}) {
  return (
    <li
      ref={nodeRef}
      data-step-index={processSteps.length}
      style={{ ['--degrau' as string]: `${processSteps.length * 32}px` }}
      className="relative lg:[margin-left:var(--degrau)]"
    >
      <div className="flex gap-4 lg:gap-6">
        <span
          aria-hidden="true"
          className={cn(
            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors duration-700 motion-reduce:transition-none',
            reached ? 'border-glow/[0.4] bg-accent/[0.18]' : 'border-white/[0.08] bg-navy-soft/60',
          )}
        >
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full transition-colors duration-700 motion-reduce:transition-none',
              reached ? 'bg-glow' : 'bg-mist/40',
            )}
          />
          <span
            className={cn(
              'pointer-events-none absolute -inset-4 -z-10 rounded-2xl bg-[radial-gradient(closest-side,rgba(0,82,255,0.4),transparent_75%)] blur-lg transition-opacity duration-700 motion-reduce:transition-none',
              reached ? 'opacity-100' : 'opacity-0',
            )}
          />
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-[10px] uppercase tracking-[0.22em] transition-colors duration-700 motion-reduce:transition-none',
              reached ? 'text-glow' : 'text-mist/50',
            )}
          >
            {processCopy.outcomeKicker}
          </p>

          <p className="mt-3 max-w-[24ch] text-balance font-display text-[21px] font-semibold leading-[1.24] tracking-[-0.025em] text-white/[0.5] sm:max-w-[30ch] sm:text-[26px] lg:text-[30px]">
            {processCopy.closingFirst}
            <span className="mt-1.5 block text-white">{processCopy.closingSecond}</span>
          </p>
        </div>
      </div>
    </li>
  )
}
