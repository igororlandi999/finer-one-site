/**
 * Revelação dos títulos à maneira da Lovable (12/11/2026, pedido do fundador).
 *
 * Na Lovable, cada título aparece da esquerda para a direita em 1,2 s, com uma
 * margem suave e um desfoque de 1 px que desaparece (a parte final surge por
 * último, levemente). Aqui fazemos o mesmo com uma máscara, para manter as cores
 * da Finer One (azul-marinho + a parte em azul) sem mexer na estrutura dos títulos.
 *
 * - Aplica-se a todos os h1/h2/h3 dentro de <main> e a títulos marcados com data-sweep
 *   (cartões, rodapé), quando entram no ecrã (uma vez). Fora: imagens da plataforma.
 * - Um título pode ficar de fora com o atributo data-no-sweep.
 * - Com movimento reduzido não há animação (ver index.css).
 */
const SELECTOR = 'main h1, main h2, main h3, [data-sweep]'

export function initTitleSweep() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
  const reduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduce'
  if (reduced) return

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const el = e.target as HTMLElement
        el.classList.add('fo-title-in')
        io.unobserve(el)
        // No fim, tira a máscara (não corta letras com perna) — com rede de segurança.
        const done = () => el.classList.add('fo-title-done')
        el.addEventListener('animationend', (ev) => { if (ev.animationName === 'fo-title-sweep') done() })
        window.setTimeout(done, 1700)
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  )

  const seen = new WeakSet<Element>()
  const scan = () => {
    for (const el of document.querySelectorAll(SELECTOR)) {
      if (seen.has(el)) continue
      seen.add(el)
      if (el.closest('[data-no-sweep], [aria-hidden="true"], [data-demo], [role="img"]')) continue
      // Títulos já visíveis ao carregar também animam (como na Lovable).
      el.classList.add('fo-title')
      io.observe(el)
    }
  }

  scan()
  // As secções carregam aos poucos (React); procura títulos novos.
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true })
}
