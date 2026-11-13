import { useLayoutEffect, useState } from 'react'
import type { RefObject } from 'react'
import { continueRender, delayRender } from 'remotion'

export type Rect = { x: number; y: number; w: number; h: number; cx: number; cy: number }

/**
 * Mede a posição dos blocos marcados com data-demo na interface (em píxeis da
 * interface, sem efeito da câmara), para o cursor e os destaques saberem onde ir.
 */
export function useAnchors(root: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  const [anchors, setAnchors] = useState<Record<string, Rect>>({})
  const [handle] = useState(() => delayRender('A medir a interface'))

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const measure = () => {
      const out: Record<string, Rect> = {}
      el.querySelectorAll<HTMLElement>('[data-demo]').forEach((node) => {
        let x = 0
        let y = 0
        let cur: HTMLElement | null = node
        while (cur && cur !== el) {
          x += cur.offsetLeft
          y += cur.offsetTop
          cur = cur.offsetParent as HTMLElement | null
        }
        const w = node.offsetWidth
        const h = node.offsetHeight
        out[node.dataset.demo!] = { x, y, w, h, cx: x + w / 2, cy: y + h / 2 }
      })
      setAnchors(out)
      continueRender(handle)
    }
    document.fonts.ready.then(() => requestAnimationFrame(measure))
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return anchors
}
