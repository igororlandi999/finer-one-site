import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/** Anima um número até ao valor final. Devolve o valor final imediatamente
 *  quando o utilizador prefere menos movimento. */
export function useCountUp(target: number, duration = 1100, delay = 0): number {
  const prefersReduced = usePrefersReducedMotion()
  const [value, setValue] = useState(prefersReduced ? target : 0)

  useEffect(() => {
    if (prefersReduced) {
      setValue(target)
      return
    }

    let frame = 0
    let start: number | null = null

    const step = (timestamp: number) => {
      if (start === null) start = timestamp
      const elapsed = timestamp - start - delay

      if (elapsed < 0) {
        frame = requestAnimationFrame(step)
        return
      }

      const progress = Math.min(elapsed / duration, 1)
      setValue(target * easeOut(progress))

      if (progress < 1) {
        frame = requestAnimationFrame(step)
      }
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, delay, prefersReduced])

  return value
}
