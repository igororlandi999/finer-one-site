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
const STARS = Array.from({ length: 190 }, (_, i) => ({
  x: random(`x${i}`) * 100,
  y: random(`y${i}`) * 60,
  r: 0.6 + random(`r${i}`) * 1.3,
  a: 0.25 + random(`a${i}`) * 0.6,
  phase: random(`p${i}`) * Math.PI * 2,
}))

export function EarthBackground() {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const t = (frame / durationInFrames) * Math.PI * 2 // um ciclo por loop

  const driftX = Math.sin(t) * 22 // px
  const driftY = Math.cos(t) * 6
  const rotate = Math.sin(t) * 0.5 // graus
  const scale = 1.06 + Math.sin(t + 1) * 0.008
  const rim = 0.72 + Math.sin(t * 2) * 0.12
  const dawn = 0.5 + Math.sin(t + 0.6) * 0.18

  return (
    <AbsoluteFill style={{ backgroundColor: '#03060F' }}>

      {/* Estrelas */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#CFE2FF" opacity={s.a * (0.7 + 0.3 * Math.sin(t * 3 + s.phase))} />
        ))}
      </svg>

      {/* Terra no terço inferior */}
      <div
        style={{
          position: 'absolute',
          left: '-14%',
          right: '-14%',
          top: '44%',
          bottom: '-22%',
          transform: `translate(${driftX}px, ${driftY}px) rotate(${rotate}deg) scale(${scale})`,
          transformOrigin: '50% 100%',
        }}
      >
        <Img
          src={staticFile('images/earth-europe-sharp.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%', }}
        />
        {/* Desvanece a parte superior da fotografia no espaço (sem aresta visível) */}
        <div style={{ position: 'absolute', inset: '-2px', background: 'linear-gradient(to bottom, #03060F 0%, #03060F 5%, rgba(3,6,15,0.82) 11%, rgba(3,6,15,0.3) 21%, transparent 33%)' }} />
      </div>

      {/* Orla atmosférica azul (respira lentamente) */}
      <div
        style={{
          position: 'absolute',
          left: '-10%',
          right: '-10%',
          top: '47%',
          height: '28%',
          background: 'radial-gradient(60% 38% at 52% 30%, rgba(30,144,255,0.42), rgba(0,82,255,0.14) 45%, transparent 70%)',
          opacity: rim,
          filter: 'blur(18px)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Nascer de luz no ponto mais alto do horizonte — discreto, desperta curiosidade */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '34%',
          height: '16%',
          transform: 'translate(-15%, 0)',
          background: 'radial-gradient(closest-side, rgba(200,228,255,0.55), rgba(30,144,255,0.18) 55%, transparent)',
          opacity: dawn,
          filter: 'blur(14px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Vinheta navy */}
      <AbsoluteFill style={{ background: 'radial-gradient(120% 90% at 50% 40%, transparent 58%, rgba(3,6,15,0.8) 100%)' }} />
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
          <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="0 -0.45 0 -0.45 2.8 -0.45 0 -0.45 0" />
        </filter>
      </svg>
      <Img src={staticFile('images/earth-europe.jpg')} style={{ width: '100%', height: '100%', filter: 'url(#sharpen) saturate(1.12) contrast(1.1) brightness(1.08)' }} />
    </AbsoluteFill>
  )
}
