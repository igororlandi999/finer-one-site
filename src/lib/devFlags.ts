/**
 * Parâmetros de URL para comparar versões antigas das secções (ex.: ?funcionamento=v2).
 * Só funcionam em desenvolvimento (npm run dev); no site publicado ficam sempre vazios,
 * para que nenhum visitante veja variantes antigas.
 */
export const devFlags = new URLSearchParams(import.meta.env.DEV && typeof window !== 'undefined' ? window.location.search : '')
