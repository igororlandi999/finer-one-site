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
// Versão de desenvolvimento: a amostra do Vídeo A fica visível no hero para avaliação.
// Substituir pelo vídeo final aprovado antes de publicar.
export const DEMO_VIDEO: { src: string; webm?: string; poster?: string } = {
  src: '/video/amostras/hero-a.mp4',
  poster: '/video/amostras/hero-a.jpg',
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
 * Amostras para aprovação (não substituem o hero). Só aparecem com
 * ?video=amostra no endereço. Remover antes de publicar.
 */
export const DEMO_VIDEO_SAMPLES: Record<string, { src: string; poster: string }> = {
  amostra: { src: '/video/amostras/hero-a.mp4', poster: '/video/amostras/hero-a.jpg' },
}
