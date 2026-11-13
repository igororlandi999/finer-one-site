/**
 * Movimento reduzido: respeita a preferência do sistema operativo e, para
 * pré-visualização/testes, o parâmetro ?motion=reduce no URL (aplicado em
 * main.tsx como <html data-motion="reduce">).
 */
export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return document.documentElement.dataset.motion === 'reduce' || window.matchMedia(REDUCED_QUERY).matches
}
