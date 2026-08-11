import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

type Options = {
  /** Quantos cards existem na pilha. */
  count: number
  /** Desliga a mecânica quando o utilizador pediu menos movimento. */
  enabled: boolean
  /** Maior deslocamento de topo usado pela pilha, em pixels. */
  maxTop: number
}

/**
 * Estado da pilha de decisões.
 *
 * Duas responsabilidades, ambas de custo baixo e nenhuma delas ligada a um
 * listener de scroll:
 *
 * 1. `active` — qual o card que está à frente. Um IntersectionObserver com
 *    uma faixa estreita ao centro da viewport marca os cards presentes; o
 *    índice mais alto é o que está por cima, porque os cards seguintes
 *    aparecem sempre depois no DOM. Quando a pilha sai da viewport o valor
 *    anterior é mantido, para os cards não "desempilharem" a meio da saída.
 *
 * 2. `sticky` — se a pilha cabe mesmo no ecrã. Um card mais alto do que a
 *    viewport, fixado pelo topo, deixa a parte de baixo inalcançável: o
 *    scroll passa a não a revelar. Nesse caso a secção passa a empilhamento
 *    convencional, sem sticky. A medição corre uma vez e a cada
 *    redimensionamento, nunca durante o scroll — e não pode entrar em ciclo
 *    porque a altura dos cards não depende deste estado.
 */
export function useStackedCards({ count, enabled, maxTop }: Options) {
  const items = useRef<(HTMLElement | null)[]>([])
  const [active, setActive] = useState(0)
  const [fits, setFits] = useState(true)

  const setItem = useCallback((element: HTMLElement | null) => {
    if (!element) return
    items.current[Number(element.dataset.stackIndex)] = element
  }, [])

  useLayoutEffect(() => {
    if (!enabled) return

    const measure = () => {
      // A partir de lg a pilha usa caixas de altura fixa com o card centrado
      // lá dentro, por isso nunca há conteúdo preso fora do alcance. A
      // verificação só se aplica ao layout de telemóvel, onde o card é
      // fixado pelo topo e tem a altura do seu próprio conteúdo.
      if (window.innerWidth >= 1024) {
        setFits(true)
        return
      }

      const nodes = items.current.filter(Boolean) as HTMLElement[]
      if (nodes.length === 0) return

      const tallest = Math.max(...nodes.map((node) => node.offsetHeight))
      setFits(tallest + maxTop + 16 <= window.innerHeight)
    }

    measure()

    // ResizeObserver e não window.resize: apanha também as mudanças de
    // altura vindas do carregamento das fontes.
    const observer = new ResizeObserver(measure)
    for (const node of items.current) if (node) observer.observe(node)

    return () => observer.disconnect()
  }, [count, enabled, maxTop])

  useEffect(() => {
    if (!enabled) return

    const nodes = items.current.filter(Boolean) as HTMLElement[]
    if (nodes.length === 0) return

    const present = new Set<number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.stackIndex)
          if (entry.isIntersecting) present.add(index)
          else present.delete(index)
        }

        setActive((previous) => (present.size > 0 ? Math.max(...present) : previous))
      },
      { rootMargin: '-42% 0px -46% 0px' },
    )

    for (const node of nodes) observer.observe(node)

    return () => observer.disconnect()
  }, [count, enabled])

  return { setItem, active, sticky: enabled && fits }
}
