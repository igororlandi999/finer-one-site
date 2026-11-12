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
export type DemoVideoSource = { src: string; mobile?: string; webm?: string; poster?: string }

// Versão de desenvolvimento: a amostra V4 (12/11/2026) fica visível no hero para avaliação.
// V4 = a mesma história da V3 com planos ~1,6× mais próximos, para o texto se ler na
// janela da hero. Substituir pelo vídeo final aprovado (fora de amostras/) antes de publicar.
const V3: DemoVideoSource = {
  src: '/video/amostras/hero-a-v3.mp4',
  mobile: '/video/amostras/hero-a-v3-720.mp4',
  poster: '/video/amostras/hero-a-v3.jpg',
}
export const DEMO_VIDEO: DemoVideoSource = {
  src: '/video/amostras/hero-a-v4.mp4',
  mobile: '/video/amostras/hero-a-v4-720.mp4',
  poster: '/video/amostras/hero-a-v4.jpg',
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
 * Versões para comparação: ?video=v1 (original), ?video=v2 (Product Film 2.0), ?video=v3.
 * Remover antes de publicar.
 */
export const DEMO_VIDEO_SAMPLES: Record<string, DemoVideoSource> = {
  v1: { src: '/video/amostras/hero-a.mp4', poster: '/video/amostras/hero-a.jpg' },
  v2: { src: '/video/amostras/hero-a-v2.mp4', mobile: '/video/amostras/hero-a-v2-720.mp4', poster: '/video/amostras/hero-a-v2.jpg' },
  v3: V3,
  v4: DEMO_VIDEO,
}

/**
 * Destino do CTA "Experimentar demonstração" da hero: a secção 2,
 * Experiência Finer Home (src/components/v2/HomeExperience.tsx).
 */
export const TRY_DEMO_ANCHOR = '#experimentar-finer'
