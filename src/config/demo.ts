/**
 * Demonstração da plataforma na Hero.
 *
 * Quando existir a gravação real da Finer One (Finer Home → Cashflow →
 * Receitas → Finer Advisor), colocar o ficheiro em public/video/ e preencher
 * `src` (e, de preferência, `poster` com uma imagem do primeiro fotograma).
 * Formatos recomendados: MP4 (H.264) até ~8 MB e, opcionalmente, WebM.
 *
 * Enquanto `src` estiver vazio, a Hero mostra a demonstração interativa
 * construída a partir das capturas reais (Finer Home e Finer Advisor), com
 * dados fictícios.
 */
/** portrait: versão vertical (4:5) para telemóvel, com a interface no formato de telemóvel. */
export type DemoVideoSource = { src: string; mobile?: string; webm?: string; poster?: string; portrait?: string; portraitPoster?: string }

// Vídeo definitivo (aprovado a 15/11/2026; antiga amostra V4 de 12/11/2026): a história
// pergunta → diagnóstico → recomendação, com dados fictícios. Três versões: 16:9 (desktop),
// 720p (ecrãs menores) e 4:5 (telemóvel, com a interface em formato de telemóvel).
export const DEMO_VIDEO: DemoVideoSource = {
  src: '/video/hero-demo.mp4',
  mobile: '/video/hero-demo-720.mp4',
  poster: '/video/hero-demo.jpg',
  portrait: '/video/hero-demo-mobile.mp4',
  portraitPoster: '/video/hero-demo-mobile.jpg',
}

/**
 * Fundo cinematográfico da Hero (Terra vista do espaço). Recurso próprio,
 * gerado em video/ (composição HeroEarth) a partir da fotografia oficial da
 * Finer One. Loop de 14 s sem corte.
 * O vídeo só é usado em ecrãs ≥ 768px, sem poupança de dados e sem
 * preferência por movimento reduzido; caso contrário mostra-se o poster.
 */
export const HERO_BACKGROUND = {
  video: '/video/hero-earth.mp4',
  poster: '/images/hero-earth.jpg',
}

/**
 * Destino do CTA "Experimentar demonstração" da hero: a secção 2,
 * Experiência Finer Home (src/components/v2/HomeExperience.tsx).
 */
export const TRY_DEMO_ANCHOR = '#experimentar-finer'
