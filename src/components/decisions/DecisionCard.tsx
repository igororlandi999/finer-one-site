import type { CSSProperties, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { DecisionInsight } from '@/components/decisions/DecisionInsight'
import type { Decision } from '@/data/decisionsSection'
import { cn } from '@/lib/utils'

/** Além do terceiro nível a diferença deixa de se notar — não vale o custo. */
const MAX_DEPTH = 3

/**
 * Casca comum das cinco decisões.
 *
 * Mesmo raio, mesma borda, mesma tipografia, mesma banda de leitura no
 * fundo. O que muda é a composição do meio, que é escolhida pelo conteúdo:
 * KPIs, cenário, série, horizonte ou composição.
 *
 * `depth` é a distância a que o card ficou do topo da pilha. Zero é o card
 * da frente. À medida que sobe, o card afunda ligeiramente e escurece — o
 * suficiente para dar profundidade, sem inclinação, sem 3D e sem parecer um
 * baralho de cartas.
 */
export function DecisionCard({
  decision,
  depth,
  shift,
  stacked,
  children,
}: {
  decision: Decision
  depth: number
  /** Desfasamento vertical do card dentro da pilha, em pixels. */
  shift: number
  stacked: boolean
  children: ReactNode
}) {
  const level = stacked ? Math.min(Math.max(depth, 0), MAX_DEPTH) : 0

  const style = {
    '--stack-scale': 1 - level * 0.016,
    '--stack-shift': `${shift}px`,
  } as CSSProperties

  return (
    <div
      style={style}
      className={cn(
        'group w-full origin-top transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        stacked && 'scale-[var(--stack-scale)] lg:translate-y-[var(--stack-shift)]',
      )}
    >
      <div className="rounded-[26px] bg-gradient-to-b from-white/[0.14] via-white/[0.05] to-transparent p-px shadow-[0_-28px_60px_-30px_rgba(0,0,0,0.9),0_44px_110px_-40px_rgba(0,0,0,0.95)]">
        <div className="relative overflow-hidden rounded-[25px] bg-navy-soft">
          <div className="grid gap-6 p-5 sm:gap-7 sm:p-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-10 lg:p-10">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="font-display text-[12px] font-semibold tabular tracking-[0.22em] text-glow">
                  {decision.ordinal}
                </span>
                <span aria-hidden="true" className="h-px w-10 bg-white/[0.14]" />
              </div>

              <h3 className="mt-4 max-w-[20ch] text-balance font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[26px] lg:text-[30px]">
                {decision.question}
              </h3>

              <p className="mt-3.5 max-w-[46ch] text-[13.5px] leading-relaxed text-mist sm:text-[14px]">
                {decision.context}
              </p>

              {decision.cta ? (
                // Elemento de demonstração: faz parte da interface que o card
                // representa, não é um controlo do site. Por isso é texto e
                // não um botão — não anuncia uma ação que não existe.
                <p className="mt-6 inline-flex items-center gap-2 text-[12.5px] text-glow lg:mt-auto lg:pt-8">
                  {decision.cta}
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                  />
                </p>
              ) : null}
            </div>

            <div className="min-w-0">{children}</div>
          </div>

          <DecisionInsight>{decision.insight}</DecisionInsight>

          {/* Véu de profundidade. Escurece em vez de esbater: os cards são
              opacos e a opacidade deixaria transparecer o de baixo. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[25px] bg-navy-deep transition-opacity duration-500"
            style={{ opacity: level * 0.13 }}
          />
        </div>
      </div>
    </div>
  )
}
