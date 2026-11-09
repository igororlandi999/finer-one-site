import { useEffect, useRef } from 'react'

type Options = {
  /**
   * 'enter': 0 quando o topo do elemento toca o fundo da viewport,
   *          1 quando chega a `endAt` (fração da viewport a partir do topo).
   * 'through': 0 quando o topo do elemento chega ao topo da viewport,
   *            1 quando o fundo do elemento chega ao fundo — ideal para
   *            secções altas com conteúdo sticky.
   */
  mode?: 'enter' | 'through'
  endAt?: number
}

/**
 * Escreve o progresso de scroll (0–1) na variável CSS `--p` do elemento.
 *
 * Nada de estado React por frame: o valor vive só no CSS, por isso o
 * movimento não provoca re-renders. Um único rAF por frame de scroll.
 * Com prefers-reduced-motion, fixa `--p: 1` (estado final, sem movimento).
 */
export function useScrollProgress<T extends HTMLElement>({ mode = 'enter', endAt = 0.3 }: Options = {}) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.style.setProperty('--p', '1')
      return
    }

    let frame = 0

    const update = () => {
      frame = 0
      const rect = element.getBoundingClientRect()
      const vh = window.innerHeight
      let progress: number

      if (mode === 'through') {
        const distance = rect.height - vh
        progress = distance > 0 ? -rect.top / distance : rect.top <= 0 ? 1 : 0
      } else {
        const start = vh
        const end = vh * endAt
        progress = (start - rect.top) / (start - end)
      }

      element.style.setProperty('--p', Math.min(1, Math.max(0, progress)).toFixed(4))
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [mode, endAt])

  return ref
}
