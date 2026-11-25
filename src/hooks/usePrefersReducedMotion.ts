import { useSyncExternalStore } from 'react'
import { prefersReducedMotion, REDUCED_QUERY } from '@/lib/motion'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(REDUCED_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

/** Movimento reduzido. No HTML pré-renderizado e na hidratação vale false; depois, o valor real. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false)
}
