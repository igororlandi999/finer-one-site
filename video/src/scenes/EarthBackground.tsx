import { AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'

/**
 * Fundo cinematográfico da Hero: a Terra (fotografia oficial da Finer One)
 * no terço inferior, a deslizar muito devagar, com a orla atmosférica azul a
 * respirar e um campo de estrelas discreto.
 *
 * Todo o movimento é periódico (seno de um ciclo completo), por isso o
 * último fotograma encaixa no primeiro e o loop não tem corte.
 */
const STARS = Array.from({ length: 170 }, (_, i) => ({
  x: random(`x${i}`) * 100,
  y: random(`y${i}`) * 62,
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
  const rim = 0.55 + Math.sin(t * 2) * 0.12

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
        <Img src={staticFile('images/earth-europe.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%', filter: 'saturate(1.05) contrast(1.05)' }} />
        {/* Desvanece a parte superior da fotografia no espaço */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #03060F 0%, rgba(3,6,15,0.85) 8%, rgba(3,6,15,0.35) 20%, transparent 34%)' }} />
      </div>

      {/* Orla atmosférica azul (respira lentamente) */}
      <div
        style={{
          position: 'absolute',
          left: '-10%',
          right: '-10%',
          top: '46%',
          height: '30%',
          background: 'radial-gradient(60% 40% at 50% 30%, rgba(30,144,255,0.35), rgba(0,82,255,0.12) 45%, transparent 70%)',
          opacity: rim,
          filter: 'blur(20px)',
        }}
      />

      {/* Vinheta navy */}
      <AbsoluteFill style={{ background: 'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(3,6,15,0.85) 100%)' }} />
    </AbsoluteFill>
  )
}
