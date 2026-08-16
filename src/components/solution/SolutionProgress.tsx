import { useSolutionSectionData } from '@/data/solutionSection'
import { cn } from '@/lib/utils'

/**
 * Indicador discreto das quatro etapas. Orienta, não compete: quatro réguas
 * de 1px e os números. É decorativo — o progresso real já está no conteúdo.
 */
export function SolutionProgress({ active }: { active: number }) {
  const { solutionSteps } = useSolutionSectionData()

  return (
    <ol aria-hidden="true" className="mt-8 grid grid-cols-4 gap-3">
      {solutionSteps.map((step, index) => (
        <li key={step.id}>
          <span
            className={cn(
              'block h-px w-full transition-colors duration-500',
              index === active ? 'bg-accent' : 'bg-white/[0.12]',
            )}
          />
          <span
            className={cn(
              'mt-2 block text-[10px] tabular tracking-[0.18em] transition-colors duration-500',
              index === active ? 'text-white' : 'text-mist/50',
            )}
          >
            {step.number}
          </span>
        </li>
      ))}
    </ol>
  )
}
