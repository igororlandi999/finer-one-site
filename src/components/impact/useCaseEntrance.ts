import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Entrada dos microvisuais do caso ativo.
 *
 * Os visuais montam no estado inicial (barras a zero, traço por desenhar) e
 * transitam para o estado final assim que a secção entra na viewport. Duas
 * razões para não usar apenas @keyframes com `both`:
 *
 * 1. o painel monta com a página, muito antes de ser visto — uma animação de
 *    keyframes já teria terminado quando o utilizador lá chega;
 * 2. o painel é remontado por `key` a cada troca de caso, e uma transição
 *    disparada por estado reinicia sozinha, sem truques de reflow.
 *
 * O duplo requestAnimationFrame garante que o estado inicial chega a ser
 * pintado antes da transição arrancar; com um só frame o browser pode
 * agregar as duas mudanças de estilo e não haver transição nenhuma.
 *
 * Com prefers-reduced-motion os atrasos passam a zero. As durações já são
 * neutralizadas globalmente em index.css, mas o atraso não é — sem isto o
 * conteúdo ficaria invisível durante o stagger antes de aparecer de golpe.
 */
export function useCaseEntrance(enabled: boolean) {
  const prefersReduced = usePrefersReducedMotion()
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!enabled) return

    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setEntered(true))
    })

    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [enabled])

  /** Atraso escalonado, em milissegundos. */
  const stagger = (index: number, step = 90) => (prefersReduced ? 0 : index * step)

  return { entered, stagger, prefersReduced }
}
