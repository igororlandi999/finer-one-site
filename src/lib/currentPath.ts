/**
 * Caminho da página atual ("/explorar/"), igual no build e no navegador.
 *
 * Na pré-renderização (scripts/prerender.mjs) não há window: o caminho da página em geração
 * vem de globalThis.__FO_PRERENDER_PATH__. Como cada HTML é gerado para o seu próprio caminho,
 * o valor coincide com o do navegador e a hidratação não encontra diferenças.
 */
export function currentPath(): string {
  const raw = typeof window === 'undefined' ? ((globalThis as { __FO_PRERENDER_PATH__?: string }).__FO_PRERENDER_PATH__ ?? '/') : window.location.pathname
  return raw.replace(/index\.html$/, '').replace(/\/?$/, '/')
}
