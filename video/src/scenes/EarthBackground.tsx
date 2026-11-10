import { AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'

/**
 * Fundo cinematográfico da Hero: a Terra (fotografia oficial da Finer One)
 * no terço inferior, a deslizar muito devagar, com a orla atmosférica azul a
 * respirar, um nascer de luz discreto no horizonte e um campo de estrelas.
 *
 * Nitidez: a fotografia de origem tem 1122 px de largura; aplica-se uma
 * máscara de nitidez suave (convolução) e um pouco mais de contraste para que
 * o horizonte e as luzes das cidades fiquem definidos depois de ampliados.
 *
 * Todo o movimento é periódico (seno de um ciclo completo), por isso o
 * último fotograma encaixa no primeiro e o loop não tem corte.
 */
const STARS = Array.from({ length: 260 }, (_, i) => ({
  x: random(`x${i}`) * 100,
  y: random(`y${i}`) * 58,
  r: 0.5 + Math.pow(random(`r${i}`), 2.2) * 1.8,
  a: 0.22 + random(`a${i}`) * 0.6,
  phase: random(`p${i}`) * Math.PI * 2,
}))
/** Algumas estrelas mais brilhantes, com halo — dão profundidade ao espaço. */
const BRIGHT = Array.from({ length: 9 }, (_, i) => ({
  x: 8 + random(`bx${i}`) * 88,
  y: 4 + random(`by${i}`) * 42,
  phase: random(`bp${i}`) * Math.PI * 2,
}))

/**
 * Enquadramento inspirado no cartaz oficial da Finer One: o planeta inteiro
 * de uma ponta à outra, horizonte a meio do ecrã e a Europa iluminada em
 * baixo, à direita. A fotografia (2244 px, já tratada) é mostrada quase à
 * escala natural — pouca ampliação = máxima nitidez.
 */
const EARTH_W = 1.04 // largura relativa ao ecrã
const EARTH_TOP = 0.4 // topo da fotografia (fração da altura)

export function EarthBackground() {
  const frame = useCurrentFrame()
  const { durationInFrames, width, height } = useVideoConfig()
  const t = (frame / durationInFrames) * Math.PI * 2 // um ciclo por loop

  const driftX = Math.sin(t) * 14 // px
  const driftY = Math.cos(t) * 4
  const rotate = Math.sin(t) * 0.3 // graus
  const scale = 1 + Math.sin(t + 1) * 0.005
  const rim = 0.45 + Math.sin(t * 2) * 0.1
  const dawn = 0.32 + Math.sin(t + 0.6) * 0.1

  const earthW = width * EARTH_W
  const earthH = earthW * (1120 / 2244)
  const earthLeft = (width - earthW) / 2
  const earthTop = height * EARTH_TOP
  // Ponto mais alto do horizonte na fotografia: (1290, 165) em 2244×1120
  const peakX = earthLeft + (1290 / 2244) * earthW
  const peakY = earthTop + (165 / 1120) * earthH

  return (
    <AbsoluteFill style={{ backgroundColor: '#03060F' }}>
      {/* Poeira estelar muito ténue (canto superior direito, como no cartaz) */}
      <AbsoluteFill style={{ background: 'radial-gradient(40% 35% at 82% 18%, rgba(70,110,200,0.10), transparent 70%), radial-gradient(30% 25% at 20% 10%, rgba(60,90,170,0.06), transparent 70%)' }} />

      {/* Estrelas */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#D6E6FF" opacity={s.a * (0.7 + 0.3 * Math.sin(t * 3 + s.phase))} />
        ))}
        {BRIGHT.map((s, i) => (
          <g key={`b${i}`} opacity={0.55 + 0.3 * Math.sin(t * 2 + s.phase)}>
            <circle cx={`${s.x}%`} cy={`${s.y}%`} r={5} fill="#9CC8FF" opacity={0.18} />
            <circle cx={`${s.x}%`} cy={`${s.y}%`} r={1.6} fill="#FFFFFF" />
          </g>
        ))}
      </svg>

      {/* Terra: planeta inteiro na largura, horizonte a meio */}
      <div
        style={{
          position: 'absolute',
          left: earthLeft,
          top: earthTop,
          width: earthW,
          height: earthH,
          transform: `translate(${driftX}px, ${driftY}px) rotate(${rotate}deg) scale(${scale})`,
          transformOrigin: '50% 100%',
        }}
      >
        <Img src={staticFile('images/earth-europe-sharp.jpg')} style={{ width: '100%', height: '100%', display: 'block' }} />
        {/* Desvanece só o céu da fotografia, acima do horizonte */}
        <div style={{ position: 'absolute', inset: '-2px', background: 'linear-gradient(to bottom, #03060F 0%, rgba(3,6,15,0.9) 4%, rgba(3,6,15,0.5) 9%, rgba(3,6,15,0.12) 13.5%, transparent 17%)' }} />
        {/* Esbate as margens laterais e a base para não haver arestas */}
        <div style={{ position: 'absolute', inset: '-2px', background: 'linear-gradient(to right, #03060F 0%, transparent 3%, transparent 97%, #03060F 100%)' }} />
      </div>

      {/* Atmosfera azul no horizonte (respira lentamente) */}
      <div
        style={{
          position: 'absolute',
          left: peakX - width * 0.45,
          top: peakY - height * 0.09,
          width: width * 0.9,
          height: height * 0.2,
          background: 'radial-gradient(closest-side, rgba(30,144,255,0.38), rgba(0,82,255,0.12) 55%, transparent)',
          opacity: rim,
          filter: 'blur(10px)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Nascer de luz no ponto mais alto do horizonte */}
      <div
        style={{
          position: 'absolute',
          left: peakX - width * 0.15,
          top: peakY - height * 0.07,
          width: width * 0.3,
          height: height * 0.14,
          background: 'radial-gradient(closest-side, rgba(210,232,255,0.6), rgba(30,144,255,0.18) 55%, transparent)',
          opacity: dawn,
          filter: 'blur(12px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Vinheta navy discreta (deixa a Europa visível em baixo) */}
      <AbsoluteFill style={{ background: 'radial-gradient(130% 100% at 50% 45%, transparent 62%, rgba(3,6,15,0.7) 100%)' }} />
    </AbsoluteFill>
  )
}


/**
 * Prepara a fotografia de origem uma única vez (fotograma único, 2244×1120):
 * ampliação 2× com máscara de nitidez suave e mais contraste/brilho.
 * Gera public/images/earth-europe-sharp.jpg, usada pelo loop acima — muito
 * mais rápido do que aplicar o filtro a cada fotograma.
 */
export function EarthSharpSource() {
  return (
    <AbsoluteFill style={{ backgroundColor: '#03060F' }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="sharpen" colorInterpolationFilters="sRGB">
          {/* Clareza: contraste local de raio largo (realça nuvens, relevo e atmosfera) */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="soft" />
          <feComposite in="SourceGraphic" in2="soft" operator="arithmetic" k1="0" k2="1.5" k3="-0.5" k4="0" result="clear" />
          {/* Nitidez fina */}
          <feConvolveMatrix in="clear" order="3" preserveAlpha="true" kernelMatrix="0 -0.5 0 -0.5 3 -0.5 0 -0.5 0" />
        </filter>
      </svg>
      <Img src={staticFile('images/earth-europe.jpg')} style={{ width: '100%', height: '100%', filter: 'url(#sharpen) saturate(1.15) contrast(1.12) brightness(1.1)' }} />
    </AbsoluteFill>
  )
}
