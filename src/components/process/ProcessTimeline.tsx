import { useEffect, useRef, useState } from 'react'
import { ProcessOutcome } from '@/components/process/ProcessOutcome'
import { ProcessStep } from '@/components/process/ProcessStep'
import { processSteps } from '@/data/processSection'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/** Etapas mais o nó de resultado. */
const NODE_COUNT = processSteps.length + 1

/**
 * Cascata do processo.
 *
 * A progressão vem do scroll normal da página — não há sticky, não há
 * runway em vh, não há listener de scroll e o scroll do utilizador nunca é
 * intercetado. Um IntersectionObserver com uma faixa estreita ao centro da
 * viewport diz qual o nó que está a ser lido; tudo o que está acima acende, o
 * que está abaixo permanece em repouso. Como a faixa é fina, o observer
 * dispara poucas vezes e nada é calculado por frame.
 *
 * A etapa ativa é a de índice mais alto dentro da faixa, o que faz o estado
 * acompanhar corretamente tanto a descer como a subir.
 *
 * TODO o conteúdo existe sempre no DOM e é sempre legível. O estado só muda
 * contraste, opacidade e o traço da calha: se o observer nunca disparar, a
 * secção lê-se na mesma, apenas sem a progressão.
 */
export function ProcessTimeline() {
  const prefersReduced = usePrefersReducedMotion()
  const nodes = useRef<(HTMLLIElement | null)[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    // Com movimento reduzido a composição fica completa e estática: todos os
    // nós acesos, calha inteira desenhada, sem nada dependente de scroll.
    if (prefersReduced) {
      setActive(NODE_COUNT - 1)
      return
    }

    const inBand = new Set<number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.stepIndex)
          if (entry.isIntersecting) inBand.add(index)
          else inBand.delete(index)
        }

        // Fora da faixa entre dois nós não há nada a intersetar; mantém-se o
        // último estado em vez de recuar para zero.
        if (inBand.size > 0) setActive(Math.max(...inBand))
      },
      { rootMargin: '-45% 0px -40% 0px', threshold: 0 },
    )

    for (const node of nodes.current) if (node) observer.observe(node)
    return () => observer.disconnect()
  }, [prefersReduced])

  const register = (index: number) => (element: HTMLLIElement | null) => {
    nodes.current[index] = element
  }

  return (
    <ol className="mx-auto mt-14 max-w-[1060px] space-y-10 sm:mt-16 lg:space-y-12">
      {processSteps.map((step, index) => (
        <ProcessStep
          key={step.number}
          step={step}
          index={index}
          last={false}
          reached={index <= active}
          current={index === active}
          filled={index < active}
          nodeRef={register(index)}
        />
      ))}

      <ProcessOutcome
        reached={active >= processSteps.length}
        nodeRef={register(processSteps.length)}
      />
    </ol>
  )
}
