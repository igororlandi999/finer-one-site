import { useEffect, useRef, useState } from 'react'

type Options = {
  /** Fração do elemento visível para disparar. */
  threshold?: number
  /** Antecipa ou atrasa o disparo relativamente à viewport. */
  rootMargin?: string
  /** Falso repete a animação sempre que o elemento volta a entrar na
   *  viewport, em vez de disparar apenas uma vez. */
  once?: boolean
}

/**
 * Deteta a entrada do elemento na viewport.
 *
 * Por omissão (once: true) dispara uma única vez. Além do IntersectionObserver
 * existe, só nesse modo, um ouvinte de scroll de reserva. Num salto de scroll
 * (âncora, restauro de posição, scroll muito rápido) o elemento pode passar
 * de baixo da viewport para cima dela sem nunca chegar a intersectá-la; como
 * o rácio vai de 0 a 0, o observer não dispara e o conteúdo ficaria preso em
 * opacity-0, parecendo estar em falta. O ouvinte revela o elemento assim que
 * ele fica para trás e é removido de seguida.
 *
 * Com once: false o estado acompanha o observer em ambos os sentidos, por
 * isso a animação repete sempre que se volta a rolar até ao elemento — não
 * precisa do ouvinte de reserva porque, se o utilizador voltar a subir, o
 * elemento intersecta normalmente da próxima vez.
 *
 * Se o browser não suportar IntersectionObserver, devolve true de imediato
 * para o conteúdo nunca ficar invisível.
 */
export function useInView<T extends HTMLElement>({
  threshold = 0.2,
  rootMargin = '0px 0px -10% 0px',
  once = true,
}: Options = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    let observer: IntersectionObserver | null = null

    const onScroll = () => {
      const rect = element.getBoundingClientRect()
      // Um elemento em display:none devolve um rect todo a zero, e bottom <= 0
      // marcá-lo-ia como já visto. Exigir uma caixa real antes de revelar.
      const hasBox = rect.width > 0 || rect.height > 0
      if (hasBox && rect.bottom <= 0) reveal()
    }

    const reveal = () => {
      setInView(true)
      if (once) {
        observer?.disconnect()
        window.removeEventListener('scroll', onScroll)
      }
    }

    observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.some((entry) => entry.isIntersecting)
        if (intersecting) reveal()
        else if (!once) setInView(false)
      },
      { threshold, rootMargin },
    )

    observer.observe(element)

    if (once) {
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
    }

    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [threshold, rootMargin, once])

  return { ref, inView }
}
