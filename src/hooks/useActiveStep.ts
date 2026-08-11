import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Determina qual das etapas está "ativa" durante o scroll.
 *
 * Usa um único IntersectionObserver com uma faixa estreita ao centro da
 * viewport (rootMargin -45%/-45%), em vez de ouvintes de scroll: o browser
 * faz o cálculo fora da main thread e não há medições de DOM por frame.
 *
 * Quando nenhuma etapa cruza a faixa — entre etapas, ou em scroll muito
 * rápido — mantém-se a última ativa, para o painel nunca ficar em branco.
 */
export function useActiveStep(count: number) {
  const elements = useRef<(HTMLElement | null)[]>([])
  const [active, setActive] = useState(0)

  const register = useCallback(
    (index: number) => (element: HTMLElement | null) => {
      elements.current[index] = element
    },
    [],
  )

  useEffect(() => {
    const observed = elements.current.filter((element): element is HTMLElement => Boolean(element))
    if (observed.length === 0 || typeof IntersectionObserver === 'undefined') return

    const crossing = new Set<number>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number((entry.target as HTMLElement).dataset.step)
          if (Number.isNaN(index)) return
          if (entry.isIntersecting) crossing.add(index)
          else crossing.delete(index)
        })

        if (crossing.size > 0) setActive(Math.min(...crossing))
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    observed.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [count])

  return { register, active }
}
