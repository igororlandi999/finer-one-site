import { useRef } from 'react'
import type { ReactNode } from 'react'
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import { FinerAdvisorView } from '@/components/v2/finer-ui/FinerAdvisorView'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { useAnchors } from '../lib/anchors'
import { cameraAt, cameraTransform, toStage, WIDE } from '../lib/camera'
import type { Shot } from '../lib/camera'
import { CANVAS_H, CANVAS_W, HEIGHT, NAVY, WIDTH } from '../lib/constants'
import { Beam, beamX } from '../parts/Beam'
import { Cursor } from '../parts/Cursor'
import { Highlight } from '../parts/Highlight'

const QUESTION = 'Como está a tesouraria da minha empresa?'
const ANSWER =
  'A tesouraria está estável, mas há € 18.640 em faturas em atraso que podem pressioná-la nas próximas semanas. Cobrá-las é a prioridade.'
const WORDS = ANSWER.split(' ')

const SKEW = Math.tan((14 * Math.PI) / 180) * (HEIGHT / 2 + 100)
const ease = Easing.bezier(0.45, 0, 0.2, 1)
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

/** Mapa de tempos (fotogramas a 30 fps). */
const T = {
  reveal: [0, 26],
  click: 44,
  type: [48, 96],
  send: 104,
  answer: [110, 150],
  toPriority: [150, 178],
  thread: [182, 204],
  open: [196, 228],
  shows: [222, 252],
  recs: [246, 268],
  focus: [262, 280],
  end: 300,
}

/**
 * Amostra do Vídeo A (≈ 10 s): pergunta na Finer Home → resposta → faturas por
 * receber → a linha azul conduz ao Finer Advisor → o que os dados mostram →
 * recomendação em destaque. Enquadramentos apertados para ser legível na
 * janela lateral da homepage.
 */
export function HeroSample() {
  const frame = useCurrentFrame()
  const homeRoot = useRef<HTMLDivElement>(null)
  const advRoot = useRef<HTMLDivElement>(null)
  const h = useAnchors(homeRoot)
  const a = useAnchors(advRoot)

  const ask = h['ask-input']
  const send = h['ask-send']
  const pri = h['priority']

  // Guião da Finer Home
  const typedQ = Math.round(interpolate(frame, T.type, [0, QUESTION.length], clamp))
  const words = Math.round(interpolate(frame, T.answer, [0, WORDS.length], clamp))
  const typedA = words === 0 ? 0 : WORDS.slice(0, words).join(' ').length

  // Câmara da Finer Home
  const askFocus = { x: ask ? ask.cx : WIDE.x, y: ask ? ask.cy + 70 : WIDE.y }
  const priFocus = { x: pri ? pri.x + pri.w * 0.55 : WIDE.x, y: pri ? pri.cy + 10 : WIDE.y }
  const homeShots: Shot[] = [
    { f: 0, s: 1.6, ...askFocus },
    { f: 100, s: 1.72, ...askFocus },
    // A resposta ocupa a largura do cartão: plano um pouco mais aberto e à esquerda
    { f: T.answer[0] + 6, s: 1.42, x: askFocus.x - 110, y: askFocus.y + 60 },
    { f: T.answer[1], s: 1.42, x: askFocus.x - 110, y: askFocus.y + 80 },
    { f: T.toPriority[1], s: 1.95, ...priFocus },
    { f: T.end, s: 2.0, ...priFocus },
  ]
  const homeCam = cameraAt(frame, homeShots)

  // Câmara do Finer Advisor (painel de detalhe, zona das conclusões)
  const shows = a['adv-shows']
  const rec0 = a['adv-rec-0']
  const advShots: Shot[] = [
    { f: T.open[0], s: 1.85, x: shows ? shows.cx : WIDE.x, y: shows ? shows.cy : WIDE.y },
    { f: T.recs[0], s: 1.8, x: shows ? shows.cx : WIDE.x, y: shows ? shows.y + shows.h + 40 : WIDE.y },
    { f: T.end, s: 1.9, x: rec0 ? rec0.cx : WIDE.x, y: rec0 ? rec0.cy - 40 : WIDE.y },
  ]
  const advCam = cameraAt(frame, advShots)

  // Revelação inicial pela linha azul
  const bx = beamX(frame, T.reveal[0], T.reveal[1])

  // Fio narrativo: do valor por receber até ao ponto onde se abre o Advisor
  const from = pri ? toStage(homeCam, pri.x + pri.w * 0.62, pri.cy) : { x: 900, y: 540 }
  const to = { x: WIDTH * 0.86, y: HEIGHT * 0.42 }
  const threadDraw = interpolate(frame, T.thread, [1, 0], { ...clamp, easing: ease })
  const threadFade = interpolate(frame, [T.open[1] - 6, T.open[1] + 10], [1, 0], clamp)
  const maxR = Math.hypot(WIDTH, HEIGHT)
  const radius = interpolate(frame, T.open, [0, maxR], { ...clamp, easing: Easing.bezier(0.55, 0, 0.25, 1) })

  const advDemo = {
    shows: interpolate(frame, T.shows, [0, 4], clamp),
    recs: interpolate(frame, T.recs, [0, 4], clamp),
    focus: interpolate(frame, T.focus, [0, 1], clamp),
  }

  const cursorHome = [
    { f: 20, x: ask ? ask.x + ask.w * 0.62 : 900, y: ask ? ask.cy + 120 : 400 },
    { f: 40, x: ask ? ask.x + 90 : 600, y: ask ? ask.cy : 300 },
    { f: T.click, x: ask ? ask.x + 90 : 600, y: ask ? ask.cy : 300, click: true },
    { f: 60, x: ask ? ask.x + 130 : 640, y: ask ? ask.cy + 60 : 360 },
    { f: 98, x: send ? send.cx - 6 : 900, y: send ? send.cy + 4 : 300 },
    { f: T.send, x: send ? send.cx - 6 : 900, y: send ? send.cy + 4 : 300, click: true },
    { f: 140, x: send ? send.cx + 40 : 940, y: send ? send.cy + 120 : 420 },
  ]

  const layer = (cam: { s: number; x: number; y: number }, children: ReactNode) => (
    <div style={{ position: 'absolute', left: 0, top: 0, width: CANVAS_W, height: CANVAS_H, transformOrigin: '0 0', transform: cameraTransform(cam) }}>{children}</div>
  )

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      {/* Finer Home */}
      <AbsoluteFill style={{ clipPath: `polygon(0 0, ${bx + SKEW}px 0, ${bx - SKEW}px 100%, 0 100%)` }}>
        {layer(
          homeCam,
          <div ref={homeRoot} style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, overflow: 'hidden' }}>
            <AppShell view="home" className="min-h-[900px]">
              <FinerHomeView interactive={false} script={{ question: QUESTION, typedQ, answer: ANSWER, typedA }} />
            </AppShell>
            <Highlight frame={frame} rect={pri} from={T.toPriority[0] + 10} to={T.open[1]} pad={10} radius={12} />
            <Cursor frame={frame} path={cursorHome} visible={[20, 150]} />
          </div>,
        )}
      </AbsoluteFill>

      {/* Finer Advisor, aberto por uma máscara circular a partir do fim da linha */}
      <AbsoluteFill style={{ clipPath: `circle(${radius}px at ${to.x}px ${to.y}px)` }}>
        <AbsoluteFill style={{ backgroundColor: '#F7F9FE' }} />
        {layer(
          advCam,
          <div ref={advRoot} style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, overflow: 'hidden' }}>
            <AppShell view="advisor" className="min-h-[900px]">
              <FinerAdvisorView demo={advDemo} />
            </AppShell>
            <Highlight frame={frame} rect={rec0} from={T.focus[0]} to={T.end + 20} pad={4} radius={10} />
          </div>,
        )}
      </AbsoluteFill>

      {/* Fio narrativo + orla luminosa da máscara */}
      <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="thread" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0052FF" />
            <stop offset="1" stopColor="#9FD3FF" />
          </linearGradient>
          <filter id="thread-glow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {frame >= T.thread[0] && (
          <g opacity={threadFade}>
            <path
              d={`M ${from.x} ${from.y} C ${from.x + 260} ${from.y}, ${to.x - 220} ${to.y}, ${to.x} ${to.y}`}
              pathLength={1}
              stroke="url(#thread)"
              strokeWidth={12}
              opacity={0.5}
              filter="url(#thread-glow)"
              fill="none"
              strokeLinecap="round"
              style={{ strokeDasharray: 1, strokeDashoffset: threadDraw }}
            />
            <path
              d={`M ${from.x} ${from.y} C ${from.x + 260} ${from.y}, ${to.x - 220} ${to.y}, ${to.x} ${to.y}`}
              pathLength={1}
              stroke="url(#thread)"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              style={{ strokeDasharray: 1, strokeDashoffset: threadDraw }}
            />
            {threadDraw < 0.05 && <circle cx={to.x} cy={to.y} r={7} fill="#FFFFFF" style={{ filter: 'drop-shadow(0 0 10px #1E90FF)' }} />}
          </g>
        )}
        {radius > 0 && radius < maxR - 1 && (
          <circle cx={to.x} cy={to.y} r={radius} fill="none" stroke="#1E90FF" strokeWidth={3} opacity={0.85} style={{ filter: 'drop-shadow(0 0 14px rgba(30,144,255,0.9))' }} />
        )}
      </svg>

      <Beam x={bx} />
    </AbsoluteFill>
  )
}
