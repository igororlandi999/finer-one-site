import { useEffect, useState } from 'react'

/** true enquanto a media query corresponder. Começa em false (primeiro render). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(query).matches))

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const onChange = () => setMatches(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return matches
}
