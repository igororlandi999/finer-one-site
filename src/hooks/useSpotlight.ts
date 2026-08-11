import { useCallback, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

/**
 * Iluminação que acompanha o cursor.
 *
 * A posição é escrita diretamente em variáveis CSS do elemento, através da
 * ref. Não há estado React, portanto mover o rato sobre um card não provoca
 * um único render — nem nesse card nem nos irmãos.
 *
 * A opacidade das camadas é tratada em CSS (group-hover / group-focus-within),
 * por isso entrar e sair do card também não passa por React. O efeito é
 * puramente decorativo: nenhuma informação depende dele.
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  const onPointerMove = useCallback((event: ReactPointerEvent<T>) => {
    // Ecrãs tácteis não têm cursor a seguir; ignorar evita trabalho inútil.
    if (event.pointerType === 'touch') return

    const element = ref.current
    if (!element) return

    const bounds = element.getBoundingClientRect()
    element.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`)
    element.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`)
  }, [])

  return { ref, onPointerMove }
}
