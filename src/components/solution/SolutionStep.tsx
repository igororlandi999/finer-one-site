import { SolutionVisual } from '@/components/solution/SolutionVisual'
import { StepSignals } from '@/components/solution/StepSignals'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'
import type { SolutionStep as Step } from '@/data/solutionSection'

type Props = {
  step: Step
  index: number
  active: boolean
  registerRef: (element: HTMLElement | null) => void
}

/**
 * Uma etapa da narrativa.
 *
 * Composição da coluna: número em grande escala como camada de fundo, linha
 * de etiqueta, headline, descrição, camada de sinal e — no desktop — uma
 * hairline que sai do texto em direção ao painel do produto.
 *
 * No desktop o visual vive no painel fixo ao lado. Abaixo de lg desce para
 * dentro da própria etapa, animado pela sua entrada na viewport, para cada
 * bloco ficar completo sem depender do painel.
 */
export function SolutionStep({ step, index, active, registerRef }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 })

  // No desktop `inView` nunca dispara (o contentor do visual está em
  // display:none), por isso `lit` resolve para `active`. No telemóvel os dois
  // contribuem e a etapa acende um pouco antes de chegar ao centro do ecrã.
  const lit = active || inView

  return (
    <article
      ref={registerRef}
      data-step={index}
      className="relative border-t border-white/[0.06] py-12 first:border-t-0 first:pt-0 lg:flex lg:min-h-[70vh] lg:flex-col lg:justify-center lg:border-t-0 lg:py-0"
    >
      <div className="relative">
        {/* Número em grande escala — massa visual atrás da headline, nunca leitura */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -left-2 -top-8 select-none font-display text-[92px] font-semibold leading-none tracking-[-0.06em] text-glow/[0.05] transition-opacity duration-700 sm:-top-10 sm:text-[128px] lg:-left-3 lg:-top-14 lg:text-[188px] xl:-top-16 xl:text-[212px]',
            lit ? 'opacity-100' : 'opacity-0',
          )}
        >
          {step.number}
        </span>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              'font-display text-[13px] font-semibold tabular tracking-[0.1em] transition-colors duration-500',
              active ? 'text-glow' : 'text-mist/60',
            )}
          >
            {step.number}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              'h-px w-6 transition-colors duration-500',
              active ? 'bg-glow/60' : 'bg-white/[0.12]',
            )}
          />
          <span className="text-[11px] uppercase tracking-[0.22em] text-mist">{step.label}</span>
        </div>

        <h3 className="mt-5 max-w-[22ch] font-display text-[24px] font-semibold leading-[1.15] tracking-[-0.025em] text-white sm:text-[28px] lg:text-[32px]">
          {step.headline}
        </h3>

        <p className="mt-4 max-w-[46ch] text-[14.5px] leading-relaxed text-mist">{step.text}</p>

        <StepSignals id={step.id} active={lit} />

        {/* Hairline que conduz o olhar para o painel do produto */}
        <div aria-hidden="true" className="mt-10 hidden items-center gap-2 lg:flex">
          <span
            className={cn(
              'h-px flex-1 origin-left bg-gradient-to-r from-transparent via-accent/25 to-glow/60 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transition-delay:320ms]',
              active ? 'scale-x-100' : 'scale-x-0',
            )}
          />
          <span
            className={cn(
              'h-1 w-1 rounded-full bg-glow transition-opacity duration-700 [transition-delay:900ms]',
              active ? 'opacity-100' : 'opacity-0',
            )}
          />
        </div>

        {/* Visual em fluxo — apenas abaixo de lg */}
        <div ref={ref} className="mt-8 max-w-xl lg:hidden">
          <SolutionVisual id={step.id} active={inView} />
        </div>
      </div>
    </article>
  )
}
