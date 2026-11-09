import { useEffect, useState } from 'react'
import { prefersReducedMotion, REDUCED_QUERY } from '@/lib/motion'

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(prefersReducedMotion)

  useEffect(() => {
    const media = window.matchMedia(REDUCED_QUERY)
    setPrefersReduced(prefersReducedMotion())

    const onChange = () => setPrefersReduced(prefersReducedMotion())
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return prefersReduced
}
