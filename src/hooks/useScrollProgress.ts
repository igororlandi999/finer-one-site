import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

type Options = {
  /**
   * 'enter': 0 quando o topo do elemento toca o fundo da viewport,
   *          1 quando chega a `endAt` (fração da viewport a partir do topo).
   * 'through': 0 quando o topo do elemento chega ao topo da viewport,
   *            1 quando o fundo do elemento chega ao fundo — ideal para
   *            secções altas com conteúdo sticky.
   * 'cross': 0 quando o topo do elemento toca o fundo da viewport,
   *          1 quando o fundo do elemento sai pelo topo — para parallax.
   */
  mode?: 'enter' | 'through' | 'cross'
  endAt?: number
  /** Chamado a cada frame com o progresso (0–1). Não provoca renders por si. */
  onProgress?: (progress: number) => void
  /** Em movimento reduzido, fixa o progresso neste valor (por omissão 1).
   *  Passar null para continuar a seguir o scroll (ex.: escolher a etapa
   *  ativa sem animar). */
  reducedValue?: number | null
}

/**
 * Escreve o progresso de scroll (0–1) na variável CSS `--p` do elemento.
 *
 * Nada de estado React por frame: o valor vive só no CSS, por isso o
 * movimento não provoca re-renders. É simétrico — o mesmo valor para a mesma
 * posição, quer se chegue a ela a descer ou a subir.
 */
export function useScrollProgress<T extends HTMLElement>({ mode = 'enter', endAt = 0.3, onProgress, reducedValue = 1 }: Options = {}) {
  const ref = useRef<T>(null)
  const callback = useRef(onProgress)
  callback.current = onProgress

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const reduced = prefersReducedMotion()
    if (reduced && reducedValue !== null) {
      element.style.setProperty('--p', String(reducedValue))
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
      } else if (mode === 'cross') {
        progress = (vh - rect.top) / (vh + rect.height)
      } else {
        progress = (vh - rect.top) / (vh - vh * endAt)
      }

      const clamped = Math.min(1, Math.max(0, progress))
      if (!(reduced && reducedValue !== null)) element.style.setProperty('--p', clamped.toFixed(4))
      callback.current?.(clamped)
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
  }, [mode, endAt, reducedValue])

  return ref
}
