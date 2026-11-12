import type { RefObject } from 'react'
import { useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'

type Center = { el: RefObject<HTMLElement | null> } | { fx: number; fy: number }

/**
 * Círculo de "luz" (clip-path) que cresce de um ponto até cobrir o ecrã
 * (t: 0 → 1) — vetorial, por isso sempre nítido. O centro é um elemento
 * (o ponto final de um título) ou uma fração do palco (Portugal no mundo).
 */
export function useFloodClip(t: MotionValue<number>, stage: RefObject<HTMLElement | null>, center: Center, startRadius = 6) {
  return useTransform(t, (v) => {
    const box = stage.current?.getBoundingClientRect()
    if (!box) return v > 0.999 ? 'none' : 'circle(0px at 50% 50%)'
    let cx = box.width / 2
    let cy = box.height / 2
    if ('el' in center) {
      const d = center.el.current?.getBoundingClientRect()
      if (d) {
        cx = d.left + d.width / 2 - box.left
        cy = d.top + d.height / 2 - box.top
        startRadius = d.width / 2
      }
    } else {
      cx = box.width * center.fx
      cy = box.height * center.fy
    }
    const far = Math.max(Math.hypot(cx, cy), Math.hypot(box.width - cx, cy), Math.hypot(cx, box.height - cy), Math.hypot(box.width - cx, box.height - cy))
    if (v <= 0) return 'circle(0px at 50% 50%)'
    if (v >= 1) return 'none'
    // Começa devagar (o ponto "acende") e acelera até encher o ecrã.
    const e = v * v * v
    const r = startRadius + (far + 2 - startRadius) * e
    return `circle(${r.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`
  })
}
