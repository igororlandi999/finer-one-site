import { solutionSteps } from '@/data/solutionSection'
import { cn } from '@/lib/utils'

/**
 * Rail de progressão da coluna esquerda.
 *
 * Uma hairline contínua com a porção percorrida acesa e um nó luminoso na
 * fronteira. Não é um stepper: não há caixas, números nem estados clicáveis —
 * é uma marca de direção de arte que acompanha a leitura.
 *
 * Só existe a partir de lg. No telemóvel a progressão já é dada pelo número
 * de fundo e pelo empilhamento natural das etapas.
 */
export function SolutionRail({ active, className }: { active: number; className?: string }) {
  const progress = ((active + 0.5) / solutionSteps.length) * 100

  return (
    <div
      aria-hidden="true"
      className={cn('absolute inset-y-0 left-0 w-px bg-white/[0.06]', className)}
    >
      <div
        className="absolute inset-x-0 top-0 bg-gradient-to-b from-glow/20 via-glow/60 to-accent/70 transition-[height] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ height: `${progress}%` }}
      >
        <span className="absolute -bottom-[3px] -left-[3px] h-[7px] w-[7px] rounded-full bg-glow shadow-[0_0_12px_2px_rgba(30,144,255,0.45)]" />
      </div>
    </div>
  )
}
