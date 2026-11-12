import { useRef } from 'react'
import type { ReactNode } from 'react'
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from 'remotion'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import { FinerAdvisorView } from '@/components/v2/finer-ui/FinerAdvisorView'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { useAnchors } from '../lib/anchors'
import { NAVY } from '../lib/constants'
import { Pulse } from '../parts/Comet'
import { Highlight } from '../parts/Highlight'

/**
 * Vídeo da hero para TELEMÓVEL (4:5, 1080×1350) — a mesma história da V4, mas com a
 * interface no seu formato de telemóvel (360 px de largura), em vez de um ecrã de
 * computador encolhido. Na janela da hero (~330 px) o texto fica com ~12–14 px.
 * Câmara: deslocação vertical suave (como quem faz scroll) e pequenos zooms.
 */
export const M_W = 1080
export const M_H = 1350
const CW = 360 // largura da interface (px de telemóvel)
const CH = 1900 // altura útil da página recriada
const K = M_W / CW

const QUESTION = 'Como está a tesouraria da minha empresa?'
const ANSWER = 'Há € 50.948,60 em faturas em atraso e um cliente concentra 88,3% deste valor.'
const WORDS = ANSWER.split(' ')
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const camEase = Easing.bezier(0.45, 0, 0.2, 1)
const maskEase = Easing.bezier(0.55, 0, 0.25, 1)
const SKY = <Img src={staticFile('images/finer-mundo.webp')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%' }} />

const T = {
  tapAsk: 26,
  type: 30,
  send: 82,
  answer: [86, 112],
  reveal: [104, 142],
  priority: 150,
  tapCta: 174,
  open: [178, 206],
  shows: [200, 226],
  recs: [220, 240],
  climax: [244, 256],
  close: [282, 300],
}

const KEY_FRAMES = (() => {
  const out: number[] = []
  let f = 0
  for (let i = 0; i < QUESTION.length; i++) {
    f += 0.75 + random(`m${i}`) * 0.9 + (QUESTION[i] === ' ' ? 0.6 : 0)
    out.push(f)
  }
  const scale = (T.send - 6 - T.type) / f
  return out.map((v) => v * scale)
})()

type Shot = { f: number; z: number; y: number }

function camAt(frame: number, shots: Shot[]) {
  if (frame <= shots[0].f) return shots[0]
  for (let i = 0; i < shots.length - 1; i++) {
    const a = shots[i]
    const b = shots[i + 1]
    if (frame >= a.f && frame <= b.f) {
      const t = interpolate(frame, [a.f, b.f], [0, 1], { easing: camEase })
      return { f: frame, z: a.z + (b.z - a.z) * t, y: a.y + (b.y - a.y) * t }
    }
  }
  return shots[shots.length - 1]
}

/** Centra o ponto y (px da interface) no ecrã, com zoom z; nunca mostra fora da página. */
function camParams({ z, y }: { z: number; y: number }) {
  const s = K * z
  const tx = (M_W - CW * s) / 2
  const ty = Math.min(0, Math.max(M_H - CH * s, M_H / 2 - y * s))
  return { s, tx, ty }
}
const camTransform = (c: { z: number; y: number }) => {
  const { s, tx, ty } = camParams(c)
  return `translate(${tx}px, ${ty}px) scale(${s})`
}
const toStage = (c: { z: number; y: number }, px: number, py: number) => {
  const { s, tx, ty } = camParams(c)
  return { x: tx + px * s, y: ty + py * s }
}

export function HeroMobile() {
  const frame = useCurrentFrame()
  const homeRoot = useRef<HTMLDivElement>(null)
  const advRoot = useRef<HTMLDivElement>(null)
  const loopRoot = useRef<HTMLDivElement>(null)
  const h = useAnchors(homeRoot)
  const a = useAnchors(advRoot)

  const ask = h['ask-input']
  const send = h['ask-send']
  const pri = h['priority']
  const cta = h['priority-cta']
  const shows = a['adv-shows']
  const rec0 = a['adv-rec-0']

  const typedQ = KEY_FRAMES.filter((k) => frame - T.type >= k).length
  const words = Math.round(interpolate(frame, T.answer, [0, WORDS.length], clamp))
  const typedA = words === 0 ? 0 : WORDS.slice(0, words).join(' ').length
  const reveal = interpolate(frame, T.reveal, [0, 3.1], clamp)

  const askY = ask ? ask.cy : 260
  const priY = pri ? pri.cy + 10 : 900
  const opening: Shot = { f: 0, z: 1.0, y: askY - 70 }
  const homeShots: Shot[] = [
    opening,
    { f: T.send, z: 1.1, y: askY + 10 }, // aproxima durante a escrita
    { f: T.answer[1], z: 1.08, y: askY + 150 }, // a resposta por baixo da pergunta
    { f: T.reveal[1], z: 1.0, y: priY - 190 }, // o resumo
    { f: T.priority + 4, z: 1.12, y: priY }, // a prioridade e a ação
    { f: T.open[1], z: 1.18, y: priY },
  ]
  const homeCam = camAt(frame, homeShots)

  const showsY = shows ? shows.cy : 500
  const recY = rec0 ? rec0.cy - 40 : 900
  const advShots: Shot[] = [
    { f: T.open[0], z: 1.1, y: showsY },
    { f: T.shows[1], z: 1.1, y: showsY },
    { f: T.climax[0], z: 1.14, y: recY },
    { f: T.close[1], z: 1.2, y: recY },
  ]
  const advCam = camAt(frame, advShots)

  // Destaque da prioridade: entra e sai suavemente; desenhado no próprio bloco da interface.
  const priFocus = interpolate(frame, [T.priority, T.priority + 10, T.open[1] + 2, T.open[1] + 10], [0, 1, 1, 0], clamp)

  const depth = interpolate(frame, T.open, [0, 1], { ...clamp, easing: maskEase })
  const maxR = Math.hypot(M_W, M_H)
  const openPoint = cta ? toStage(camAt(T.tapCta, homeShots), cta.cx, cta.cy) : { x: M_W * 0.7, y: M_H * 0.6 }
  const radius = interpolate(frame, T.open, [0, maxR], { ...clamp, easing: maskEase })
  const recStage = rec0 ? toStage(advCam, rec0.cx, rec0.cy) : { x: M_W / 2, y: M_H / 2 }
  const closeR = interpolate(frame, T.close, [0, maxR], { ...clamp, easing: maskEase })

  const advDemo = {
    shows: interpolate(frame, T.shows, [0, 4], clamp),
    recs: interpolate(frame, T.recs, [0, 4], clamp),
    focus: interpolate(frame, T.climax, [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }),
  }

  const layer = (cam: { z: number; y: number }, children: ReactNode) => (
    <div style={{ position: 'absolute', left: 0, top: 0, width: CW, height: CH, transformOrigin: '0 0', transform: camTransform(cam) }}>{children}</div>
  )
  const canvas = (ref: React.RefObject<HTMLDivElement | null>, children: ReactNode) => (
    <div ref={ref} style={{ position: 'relative', width: CW, height: CH, overflow: 'hidden' }}>
      {children}
    </div>
  )

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <AbsoluteFill style={{ transform: `scale(${1 - depth * 0.035})`, transformOrigin: `${openPoint.x}px ${openPoint.y}px` }}>
        {layer(
          homeCam,
          canvas(
            homeRoot,
            <>
              <AppShell view="home" className="min-h-[1900px]" sky={SKY}>
                <FinerHomeView interactive={false} script={{ question: QUESTION, typedQ, answer: ANSWER, typedA, reveal, focus: priFocus }} />
              </AppShell>
              {ask && <Pulse frame={frame} at={T.tapAsk} x={ask.x + 40} y={ask.cy} size={34} />}
              {send && <Pulse frame={frame} at={T.send} x={send.cx} y={send.cy} size={34} />}
              {cta && <Pulse frame={frame} at={T.tapCta} x={cta.cx} y={cta.cy} size={44} />}
            </>,
          ),
        )}
        <AbsoluteFill style={{ backgroundColor: NAVY, opacity: depth * 0.16 }} />
      </AbsoluteFill>

      <AbsoluteFill style={{ clipPath: `circle(${radius}px at ${openPoint.x}px ${openPoint.y}px)` }}>
        <AbsoluteFill style={{ backgroundColor: '#F7F9FE' }} />
        {layer(
          advCam,
          canvas(
            advRoot,
            <>
              <AppShell view="advisor" className="min-h-[1900px]" sky={SKY}>
                <FinerAdvisorView demo={advDemo} />
              </AppShell>
              <Highlight frame={frame} rect={rec0} from={T.climax[0] - 2} to={T.close[1] + 30} pad={4} radius={12} />
            </>,
          ),
        )}
      </AbsoluteFill>

      {frame >= T.close[0] && (
        <AbsoluteFill style={{ clipPath: `circle(${closeR}px at ${recStage.x}px ${recStage.y}px)` }}>
          {layer(
            opening,
            canvas(
              loopRoot,
              <AppShell view="home" className="min-h-[1900px]" sky={SKY}>
                <FinerHomeView interactive={false} script={{ question: QUESTION, typedQ: 0, answer: ANSWER, typedA: 0, reveal: 0 }} />
              </AppShell>,
            ),
          )}
        </AbsoluteFill>
      )}

      <svg width={M_W} height={M_H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {radius > 0 && radius < maxR - 1 && (
          <circle cx={openPoint.x} cy={openPoint.y} r={radius} fill="none" stroke="#1E90FF" strokeWidth={3} opacity={0.85 * (1 - radius / maxR)} style={{ filter: 'drop-shadow(0 0 12px rgba(30,144,255,0.9))' }} />
        )}
        {closeR > 0 && closeR < maxR - 1 && (
          <circle cx={recStage.x} cy={recStage.y} r={closeR} fill="none" stroke="#1E90FF" strokeWidth={3} opacity={0.85 * (1 - closeR / maxR)} style={{ filter: 'drop-shadow(0 0 12px rgba(30,144,255,0.9))' }} />
        )}
      </svg>
    </AbsoluteFill>
  )
}
