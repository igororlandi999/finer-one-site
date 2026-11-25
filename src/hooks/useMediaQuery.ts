import { useCallback, useSyncExternalStore } from 'react'

/**
 * true enquanto a media query corresponder.
 *
 * No HTML pré-renderizado (build) e na hidratação vale false; logo a seguir passa ao valor
 * real do navegador. Assim o React reaproveita o HTML gerado no build sem diferenças.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}

/**
 * Como useMediaQuery, mas devolve null no HTML pré-renderizado e na hidratação ("ainda não se
 * sabe"). Serve aos componentes que mudam de forma consoante o ecrã: com null usam classes
 * responsivas, para o CSS acertar a forma logo na primeira pintura, sem deslocar a página
 * quando o React monta.
 */
export function useMediaQueryState(query: string): boolean | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore<boolean | null>(subscribe, () => window.matchMedia(query).matches, () => null)
}
